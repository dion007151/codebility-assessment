using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PimsApp.Models
{
    public class AuditLog
    {
        [Key]
        public int LogId { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [Required]
        [StringLength(100)]
        public string Action { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string TableName { get; set; } = string.Empty;

        [Required]
        public int RecordId { get; set; }

        public string? OldValues { get; set; }

        public string? NewValues { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string IpAddress { get; set; } = "127.0.0.1";
    }
}
