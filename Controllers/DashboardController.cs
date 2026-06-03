using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PimsApp.Data;
using PimsApp.Helpers;
using PimsApp.Models;
using System.Linq;
using System.Threading.Tasks;

namespace PimsApp.Controllers
{
    public class DashboardController : Controller
    {
        private readonly PimsDbContext _context;

        public DashboardController(PimsDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            // Ensure session is initialized
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            ViewBag.CurrentUser = currentUser;

            // Fetch metrics
            var totalProjects = await _context.Projects.CountAsync();
            var totalAmount = (await _context.Projects.ToListAsync()).Sum(p => p.Amount);

            // Total validated budget amount
            var totalApprovedBudget = (await _context.BudgetValidations
                .Where(b => b.Status == "Approved")
                .ToListAsync()).Sum(b => b.AmountApproved);

            // Total paid payments released
            var totalPaymentsDisbursed = (await _context.Payments
                .Where(p => p.Status == "Paid")
                .ToListAsync()).Sum(p => p.Amount);

            // Count pending items based on role
            var pendingGovernorCount = await _context.Projects.CountAsync(p => p.Status == "Submitted");
            var pendingBudgetCount = await _context.Projects.CountAsync(p => p.Status == "ApprovedGovernor" || p.Status == "BudgetRevisionRequired");
            var pendingProcurementCount = await _context.Projects.CountAsync(p => p.Status == "BudgetApproved" || p.Status == "ProcurementBidding");
            var pendingVouchersCount = await _context.Projects.CountAsync(p => p.Status == "ProcurementAwarded");
            var pendingPaymentsCount = await _context.Projects.CountAsync(p => p.Status == "VoucherGenerated");

            ViewBag.TotalProjects = totalProjects;
            ViewBag.TotalAmount = totalAmount;
            ViewBag.TotalApprovedBudget = totalApprovedBudget;
            ViewBag.TotalPaymentsDisbursed = totalPaymentsDisbursed;

            ViewBag.PendingGovernorCount = pendingGovernorCount;
            ViewBag.PendingBudgetCount = pendingBudgetCount;
            ViewBag.PendingProcurementCount = pendingProcurementCount;
            ViewBag.PendingVouchersCount = pendingVouchersCount;
            ViewBag.PendingPaymentsCount = pendingPaymentsCount;

            // Projects and logs list
            var projects = await _context.Projects
                .OrderByDescending(p => p.DateCreated)
                .Take(10)
                .ToListAsync();

            var recentLogs = await _context.WorkflowLogs
                .OrderByDescending(l => l.Timestamp)
                .Take(8)
                .ToListAsync();

            ViewBag.RecentLogs = recentLogs;

            return View(projects);
        }

        [HttpPost]
        public IActionResult SwitchRole(string role, string returnUrl)
        {
            SessionHelper.SwitchRole(HttpContext.Session, role, _context);
            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            return RedirectToAction("Index");
        }
    }
}
