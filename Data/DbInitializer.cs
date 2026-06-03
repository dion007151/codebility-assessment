using PimsApp.Models;
using System;
using System.Linq;

namespace PimsApp.Data
{
    public static class DbInitializer
    {
        public static void Seed(PimsDbContext context)
        {
            // Only seed if empty
            if (context.Users.Any()) return;

            var now = new DateTime(2026, 5, 21, 10, 0, 0, DateTimeKind.Utc);

            // ── Departments ───────────────────────────────────────────────────
            var departments = new[]
            {
                new Department { DepartmentId = 1, DepartmentName = "Office of the Provincial Planning & Development Coordinator (OPPDC)" },
                new Department { DepartmentId = 2, DepartmentName = "Provincial Engineering Office (PEO)" },
                new Department { DepartmentId = 3, DepartmentName = "Bids and Awards Committee (BAC)" },
                new Department { DepartmentId = 4, DepartmentName = "Provincial Budget Office (PBO)" },
                new Department { DepartmentId = 5, DepartmentName = "Provincial Accounting Office" },
                new Department { DepartmentId = 6, DepartmentName = "Provincial Treasury Office" }
            };
            context.Departments.AddRange(departments);
            context.SaveChanges();

            // ── Contractors ────────────────────────────────────────────────────
            var contractors = new[]
            {
                new Contractor { ContractorId = 1, ContractorName = "BuildStrong Builders", ContactPerson = "Engr. Danilo Ramos", Address = "123 Mabini St, Manila", Phone = "0917-123-4567", Email = "danilo@buildstrong.ph", RegistrationNo = "PCAB-2023-0012", Status = "Active" },
                new Contractor { ContractorId = 2, ContractorName = "TechSolutions Corp", ContactPerson = "Clara Valdez", Address = "456 Ayala Ave, Makati", Phone = "0918-987-6543", Email = "clara@techsolutions.ph", RegistrationNo = "SEC-2022-9988", Status = "Active" },
                new Contractor { ContractorId = 3, ContractorName = "Prime Waterways & Infra Group", ContactPerson = "Mark Anthony", Address = "789 Shaw Blvd, Pasig", Phone = "0915-444-5555", Email = "contact@primeinfragroup.ph", RegistrationNo = "PCAB-2024-0345", Status = "Active" }
            };
            context.Contractors.AddRange(contractors);
            context.SaveChanges();

            // ── Users ──────────────────────────────────────────────────────────
            var users = new[]
            {
                new User { UserId = 1, Name = "Juan Dela Cruz",   Email = "gov@pims.gov.ph",        Password = "password123", Role = "Governor"   },
                new User { UserId = 2, Name = "Maria Santos",     Email = "oppdc@pims.gov.ph",      Password = "password123", Role = "OPPDC"       },
                new User { UserId = 3, Name = "Roberto Reyes",    Email = "budget@pims.gov.ph",     Password = "password123", Role = "Budget"      },
                new User { UserId = 4, Name = "Arthur Pendragon", Email = "bac@pims.gov.ph",        Password = "password123", Role = "BAC"         },
                new User { UserId = 5, Name = "Clara Soriano",    Email = "accountant@pims.gov.ph", Password = "password123", Role = "Accountant"  },
                new User { UserId = 6, Name = "Leonora Diaz",     Email = "treasurer@pims.gov.ph",  Password = "password123", Role = "Treasurer"   },
            };
            context.Users.AddRange(users);
            context.SaveChanges();

            // ── Projects ───────────────────────────────────────────────────────
            var projects = new[]
            {
                new Project { ProjectId = 1, Title = "Barangay Health Center Renovation",   Description = "Upgrade medical equipment, repaint the facility, and install solar-powered lighting.", Amount = 150000.00m,   Status = "Draft",               CreatedBy = "Maria Santos", DateCreated = now.AddDays(-10), AipCode = "AIP-2026-MED-001", DepartmentId = 1 },
                new Project { ProjectId = 2, Title = "Provincial Road Rehabilitation Phase 1", Description = "Asphalting of 5km rural road connecting agricultural farms to the municipal marketplace.", Amount = 2500000.00m, Status = "Submitted",           CreatedBy = "Maria Santos", DateCreated = now.AddDays(-8),  AipCode = "AIP-2026-ROD-002", DepartmentId = 2 },
                new Project { ProjectId = 3, Title = "Water System Installation in San Jose", Description = "Provision of clean piping network and filtration tanks for 500 households.", Amount = 850000.00m,   Status = "ApprovedGovernor",    CreatedBy = "Maria Santos", DateCreated = now.AddDays(-7),  AipCode = "AIP-2026-WTR-003", DepartmentId = 2 },
                new Project { ProjectId = 4, Title = "Public Market Solar Power Grid",      Description = "Installation of 50kW grid-tied solar system to reduce electricity expenses of the public market.", Amount = 1200000.00m, Status = "BudgetApproved",      CreatedBy = "Maria Santos", DateCreated = now.AddDays(-6),  AipCode = "AIP-2026-POW-004", DepartmentId = 1 },
                new Project { ProjectId = 5, Title = "Smart Education Tablets for Students", Description = "Procurement of 300 tablets loaded with offline learning modules for remote high schools.", Amount = 900000.00m,   Status = "ProcurementAwarded",  CreatedBy = "Maria Santos", DateCreated = now.AddDays(-5),  AipCode = "AIP-2026-EDU-005", DepartmentId = 1 },
                new Project { ProjectId = 6, Title = "Municipal Sports Complex Construction", Description = "Development of a multipurpose covered court and sports track to promote physical activities.", Amount = 5000000.00m, Status = "PaymentCompleted",    CreatedBy = "Maria Santos", DateCreated = now.AddDays(-15), AipCode = "AIP-2026-SPT-006", DepartmentId = 2 },
            };
            context.Projects.AddRange(projects);
            context.SaveChanges();

            // ── Approvals ──────────────────────────────────────────────────────
            context.Approvals.AddRange(
                new Approval { ApprovalId = 1, ProjectId = 3, ApprovedBy = "Juan Dela Cruz", Status = "Approved", Remarks = "Crucial water infrastructure. Highly approved.", Date = now.AddDays(-6)  },
                new Approval { ApprovalId = 2, ProjectId = 4, ApprovedBy = "Juan Dela Cruz", Status = "Approved", Remarks = "Approved, forward to Budget Office.",           Date = now.AddDays(-5)  },
                new Approval { ApprovalId = 3, ProjectId = 5, ApprovedBy = "Juan Dela Cruz", Status = "Approved", Remarks = "Approved for school expansion.",                Date = now.AddDays(-4)  },
                new Approval { ApprovalId = 4, ProjectId = 6, ApprovedBy = "Juan Dela Cruz", Status = "Approved", Remarks = "Approved.",                                    Date = now.AddDays(-14) }
            );
            context.SaveChanges();

            // ── Budget Validations ─────────────────────────────────────────────
            context.BudgetValidations.AddRange(
                new BudgetValidation { BudgetId = 1, ProjectId = 4, AmountApproved = 1200000.00m, Status = "Approved", BudgetOfficer = "Roberto Reyes", Remarks = "Funds allocated under Special Development Fund. 1.2M validated.", Date = now.AddDays(-4)  },
                new BudgetValidation { BudgetId = 2, ProjectId = 5, AmountApproved = 900000.00m,  Status = "Approved", BudgetOfficer = "Roberto Reyes", Remarks = "Approved full amount.",                                          Date = now.AddDays(-3)  },
                new BudgetValidation { BudgetId = 3, ProjectId = 6, AmountApproved = 5000000.00m, Status = "Approved", BudgetOfficer = "Roberto Reyes", Remarks = "Fully funded.",                                                  Date = now.AddDays(-13) }
            );
            context.SaveChanges();

            // ── Procurements ───────────────────────────────────────────────────
            var procurements = new[]
            {
                new Procurement { ProcurementId = 1, ProjectId = 5, Supplier = "TechSolutions Corp", ContractorId = 2, Status = "Awarded", BACRemarks = "Awarded to TechSolutions Corp after bidding.", Date = now.AddDays(-2) },
                new Procurement { ProcurementId = 2, ProjectId = 6, Supplier = "BuildStrong Builders", ContractorId = 1, Status = "Awarded", BACRemarks = "Awarded to BuildStrong Builders.", Date = now.AddDays(-12) }
            };
            context.Procurements.AddRange(procurements);
            context.SaveChanges();

            // ── Vouchers ───────────────────────────────────────────────────────
            context.Vouchers.Add(
                new Voucher { VoucherId = 1, ProjectId = 6, Amount = 5000000.00m, GeneratedBy = "Clara Soriano", Date = now.AddDays(-11) }
            );
            context.SaveChanges();

            // ── Payments ───────────────────────────────────────────────────────
            context.Payments.Add(
                new Payment { PaymentId = 1, VoucherId = 1, Amount = 5000000.00m, Status = "Paid", Treasurer = "Leonora Diaz", Date = now.AddDays(-10) }
            );
            context.SaveChanges();

            // ── Project Stages ─────────────────────────────────────────────────
            var stages = new[]
            {
                // Project 6 - Complete Stages
                new ProjectStage { ProjectId = 6, StageName = "Proposal Submission", OrderNo = 1, Description = "Project encoded and submitted to Governor", TargetDate = now.AddDays(-15), Status = "Completed" },
                new ProjectStage { ProjectId = 6, StageName = "Executive Review & Endorsement", OrderNo = 2, Description = "Governor review and official approval", TargetDate = now.AddDays(-14), Status = "Completed" },
                new ProjectStage { ProjectId = 6, StageName = "Budget Validation", OrderNo = 3, Description = "Budget Office allocation verification", TargetDate = now.AddDays(-13), Status = "Completed" },
                new ProjectStage { ProjectId = 6, StageName = "BAC Bidding & Procurement", OrderNo = 4, Description = "Competitive bidding process and contract award", TargetDate = now.AddDays(-12), Status = "Completed" },
                new ProjectStage { ProjectId = 6, StageName = "Engineering Construction", OrderNo = 5, Description = "Groundbreaking and ongoing construction monitoring", TargetDate = now.AddDays(-11), Status = "Completed" },
                new ProjectStage { ProjectId = 6, StageName = "Final Payment Clearance", OrderNo = 6, Description = "Treasury payment check release", TargetDate = now.AddDays(-10), Status = "Completed" },

                // Project 5 - Active Stages
                new ProjectStage { ProjectId = 5, StageName = "Proposal Submission", OrderNo = 1, Description = "Project encoded and submitted to Governor", TargetDate = now.AddDays(-5), Status = "Completed" },
                new ProjectStage { ProjectId = 5, StageName = "Executive Review & Endorsement", OrderNo = 2, Description = "Governor review and official approval", TargetDate = now.AddDays(-4), Status = "Completed" },
                new ProjectStage { ProjectId = 5, StageName = "Budget Validation", OrderNo = 3, Description = "Budget Office allocation verification", TargetDate = now.AddDays(-3), Status = "Completed" },
                new ProjectStage { ProjectId = 5, StageName = "BAC Bidding & Procurement", OrderNo = 4, Description = "Competitive bidding process and contract award", TargetDate = now.AddDays(-2), Status = "Completed" },
                new ProjectStage { ProjectId = 5, StageName = "Delivery & Deployment", OrderNo = 5, Description = "Handover of smart tablets to partner high schools", TargetDate = now.AddDays(30), Status = "In Progress" },
                new ProjectStage { ProjectId = 5, StageName = "Final Payment Clearance", OrderNo = 6, Description = "Accounting voucher and treasury release", TargetDate = now.AddDays(45), Status = "Pending" },
            };
            context.ProjectStages.AddRange(stages);

            // ── Project Documents ──────────────────────────────────────────────
            var docList = new[]
            {
                new ProjectDocument { ProjectId = 6, DocType = "Proposal", FileName = "Municipal_Sports_Complex_Proposal.pdf", FilePath = "/documents/proposals/P-006.pdf", UploadedBy = "Maria Santos", UploadedAt = now.AddDays(-15), Remarks = "Initial project scope and proposal specs." },
                new ProjectDocument { ProjectId = 6, DocType = "Ordinance", FileName = "SP_Ordinance_No_2026_14.pdf", FilePath = "/documents/ordinances/ORD-14.pdf", UploadedBy = "Juan Dela Cruz", UploadedAt = now.AddDays(-14), Remarks = "Provincial board ordinance backing." },
                new ProjectDocument { ProjectId = 5, DocType = "Proposal", FileName = "Smart_Education_Tablets_Proposal.pdf", FilePath = "/documents/proposals/P-005.pdf", UploadedBy = "Maria Santos", UploadedAt = now.AddDays(-5), Remarks = "Tablet specs and list of beneficiary schools." }
            };
            context.ProjectDocuments.AddRange(docList);

            // ── Technical Documents ────────────────────────────────────────────
            var techDocs = new[]
            {
                new TechnicalDocument { ProjectId = 6, DocName = "Structural Blueprints & DED", FilePath = "/documents/blueprints/BP-006.dwg", UploadedBy = "Maria Santos", UploadedAt = now.AddDays(-15), Remarks = "Detailed Engineering Design drawings." },
                new TechnicalDocument { ProjectId = 6, DocName = "Program of Works (POW) Cost Breakdown", FilePath = "/documents/pow/POW-006.pdf", UploadedBy = "Maria Santos", UploadedAt = now.AddDays(-15), Remarks = "Approved materials estimate." }
            };
            context.TechnicalDocuments.AddRange(techDocs);

            // ── Procurement Documents ──────────────────────────────────────────
            var procDocs = new[]
            {
                new ProcurementDocument { ProcurementId = 1, DocType = "NOA", FileName = "Notice_of_Award_TechSolutions.pdf", FilePath = "/documents/procurement/NOA-005.pdf", UploadedBy = "Arthur Pendragon", UploadedAt = now.AddDays(-2), Remarks = "Official award notice." },
                new ProcurementDocument { ProcurementId = 2, DocType = "NOA", FileName = "Notice_of_Award_BuildStrong.pdf", FilePath = "/documents/procurement/NOA-006.pdf", UploadedBy = "Arthur Pendragon", UploadedAt = now.AddDays(-12), Remarks = "Official award notice." },
                new ProcurementDocument { ProcurementId = 2, DocType = "NTP", FileName = "Notice_to_Proceed_BuildStrong.pdf", FilePath = "/documents/procurement/NTP-006.pdf", UploadedBy = "Arthur Pendragon", UploadedAt = now.AddDays(-12), Remarks = "Proceed with groundbreaking instructions." },
                new ProcurementDocument { ProcurementId = 2, DocType = "Contract", FileName = "Bidding_Contract_BuildStrong.pdf", FilePath = "/documents/procurement/Contract-006.pdf", UploadedBy = "Arthur Pendragon", UploadedAt = now.AddDays(-12), Remarks = "Executed infrastructure contract agreement." }
            };
            context.ProcurementDocuments.AddRange(procDocs);

            // ── Cash Certifications ────────────────────────────────────────────
            var cashCerts = new[]
            {
                new CashCertification { ProjectId = 6, AmountCertified = 5000000.00m, CertifiedBy = "Leonora Diaz", CertifiedAt = now.AddDays(-11), Remarks = "Cash availability certified from treasury infrastructure account reserves." }
            };
            context.CashCertifications.AddRange(cashCerts);

            // ── Project Monitoring ─────────────────────────────────────────────
            var monitorings = new[]
            {
                new ProjectMonitoring { ProjectId = 6, InspectionDate = now.AddDays(-11), InspectedBy = "PEO Engineer Ramos", ProgressPercent = 50, Status = "On Track", Remarks = "Excavations, structural foundation, and concrete columns complete.", CreatedAt = now.AddDays(-11) },
                new ProjectMonitoring { ProjectId = 6, InspectionDate = now.AddDays(-10), InspectedBy = "PEO Inspector Santos", ProgressPercent = 100, Status = "Completed", Remarks = "Final roofing, wiring, and paint jobs finished. Structure completely ready.", CreatedAt = now.AddDays(-10) }
            };
            context.ProjectMonitorings.AddRange(monitorings);

            // ── Audit Logs ─────────────────────────────────────────────────────
            var auditLogs = new[]
            {
                new AuditLog { UserId = 2, Action = "Create Project Proposal", TableName = "Projects", RecordId = 1, OldValues = "", NewValues = "Title: Barangay Health Center Renovation, Amount: 150000.00", CreatedAt = now.AddDays(-10), IpAddress = "192.168.10.12" },
                new AuditLog { UserId = 1, Action = "Executive Endorsement", TableName = "Approvals", RecordId = 1, OldValues = "", NewValues = "Approved: Project 3, Status: Approved", CreatedAt = now.AddDays(-6), IpAddress = "192.168.10.5" }
            };
            context.AuditLogs.AddRange(auditLogs);

            context.SaveChanges();
        }
    }
}
