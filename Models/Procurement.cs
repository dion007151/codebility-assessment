using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    [Table("Procurement")]
    public class Procurement
    {
        [Key]
        public int ProcurementId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [Required]
        [StringLength(100)]
        public string Supplier { get; set; } = string.Empty;

        public int? ContractorId { get; set; }

        [ForeignKey("ContractorId")]
        public virtual Contractor? Contractor { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty; // Bidding, Awarded

        [StringLength(500)]
        public string BACRemarks { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; } = DateTime.UtcNow;

        // Expanded ERD/DFD Relations
        public virtual ICollection<ProcurementDocument>? ProcurementDocuments { get; set; }
    }
}
