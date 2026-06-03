using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    public class Approval
    {
        [Key]
        public int ApprovalId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [Required]
        [StringLength(100)]
        public string ApprovedBy { get; set; } = string.Empty; // Governor name

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty; // Approved, Rejected

        [StringLength(500)]
        public string Remarks { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; } = DateTime.UtcNow;
    }
}
