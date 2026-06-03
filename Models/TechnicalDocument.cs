using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    public class TechnicalDocument
    {
        [Key]
        public int DocId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [Required]
        [StringLength(200)]
        public string DocName { get; set; } = string.Empty; // e.g., Blueprints, Cost Estimates, DED Reports

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
