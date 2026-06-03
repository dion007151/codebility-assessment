using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    [Table("Vouchers")]
    public class Voucher
    {
        [Key]
        public int VoucherId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(100)]
        public string GeneratedBy { get; set; } = string.Empty; // Accountant Name

        [Required]
        public DateTime Date { get; set; } = DateTime.UtcNow;

        // Navigation property for Payments
        public virtual ICollection<Payment>? Payments { get; set; }
    }
}
