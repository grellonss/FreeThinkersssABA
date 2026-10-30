using System.ComponentModel.DataAnnotations;

namespace CulturalGuideBACKEND.Models
{
    public class ProfileVector
    {
        [Key]
        public int Id { get; set; }
        
        public string UserId { get; set; } = string.Empty;
        public string Municipality { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        
        // Store as JSON string or comma-separated
        public string SelectedCategories { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}