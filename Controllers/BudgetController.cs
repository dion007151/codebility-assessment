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
    public class BudgetController : Controller
    {
        private readonly PimsDbContext _context;

        public BudgetController(PimsDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            ViewBag.CurrentUser = currentUser;

            // Fetch projects that are waiting for Budget validation
            var pendingProjects = await _context.Projects
                .Where(p => p.Status == "ApprovedGovernor" || p.Status == "BudgetRevisionRequired")
                .OrderByDescending(p => p.DateCreated)
                .ToListAsync();

            return View(pendingProjects);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ProcessBudget(int projectId, decimal amountApproved, string actionType, string remarks)
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            if (currentUser.Role != "Budget")
            {
                TempData["ErrorMessage"] = "Access Denied: Only the Budget Office can validate budget allocations.";
                return RedirectToAction("Index");
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound();
            }

            if (project.Status != "ApprovedGovernor" && project.Status != "BudgetRevisionRequired")
            {
                TempData["ErrorMessage"] = "Project is not in a valid state for budget validation.";
                return RedirectToAction("Index");
            }

            string newStatus;
            string decision;

            if (actionType == "Approve")
            {
                newStatus = "BudgetApproved";
                decision = "Approved";

                if (amountApproved <= 0)
                {
                    TempData["ErrorMessage"] = "Approved budget amount must be greater than zero.";
                    return RedirectToAction("Index");
                }
            }
            else
            {
                newStatus = "BudgetRevisionRequired";
                decision = "RevisionRequired";
            }

            // Update Project Status
            project.Status = newStatus;
            _context.Projects.Update(project);

            // Record Budget Validation Record
            var budgetVal = new BudgetValidation
            {
                ProjectId = projectId,
                AmountApproved = actionType == "Approve" ? amountApproved : 0m,
                Status = decision,
                BudgetOfficer = currentUser.Name,
                Remarks = string.IsNullOrEmpty(remarks) ? $"Budget {decision} by Budget Officer." : remarks,
                Date = DateTime.UtcNow
            };
            _context.BudgetValidations.Add(budgetVal);

            // Create Workflow Log
            var log = new WorkflowLog
            {
                ProjectId = projectId,
                StepName = actionType == "Approve" ? "Budget Validated" : "Budget Revision Requested",
                UpdatedBy = currentUser.Name,
                Status = newStatus,
                Remarks = string.IsNullOrEmpty(remarks) ? $"Budget {decision.ToLower()} by Budget Office." : remarks,
                Timestamp = DateTime.UtcNow,
                ResponsibleRole = "Budget"
            };
            _context.WorkflowLogs.Add(log);

            await _context.SaveChangesAsync();
            TempData["SuccessMessage"] = actionType == "Approve"
                ? $"Budget validated and approved for {amountApproved:C2} successfully!"
                : "Project budget allocation sent back for revision.";

            return RedirectToAction("Index");
        }
    }
}
