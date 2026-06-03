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
    public class ProjectController : Controller
    {
        private readonly PimsDbContext _context;

        public ProjectController(PimsDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            ViewBag.CurrentUser = currentUser;

            var projects = await _context.Projects
                .OrderByDescending(p => p.DateCreated)
                .ToListAsync();

            return View(projects);
        }

        public async Task<IActionResult> Details(int id)
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            ViewBag.CurrentUser = currentUser;

            var project = await _context.Projects
                .Include(p => p.Department)
                .Include(p => p.Approvals)
                .Include(p => p.BudgetValidations)
                .Include(p => p.Procurements)
                    .ThenInclude(pr => pr.Contractor)
                .Include(p => p.Procurements)
                    .ThenInclude(pr => pr.ProcurementDocuments)
                .Include(p => p.Vouchers)
                .Include(p => p.WorkflowLogs)
                .Include(p => p.ProjectStages)
                .Include(p => p.ProjectDocuments)
                .Include(p => p.TechnicalDocuments)
                .Include(p => p.CashCertifications)
                .Include(p => p.ProjectMonitorings)
                .FirstOrDefaultAsync(p => p.ProjectId == id);

            if (project == null)
            {
                return NotFound();
            }

            // Order logs by date ascending for sequential timeline tracking
            ViewBag.WorkflowLogs = project.WorkflowLogs?.OrderBy(l => l.Timestamp).ToList();

            return View(project);
        }

        public IActionResult Create()
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            ViewBag.CurrentUser = currentUser;

            if (currentUser.Role != "OPPDC")
            {
                TempData["ErrorMessage"] = "Only OPPDC role can encode new project data.";
                return RedirectToAction("Index");
            }

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Project project, string actionType)
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            ViewBag.CurrentUser = currentUser;

            if (currentUser.Role != "OPPDC")
            {
                TempData["ErrorMessage"] = "Access Denied: Only OPPDC can encode projects.";
                return RedirectToAction("Index");
            }

            if (ModelState.IsValid)
            {
                project.CreatedBy = currentUser.Name;
                project.DateCreated = DateTime.UtcNow;
                
                if (actionType == "Submit")
                {
                    project.Status = "Submitted";
                }
                else
                {
                    project.Status = "Draft";
                }

                _context.Projects.Add(project);
                await _context.SaveChangesAsync();

                // Create initial workflow log
                var draftLog = new WorkflowLog
                {
                    ProjectId = project.ProjectId,
                    StepName = "Project Draft Created",
                    UpdatedBy = currentUser.Name,
                    Status = "Draft",
                    Remarks = "Project profile initialized and encoded.",
                    Timestamp = DateTime.UtcNow,
                    ResponsibleRole = "OPPDC"
                };
                _context.WorkflowLogs.Add(draftLog);

                if (actionType == "Submit")
                {
                    var submitLog = new WorkflowLog
                    {
                        ProjectId = project.ProjectId,
                        StepName = "Proposal Submitted",
                        UpdatedBy = currentUser.Name,
                        Status = "Submitted",
                        Remarks = "Submitted to the Governor for approval.",
                        Timestamp = DateTime.UtcNow.AddSeconds(1),
                        ResponsibleRole = "OPPDC"
                    };
                    _context.WorkflowLogs.Add(submitLog);
                }

                await _context.SaveChangesAsync();
                TempData["SuccessMessage"] = actionType == "Submit" 
                    ? "Project created and submitted to Governor successfully!" 
                    : "Project draft saved successfully!";

                return RedirectToAction("Index");
            }

            return View(project);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Submit(int id)
        {
            var currentUser = SessionHelper.GetCurrentUser(HttpContext.Session, _context);
            if (currentUser.Role != "OPPDC")
            {
                TempData["ErrorMessage"] = "Access Denied: Only OPPDC can submit projects.";
                return RedirectToAction("Details", new { id });
            }

            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound();
            }

            if (project.Status != "Draft" && project.Status != "BudgetRevisionRequired" && project.Status != "RejectedGovernor")
            {
                TempData["ErrorMessage"] = "Only Draft, Budget Revision Required, or Governor Rejected projects can be submitted.";
                return RedirectToAction("Details", new { id });
            }

            string oldStatus = project.Status;
            project.Status = "Submitted";
            _context.Update(project);

            var log = new WorkflowLog
            {
                ProjectId = project.ProjectId,
                StepName = "Proposal Submitted",
                UpdatedBy = currentUser.Name,
                Status = "Submitted",
                Remarks = oldStatus == "Draft" 
                    ? "Submitted to the Governor for approval." 
                    : $"Resubmitted to the Governor for approval after revision/rejection (previous status: {oldStatus}).",
                Timestamp = DateTime.UtcNow,
                ResponsibleRole = "OPPDC"
            };
            _context.WorkflowLogs.Add(log);

            await _context.SaveChangesAsync();
            TempData["SuccessMessage"] = "Project submitted to Governor successfully!";

            return RedirectToAction("Details", new { id });
        }
    }
}
