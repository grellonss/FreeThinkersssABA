namespace CulturalGuideBACKEND.Models
{

    public class ChatResponse
    {
        public string Response { get; set; }
        public DateTime ResponseDate { get; set; }
        public bool Success { get; set; }
        public string Error { get; set; }
    }
}