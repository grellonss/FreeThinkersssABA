// Controllers/ChatbotController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using CulturalGuideBACKEND.Data;
using CulturalGuideBACKEND.Models;
using CulturalGuideBACKEND.Services;

namespace CulturalGuideBACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;
        private readonly IGeminiService _geminiService;
        private readonly IChatContextService _contextService;
        private readonly ILogger<ChatbotController> _logger;

        public ChatbotController(
            AppDbContext db,
            IConfiguration config,
            IGeminiService geminiService,
            IChatContextService contextService,
            ILogger<ChatbotController> logger)
        {
            _db = db;
            _config = config;
            _geminiService = geminiService;
            _contextService = contextService;
            _logger = logger;
        }

        [HttpPost("chat")]
        [AllowAnonymous] // We'll validate manually
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            try
            {
                // Validate request
                if (string.IsNullOrEmpty(request.UserId) || 
                    string.IsNullOrEmpty(request.Message) || 
                    string.IsNullOrEmpty(request.Municipality))
                {
                    return BadRequest(new ChatResponse 
                    { 
                        Success = false, 
                        Error = "Missing required fields" 
                    });
                }

                _logger.LogInformation($"Chat request from user {request.UserId} for {request.Municipality} in language {request.Language}");

                // Get user from database
                var user = await _db.Users
                    .FirstOrDefaultAsync(u => u.Id.ToString() == request.UserId || u.Email == request.UserId);

                if (user == null)
                {
                    return NotFound(new ChatResponse 
                    { 
                        Success = false, 
                        Error = "User not found" 
                    });
                }

                // Build context from database
                var context = await _contextService.BuildContextAsync(request.Municipality, request.UserId, request.Language);

                _logger.LogInformation($"Context built for {request.Municipality}: {context.Length} chars");

                // Call Gemini API
                var geminiResponse = await _geminiService.GenerateResponseAsync(
                    request.Message, 
                    request.Municipality, 
                    request.Language,
                    context
                );

                _logger.LogInformation($"Gemini response received: {geminiResponse?.Length ?? 0} chars");

                // Return response (don't save to DB as requested)
                return Ok(new ChatResponse
                {
                    Response = geminiResponse,
                    ResponseDate = DateTime.UtcNow,
                    Success = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chat request");
                return StatusCode(500, new ChatResponse
                {
                    Success = false,
                    Error = "An error occurred processing your request",
                    Response = "I'm having trouble right now. Please try again later."
                });
            }
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        }
    }
}