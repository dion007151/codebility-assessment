using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    [Table("WorkflowLogs")]
    public class WorkflowLog
    {
        [Key]
        public int LogId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [Required]
        [StringLength(100)]
        public string StepName { get; set; } = string.Empty; // e.g. "Governor Approval", "Budget Validation"

        [Required]
        [StringLength(100)]
        public string UpdatedBy { get; set; } = string.Empty; // User name

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty; // Status after step

        [StringLength(500)]
        public string Remarks { get; set; } = string.Empty;

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(50)]
        public string ResponsibleRole { get; set; } = string.Empty; // Role of actor who performed step
    }
}
