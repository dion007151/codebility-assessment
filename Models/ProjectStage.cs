using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    public class ProjectStage
    {
        [Key]
        public int StageId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [Required]
        [StringLength(100)]
        public string StageName { get; set; } = string.Empty;

        [Required]
        public int OrderNo { get; set; }

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        public DateTime? TargetDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, In Progress, Completed
    }
}
