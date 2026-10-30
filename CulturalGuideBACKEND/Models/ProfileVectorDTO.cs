namespace CulturalGuideBACKEND.Models

{
        public class ProfileVectorDTO
        {
                public string UserId { get; set; } = string.Empty;
                public string Municipality { get; set; } = string.Empty;
                public string Country { get; set; } = "CH"; // "CH" or "IT"
                public string? FirstName { get; set; }
                public string? LastName { get; set; }
                public DateTime StartTime { get; set; }
                public DateTime EndTime { get; set; }
                public List<string> SelectedCategories { get; set; } = new();
        }
}