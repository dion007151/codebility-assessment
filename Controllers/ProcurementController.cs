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
    public class ProcurementController : Controller
    {
        private readonly PimsDbContext _context;

        public ProcurementController(PimsDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            ViewBag.CurrentUser = currentUser;

            // Fetch projects that are in BudgetApproved (ready for bidding) or ProcurementBidding (bidding in progress)
            var procurementProjects = await _context.Projects
                .Where(p => p.Status == "BudgetApproved" || p.Status == "ProcurementBidding")
                .OrderByDescending(p => p.DateCreated)
                .ToListAsync();

            return View(procurementProjects);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> StartBidding(int projectId)
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            if (currentUser.Role != "BAC")
            {
                TempData["ErrorMessage"] = "Access Denied: Only Bids and Awards Committee (BAC) can start bidding.";
                return RedirectToAction("Index");
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound();
            }

            if (project.Status != "BudgetApproved")
            {
                TempData["ErrorMessage"] = "Bidding can only be started for Budget Approved projects.";
                return RedirectToAction("Index");
            }

            project.Status = "ProcurementBidding";
            _context.Projects.Update(project);

            var log = new WorkflowLog
            {
                ProjectId = projectId,
                StepName = "Bidding Initiated",
                UpdatedBy = currentUser.Name,
                Status = "ProcurementBidding",
                Remarks = "BAC opened procurement bids and invited suppliers.",
                Timestamp = DateTime.UtcNow,
                ResponsibleRole = "BAC"
            };
            _context.WorkflowLogs.Add(log);

            await _context.SaveChangesAsync();
            TempData["SuccessMessage"] = "Bidding process successfully initiated.";

            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AwardProcurement(int projectId, string supplier, string remarks)
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            if (currentUser.Role != "BAC")
            {
                TempData["ErrorMessage"] = "Access Denied: Only BAC can award procurements.";
                return RedirectToAction("Index");
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound();
            }

            if (project.Status != "ProcurementBidding" && project.Status != "BudgetApproved")
            {
                TempData["ErrorMessage"] = "Project is not in a valid bidding state.";
                return RedirectToAction("Index");
            }

            if (string.IsNullOrEmpty(supplier))
            {
                TempData["ErrorMessage"] = "Please specify the winning supplier.";
                return RedirectToAction("Index");
            }

            project.Status = "ProcurementAwarded";
            _context.Projects.Update(project);

            // Record Procurement Entry
            var procurement = new Procurement
            {
                ProjectId = projectId,
                Supplier = supplier,
                Status = "Awarded",
                BACRemarks = string.IsNullOrEmpty(remarks) ? $"Procurement awarded to {supplier} by BAC." : remarks,
                Date = DateTime.UtcNow
            };
            _context.Procurements.Add(procurement);

            // Create Workflow Log
            var log = new WorkflowLog
            {
                ProjectId = projectId,
                StepName = "Procurement Awarded",
                UpdatedBy = currentUser.Name,
                Status = "ProcurementAwarded",
                Remarks = $"Contract awarded to '{supplier}'. Remarks: {remarks}",
                Timestamp = DateTime.UtcNow,
                ResponsibleRole = "BAC"
            };
            _context.WorkflowLogs.Add(log);

            await _context.SaveChangesAsync();
            TempData["SuccessMessage"] = $"Procurement successfully awarded to {supplier}!";

            return RedirectToAction("Index");
        }
    }
}
