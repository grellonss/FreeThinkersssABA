namespace CulturalGuideBACKEND.DTO.SwaggerEppoiDTO
{
    public class EppoiEatAndDrinksDTO
    {
        public string EntityId { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string ImagePath { get; set; } = string.Empty;
        public string BadgeText { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? Description { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}