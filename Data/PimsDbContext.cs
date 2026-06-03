using Microsoft.EntityFrameworkCore;
using PimsApp.Models;

namespace PimsApp.Data
{
    public class PimsDbContext : DbContext
    {
        public PimsDbContext(DbContextOptions<PimsDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Approval> Approvals { get; set; }
        public DbSet<BudgetValidation> BudgetValidations { get; set; }
        public DbSet<Procurement> Procurements { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<WorkflowLog> WorkflowLogs { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Contractor> Contractors { get; set; }
        public DbSet<ProjectStage> ProjectStages { get; set; }
        public DbSet<ProjectDocument> ProjectDocuments { get; set; }
        public DbSet<TechnicalDocument> TechnicalDocuments { get; set; }
        public DbSet<ProcurementDocument> ProcurementDocuments { get; set; }
        public DbSet<CashCertification> CashCertifications { get; set; }
        public DbSet<ProjectMonitoring> ProjectMonitorings { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Approval>()
                .HasOne(a => a.Project)
                .WithMany(p => p.Approvals)
                .HasForeignKey(a => a.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BudgetValidation>()
                .HasOne(b => b.Project)
                .WithMany(p => p.BudgetValidations)
                .HasForeignKey(b => b.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Procurement>()
                .HasOne(pr => pr.Project)
                .WithMany(p => p.Procurements)
                .HasForeignKey(pr => pr.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Voucher>()
                .HasOne(v => v.Project)
                .WithMany(p => p.Vouchers)
                .HasForeignKey(v => v.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Payment>()
                .HasOne(pa => pa.Voucher)
                .WithMany(v => v.Payments)
                .HasForeignKey(pa => pa.VoucherId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WorkflowLog>()
                .HasOne(wl => wl.Project)
                .WithMany(p => p.WorkflowLogs)
                .HasForeignKey(wl => wl.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // New Mappings for expanded ERD/DFD
            modelBuilder.Entity<ProjectStage>()
                .HasOne(s => s.Project)
                .WithMany(p => p.ProjectStages)
                .HasForeignKey(s => s.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectDocument>()
                .HasOne(d => d.Project)
                .WithMany(p => p.ProjectDocuments)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TechnicalDocument>()
                .HasOne(d => d.Project)
                .WithMany(p => p.TechnicalDocuments)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProcurementDocument>()
                .HasOne(pd => pd.Procurement)
                .WithMany(pr => pr.ProcurementDocuments)
                .HasForeignKey(pd => pd.ProcurementId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CashCertification>()
                .HasOne(c => c.Project)
                .WithMany(p => p.CashCertifications)
                .HasForeignKey(c => c.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectMonitoring>()
                .HasOne(m => m.Project)
                .WithMany(p => p.ProjectMonitorings)
                .HasForeignKey(m => m.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Project>()
                .HasOne(p => p.Department)
                .WithMany(d => d.Projects)
                .HasForeignKey(p => p.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Procurement>()
                .HasOne(p => p.Contractor)
                .WithMany(c => c.Procurements)
                .HasForeignKey(p => p.ContractorId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<AuditLog>()
                .HasOne(al => al.User)
                .WithMany()
                .HasForeignKey(al => al.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
