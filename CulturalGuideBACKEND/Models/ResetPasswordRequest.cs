using System.ComponentModel.DataAnnotations;

namespace CulturalGuideBACKEND.Models
{
    public class ResetPasswordRequest
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Token { get; set; }
        [Required]
        public string NewPassword { get; set; }
    }
}