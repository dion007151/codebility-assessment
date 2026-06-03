using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    public class Project
    {
        [Key]
        public int ProjectId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Draft"; // Draft, Submitted, ApprovedGovernor, RejectedGovernor, BudgetApproved, BudgetRevisionRequired, ProcurementBidding, ProcurementAwarded, VoucherGenerated, PaymentCompleted

        [Required]
        [StringLength(100)]
        public string CreatedBy { get; set; } = string.Empty;

        [Required]
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string? AipCode { get; set; }

        public int? DepartmentId { get; set; }

        [ForeignKey("DepartmentId")]
        public virtual Department? Department { get; set; }

        // Navigation Properties for Workflow Tracking
        public virtual ICollection<Approval>? Approvals { get; set; }
        public virtual ICollection<BudgetValidation>? BudgetValidations { get; set; }
        public virtual ICollection<Procurement>? Procurements { get; set; }
        public virtual ICollection<Voucher>? Vouchers { get; set; }
        public virtual ICollection<WorkflowLog>? WorkflowLogs { get; set; }

        // Expanded ERD/DFD Relations
        public virtual ICollection<ProjectStage>? ProjectStages { get; set; }
        public virtual ICollection<ProjectDocument>? ProjectDocuments { get; set; }
        public virtual ICollection<TechnicalDocument>? TechnicalDocuments { get; set; }
        public virtual ICollection<CashCertification>? CashCertifications { get; set; }
        public virtual ICollection<ProjectMonitoring>? ProjectMonitorings { get; set; }
    }
}
