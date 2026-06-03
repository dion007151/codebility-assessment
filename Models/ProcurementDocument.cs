using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    public class ProcurementDocument
    {
        [Key]
        public int DocId { get; set; }

        [Required]
        public int ProcurementId { get; set; }

        [ForeignKey("ProcurementId")]
        public virtual Procurement? Procurement { get; set; }

        [Required]
        [StringLength(100)]
        public string DocType { get; set; } = string.Empty; // e.g., PhilGEPS Post, NOA, NTP, Contract, Bid Proposal

        [Required]
        [StringLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string FilePath { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string UploadedBy { get; set; } = string.Empty;

        [Required]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        [StringLength(500)]
        public string Remarks { get; set; } = string.Empty;
    }
}
