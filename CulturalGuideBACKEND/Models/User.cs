using System.ComponentModel.DataAnnotations;
using System;

namespace CulturalGuideBACKEND.Models
{

    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        // Existing and controller-expected flags
        public bool EmailVerified { get; set; }
        public bool IsVerified { get; set; }

        public string VerificationToken { get; set; } = string.Empty;
        public string JwtToken { get; set; } = string.Empty;

        // Password reset fields used by AuthController
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpires { get; set; }
    }

}

