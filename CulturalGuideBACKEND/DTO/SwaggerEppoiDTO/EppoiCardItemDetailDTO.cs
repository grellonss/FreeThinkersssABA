namespace CulturalGuideBACKEND.DTO.SwaggerEppoiDTO
{
    public class EppoiCardItemDetailDTO
    {
        public string? EntityId { get; set; }
        public string? EntityName { get; set; }
        public string? Title { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? ShortDescription { get; set; }
        public string? Address { get; set; }
        public string? ImagePath { get; set; }
        public string? PrimaryImage { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        
        // Add any other fields you expect from the detail endpoint
        public object? Contacts { get; set; }
        public object? OpeningHours { get; set; }
        public object? Prices { get; set; }
        public object? Services { get; set; }
        public object? Images { get; set; }
        public object? Videos { get; set; }
    }
}