using System.ComponentModel.DataAnnotations;

namespace CulturalGuideBACKEND.Models;

public class PasswordRecoveryRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}