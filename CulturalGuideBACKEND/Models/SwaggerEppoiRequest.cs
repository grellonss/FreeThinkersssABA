namespace CulturalGuideBACKEND.Models
{
    public class SwaggerEppoiRequest
    {
        public string City { get; set; }
        public List<string> Interests { get; set; }
        public int? Limit { get; set; }
    }
}
