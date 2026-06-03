using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    public class ProjectDocument
    {
        [Key]
        public int DocId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [Required]
        [StringLength(100)]
        public string DocType { get; set; } = string.Empty; // e.g., Proposal, Ordinance, Resolution, DED, POW

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
