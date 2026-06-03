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
    public class ApprovalController : Controller
    {
        private readonly PimsDbContext _context;

        public ApprovalController(PimsDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            ViewBag.CurrentUser = currentUser;

            // Fetch projects that are pending Governor approval
            var pendingProjects = await _context.Projects
                .Where(p => p.Status == "Submitted")
                .OrderByDescending(p => p.DateCreated)
                .ToListAsync();

            return View(pendingProjects);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ProcessApproval(int projectId, string actionType, string remarks)
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            if (currentUser.Role != "Governor")
            {
                TempData["ErrorMessage"] = "Access Denied: Only the Governor can approve or reject projects.";
                return RedirectToAction("Index");
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound();
            }

            if (project.Status != "Submitted")
            {
                TempData["ErrorMessage"] = "Project is not in a submittable state for Governor approval.";
                return RedirectToAction("Index");
            }

            string newStatus;
            string decision;

            if (actionType == "Approve")
            {
                newStatus = "ApprovedGovernor";
                decision = "Approved";
            }
            else
            {
                newStatus = "RejectedGovernor";
                decision = "Rejected";
            }

            // Update Project Status
            project.Status = newStatus;
            _context.Projects.Update(project);

            // Record Approval Record
            var approval = new Approval
            {
                ProjectId = projectId,
                ApprovedBy = currentUser.Name,
                Status = decision,
                Remarks = string.IsNullOrEmpty(remarks) ? $"Project {decision} by Governor." : remarks,
                Date = DateTime.UtcNow
            };
            _context.Approvals.Add(approval);

            // Create Workflow Log
            var log = new WorkflowLog
            {
                ProjectId = projectId,
                StepName = $"Governor {decision}",
                UpdatedBy = currentUser.Name,
                Status = newStatus,
                Remarks = string.IsNullOrEmpty(remarks) ? $"Project {decision.ToLower()} and moved to next stage." : remarks,
                Timestamp = DateTime.UtcNow,
                ResponsibleRole = "Governor"
            };
            _context.WorkflowLogs.Add(log);

            await _context.SaveChangesAsync();
            TempData["SuccessMessage"] = $"Project was successfully {decision.ToLower()}!";

            return RedirectToAction("Index");
        }
    }
}
