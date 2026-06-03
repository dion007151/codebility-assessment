using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    [Table("BudgetValidation")]
    public class BudgetValidation
    {
        [Key]
        public int BudgetId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Approved budget must be greater than zero.")]
        public decimal AmountApproved { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty; // Approved, RevisionRequired

        [Required]
        [StringLength(100)]
        public string BudgetOfficer { get; set; } = string.Empty;

        [StringLength(500)]
        public string Remarks { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; } = DateTime.UtcNow;
    }
}
