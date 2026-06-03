using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PimsApp.Models
{
    public class Contractor
    {
        [Key]
        public int ContractorId { get; set; }

        [Required]
        [StringLength(200)]
        public string ContractorName { get; set; } = string.Empty;

        [StringLength(100)]
        public string ContactPerson { get; set; } = string.Empty;

        [StringLength(200)]
        public string Address { get; set; } = string.Empty;

        [StringLength(50)]
        public string Phone { get; set; } = string.Empty;

        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [StringLength(50)]
        public string RegistrationNo { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Active";

        // Navigation properties
        public virtual ICollection<Procurement>? Procurements { get; set; }
    }
}
