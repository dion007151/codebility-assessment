using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    [Table("Payments")]
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        [Required]
        public int VoucherId { get; set; }

        [ForeignKey("VoucherId")]
        public virtual Voucher? Voucher { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty; // Pending, Paid

        [Required]
        [StringLength(100)]
        public string Treasurer { get; set; } = string.Empty; // Treasurer Name

        [Required]
        public DateTime Date { get; set; } = DateTime.UtcNow;
    }
}
