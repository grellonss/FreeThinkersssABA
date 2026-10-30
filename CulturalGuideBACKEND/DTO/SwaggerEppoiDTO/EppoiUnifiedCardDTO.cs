namespace CulturalGuideBACKEND.DTO.SwaggerEppoiDTO
{

    public class EppoiUnifiedCardDTO
    {
        public string? EntityId { get; set; }
        public string? EntityName { get; set; }
        public string? ImagePath { get; set; }
        public string? BadgeText { get; set; }
        public string? Address { get; set; }

        public string? Classification { get; set; }
        public string? Date { get; set; }

        public EppoiMunicipalitiesDTO MunicipalityData { get; set; }

        public string Language { get; set; }
        public string Municipality { get; set; }
    }
}
