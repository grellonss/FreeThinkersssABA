using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CulturalGuideBACKEND.Models
{
    [Table("CardItemDetails")]
    public class CardItemDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required, MaxLength(255)]
        public string? EntityId { get; set; }

        [Required, MaxLength(50)]
        public string? Category { get; set; }

        [Required, MaxLength(10)]
        public string? Language { get; set; }

        [Required, MaxLength(255)]
        public string? Municipality { get; set; }

        [MaxLength(500)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(1000)]
        public string? PrimaryImage { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        // 🔥 The important part
        [Required]
        public string? JsonPayload { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}