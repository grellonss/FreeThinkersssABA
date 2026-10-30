using CulturalGuideBACKEND.Models;

namespace CulturalGuideBACKEND.Models
{
        public class ChatRequest
        {
            public string UserId { get; set; }
            public string Municipality { get; set; }
            public string Language { get; set; }
            public string Message { get; set; }
            public DateTime MessageSentDate { get; set; }
        }
}