using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    public class ProjectMonitoring
    {
        [Key]
        public int MonitoringId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [Required]
        public DateTime InspectionDate { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(100)]
        public string InspectedBy { get; set; } = string.Empty; // e.g. PGSO or PEO Engineer

        [Required]
        [Range(0, 100)]
        public int ProgressPercent { get; set; } // progress (%)

        [StringLength(500)]
        public string Remarks { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "On Track"; // On Track, Delayed, Completed

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
