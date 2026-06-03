using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PimsApp.Data;
using PimsApp.Helpers;
using PimsApp.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PimsApp.Controllers
{
    public class FinanceController : Controller
    {
        private readonly PimsDbContext _context;

        public FinanceController(PimsDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            ViewBag.CurrentUser = currentUser;

            // Fetch projects pending Voucher Generation (status = ProcurementAwarded)
            var pendingVouchers = await _context.Projects
                .Where(p => p.Status == "ProcurementAwarded")
                .OrderByDescending(p => p.DateCreated)
                .ToListAsync();

            // Fetch vouchers pending Payment release (status = VoucherGenerated)
            var pendingPayments = await _context.Vouchers
                .Include(v => v.Project)
                .Where(v => v.Project!.Status == "VoucherGenerated")
                .OrderByDescending(v => v.Date)
                .ToListAsync();

            ViewBag.PendingVouchers = pendingVouchers;
            ViewBag.PendingPayments = pendingPayments;

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> GenerateVoucher(int projectId, string remarks)
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            if (currentUser.Role != "Accountant")
            {
                TempData["ErrorMessage"] = "Access Denied: Only Accountants can generate vouchers.";
                return RedirectToAction("Index");
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound();
            }

            if (project.Status != "ProcurementAwarded")
            {
                TempData["ErrorMessage"] = "Project is not in a valid state for voucher generation.";
                return RedirectToAction("Index");
            }

            project.Status = "VoucherGenerated";
            _context.Projects.Update(project);

            // Record Voucher
            var voucher = new Voucher
            {
                ProjectId = projectId,
                Amount = project.Amount,
                GeneratedBy = currentUser.Name,
                Date = DateTime.UtcNow
            };
            _context.Vouchers.Add(voucher);

            // Create Workflow Log
            var log = new WorkflowLog
            {
                ProjectId = projectId,
                StepName = "Voucher Generated",
                UpdatedBy = currentUser.Name,
                Status = "VoucherGenerated",
                Remarks = string.IsNullOrEmpty(remarks) ? $"Voucher issued for the amount of {project.Amount:C2}." : remarks,
                Timestamp = DateTime.UtcNow,
                ResponsibleRole = "Accountant"
            };
            _context.WorkflowLogs.Add(log);

            await _context.SaveChangesAsync();
            TempData["SuccessMessage"] = $"Voucher successfully generated for {project.Amount:C2}!";

            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ProcessPayment(int voucherId, string remarks)
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            if (currentUser.Role != "Treasurer")
            {
                TempData["ErrorMessage"] = "Access Denied: Only the Treasurer can release funds.";
                return RedirectToAction("Index");
            }

            var voucher = await _context.Vouchers
                .Include(v => v.Project)
                .FirstOrDefaultAsync(v => v.VoucherId == voucherId);

            if (voucher == null || voucher.Project == null)
            {
                return NotFound();
            }

            if (voucher.Project.Status != "VoucherGenerated")
            {
                TempData["ErrorMessage"] = "Payment has already been processed or is not ready.";
                return RedirectToAction("Index");
            }

            // Update Project Status
            voucher.Project.Status = "PaymentCompleted";
            _context.Projects.Update(voucher.Project);

            // Record Payment
            var payment = new Payment
            {
                VoucherId = voucherId,
                Amount = voucher.Amount,
                Status = "Paid",
                Treasurer = currentUser.Name,
                Date = DateTime.UtcNow
            };
            _context.Payments.Add(payment);

            // Create Workflow Log
            var log = new WorkflowLog
            {
                ProjectId = voucher.ProjectId,
                StepName = "Payment Released",
                UpdatedBy = currentUser.Name,
                Status = "PaymentCompleted",
                Remarks = string.IsNullOrEmpty(remarks) ? "Check issued and payment completed successfully." : remarks,
                Timestamp = DateTime.UtcNow,
                ResponsibleRole = "Treasurer"
            };
            _context.WorkflowLogs.Add(log);

            await _context.SaveChangesAsync();
            TempData["SuccessMessage"] = $"Payment of {voucher.Amount:C2} successfully released and completed!";

            return RedirectToAction("Index");
        }
    }
}
