// Models/CardItem.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CulturalGuideBACKEND.Models
{
    [Table("CardItems")]
    public class CardItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [MaxLength(255)]
        public string? EntityId { get; set; }
        
        [MaxLength(500)]
        public string? EntityName { get; set; }
        
        [MaxLength(1000)]
        public string? ImagePath { get; set; }
        
        [MaxLength(1000)]
        public string? BadgeText { get; set; }
        
        [MaxLength(500)]
        public string? Address { get; set; }
        
        [MaxLength(255)]
        public string? Classification { get; set; }
        
        public DateTime? Date { get; set; }
        
        [MaxLength(255)]
        public string? MunicipalityName { get; set; }
        
        [MaxLength(1000)]
        public string? MunicipalityLogoPath { get; set; }
        
        [MaxLength(3)]
        public string? Language { get; set; }
        
        [MaxLength(255)]
        public string? Municipality { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}