namespace CulturalGuideBACKEND.DTO.SwaggerEppoiDTO
{
    public class EppoiMunicipalitiesDTO
    {
        public string LegalName { get; set; } = string.Empty;
        public string ImagePath { get; set; } = string.Empty;
        public string? Canton { get; set; }
        public string? Country { get; set; } = "CH"; // "CH" or "IT"
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}