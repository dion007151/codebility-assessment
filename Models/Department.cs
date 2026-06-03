using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PimsApp.Models
{
    public class Department
    {
        [Key]
        public int DepartmentId { get; set; }

        [Required]
        [StringLength(100)]
        public string DepartmentName { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Project>? Projects { get; set; }
    }
}
