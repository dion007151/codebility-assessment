using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    public class CashCertification
    {
        [Key]
        public int CashCertId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountCertified { get; set; }

        [Required]
        [StringLength(100)]
        public string CertifiedBy { get; set; } = string.Empty;

        [Required]
        public DateTime CertifiedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Certified";

        [StringLength(500)]
        public string Remarks { get; set; } = string.Empty;
    }
}
