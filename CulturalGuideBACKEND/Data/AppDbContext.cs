using Microsoft.EntityFrameworkCore;
using CulturalGuideBACKEND.Models;

namespace CulturalGuideBACKEND.Data;



public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<User> Users { get; set; }
    
    public DbSet<Municipality> Municipalities { get; set; }
    
	public DbSet<EatAndDrink> EatAndDrink { get; set; }

	public DbSet<ProfileVector> ProfileVector { get; set; }
	
	public DbSet<CardItem> CardItems { get; set; }

	public DbSet<CardItemDetail> CardItemDetails { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		// Configure CardItem entity
		modelBuilder.Entity<CardItem>(entity =>
		{
			entity.HasKey(e => e.Id);

			// Ensure Id is auto-increment
			entity.Property(e => e.Id)
				.ValueGeneratedOnAdd();

			entity.Property(e => e.EntityId).HasMaxLength(255).IsRequired(false);
			entity.Property(e => e.EntityName).HasMaxLength(500).IsRequired(false);
			entity.Property(e => e.BadgeText).HasMaxLength(255).IsRequired(false);
			entity.Property(e => e.Address).HasMaxLength(500).IsRequired(false);
			entity.Property(e => e.Classification).HasMaxLength(255).IsRequired(false);
			entity.Property(e => e.MunicipalityName).HasMaxLength(255).IsRequired(false);
			entity.Property(e => e.Language).HasMaxLength(10).IsRequired(false);
			entity.Property(e => e.Municipality).HasMaxLength(255).IsRequired(false);

			entity.Property(e => e.CreatedAt)
				.HasDefaultValueSql("CURRENT_TIMESTAMP");

			// Create composite index for faster lookups
			entity.HasIndex(e => new { e.EntityId, e.Language, e.Municipality })
				.HasDatabaseName("IX_CardItems_Lookup");
			
			modelBuilder.Entity<CardItem>()
				.HasIndex(x => new
				{
					x.EntityId,
					x.Language,
					x.Municipality
				})
				.IsUnique();
			
		});
	}
}
