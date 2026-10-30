namespace CulturalGuideBACKEND.Controllers;

using CulturalGuideBACKEND.Data;
using CulturalGuideBACKEND.Models;
using CulturalGuideBACKEND.Services.Email;
using LoginRequest = CulturalGuideBACKEND.Models.LoginRequest;
using RegisterRequest = CulturalGuideBACKEND.Models.RegisterRequest;
using ResetPasswordRequest = CulturalGuideBACKEND.Models.ResetPasswordRequest;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    private readonly IConfiguration _config;
    private readonly IPasswordHasher<User> _passwordHasher;
	private readonly IEmailService _emailService;


    [AllowAnonymous]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        var email = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value;
        return Ok(new { userId, email });
    }

    public AuthController(
        AppDbContext db,
        IConfiguration config,
        IPasswordHasher<User> passwordHasher,
        IEmailService emailService)
    {
        _db = db;
        _config = config;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        return Ok(await _db.Users.ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // debug log
        Console.WriteLine($"Login attempt: ", request.Email);

        var user = _db.Users.FirstOrDefault(u => u.Email == request.Email);
        if (user == null)
            return Unauthorized("User not found");

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        // debug log
        Console.WriteLine($"Should be Success or SuccessRehashNeeded: ",
            result); // Should be Success or SuccessRehashNeeded


        if (result == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid password");

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            }),
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpireMinutes"]!)),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            SigningCredentials =
                new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);
        
        // save jwt in user record
        user.JwtToken = jwt;
        _db.SaveChanges();

        Response.Cookies.Append("access_token", jwt, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpireMinutes"]!))
        });

        return Ok(new { token = jwt, user.Email, user.Name });
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest("Invalid data");

        // Check email duplicates
        var existingUser = _db.Users.FirstOrDefault(u => u.Email == request.Email);
        if (existingUser != null)
            return Conflict("Email already registered");

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            IsVerified = false,
            VerificationToken = Guid.NewGuid().ToString("N")
        };


        // Hash password
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        // Save user in DB
        _db.Users.Add(user);
        _db.SaveChanges();

        // Create JWT
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            }),
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpireMinutes"]!)),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            SigningCredentials =
                new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);

        // save jwt in user record
        user.JwtToken = jwt;
        _db.SaveChanges();

        // Send verification email that user is registered but has to verify email
        await _emailService.SendVerificationEmail(
            user.Email,
            user.Name,
            user.VerificationToken
        );

        Response.Cookies.Append("access_token", jwt, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpireMinutes"]!))
        });

        return Ok(new { token = jwt, user.Email, user.Name, message = "Verification email sent" });
}    
    
    [AllowAnonymous]
    [HttpGet("verify-email")]
    public IActionResult VerifyEmail(string token)
    {
        var user = _db.Users.FirstOrDefault(u => u.VerificationToken == token);
        if (user == null) return BadRequest("Invalid token");

        user.IsVerified = true;
        user.VerificationToken = null;

        _db.SaveChanges();

        return Ok(new { message = "Email verified successfully" });
    }

    [AllowAnonymous]
    [HttpPost("password-recovery")]
    public async Task<IActionResult> PasswordRecovery([FromBody] PasswordRecoveryRequest req)
    {
        var user = _db.Users.FirstOrDefault(u => u.Email == req.Email);
        if (user == null) return Ok();

        user.PasswordResetToken = Guid.NewGuid().ToString("N");
        user.PasswordResetTokenExpires = DateTime.UtcNow.AddHours(1);

        _db.SaveChanges();

        await _emailService.SendPasswordRecoveryEmail(
            user.Email,
            user.Name,
            user.PasswordResetToken
        );


        return Ok(new { message = "If the email exists, a reset link was sent." });
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public IActionResult ResetPassword([FromBody] ResetPasswordRequest req)
    {
        var user = _db.Users.FirstOrDefault(u => u.PasswordResetToken == req.Token);

        if (user == null || user.PasswordResetTokenExpires < DateTime.UtcNow)
            return BadRequest("Invalid or expired token");

        user.PasswordHash = _passwordHasher.HashPassword(user, req.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpires = null;

        _db.SaveChanges();

        return Ok(new { message = "Password changed successfully" });
    }


    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // Remove cookie
        Response.Cookies.Delete("access_token");
        return Ok(new { message = "Logged out" });
    }
    
    [HttpDelete("{id}")]
    public IActionResult DeleteUser(int id)
    {
        var user = _db.Users.Find(id);
        if (user == null)
            return NotFound();

        _db.Users.Remove(user);
        _db.SaveChanges();
        return Ok(new { message = "User with userId: {} deleted successfully", id });
    }
}
