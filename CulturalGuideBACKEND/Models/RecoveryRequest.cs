namespace CulturalGuideBACKEND.Models
{
    public class RecoveryRequest
    {
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
}