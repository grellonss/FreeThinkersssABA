namespace CulturalGuideBACKEND.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CulturalGuideBACKEND.Services.SwaggerEppoiService;
using CulturalGuideBACKEND.Models;
using CulturalGuideBACKEND.Data;
using System.Threading.Tasks;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class EppoiApiController : ControllerBase
{
    private readonly ISwaggerEppoiApiService _swaggerEppoiService;
    private readonly ILogger<EppoiApiController> _logger;
    private readonly AppDbContext _db;

    public EppoiApiController(
        ISwaggerEppoiApiService swaggerEppoiService,
        IConfiguration config,
        ILogger<EppoiApiController> logger,
        AppDbContext db)
    {
        _swaggerEppoiService = swaggerEppoiService;
        _logger = logger;
        _db = db;
    }

    // ===============================
    //  MUNICIPALITIES (SWITZERLAND)
    // ===============================
    [HttpGet("municipalities")]
    public async Task<IActionResult> GetMunicipalities([FromQuery] string? search = null)
    {
        _logger.LogInformation("Fetching Swiss municipalities (search: {Search})...", search);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchResults = await _swaggerEppoiService.SearchMunicipalitiesAsync(search);
            return Ok(searchResults);
        }

        var municipalities = await _swaggerEppoiService.GetMunicipalitiesAsync();
        return Ok(municipalities);
    }

    // ===============================
    //  CATEGORIES
    // ===============================
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var categories = await _swaggerEppoiService.GetCategoriesAsync(municipality, language);
        return Ok(categories);
    }

    // ===============================
    //  MAP ENDPOINT
    // ===============================
    [HttpGet("map")]
    public async Task<IActionResult> GetMap([FromQuery] string municipality = "Lugano")
    {
        var mapData = await _swaggerEppoiService.GetMapAsync(municipality);
        return Ok(mapData);
    }

    // ===============================
    //  GENERIC CATEGORY CARDS LIST
    // ===============================
    [HttpGet("cards")]
    public async Task<IActionResult> GetCards(
        [FromQuery] string? category,
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cat = string.IsNullOrWhiteSpace(category) ? "artculture" : category;
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync(cat, municipality, language);
        return Ok(cards);
    }

    [HttpGet("{category}/card-list")]
    public async Task<IActionResult> GetCardList(
        string category,
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync(category, municipality, language);
        return Ok(cards);
    }

    // ===============================
    //  SPECIFIC CATEGORY ENDPOINTS
    // ===============================
    [HttpGet("eat-and-drinks")]
    public async Task<IActionResult> GetEatAndDrinks(
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync("eatanddrink", municipality, language);
        return Ok(cards);
    }

    [HttpGet("art-culture")]
    public async Task<IActionResult> GetArtAndCulture(
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync("artculture", municipality, language);
        return Ok(cards);
    }

    [HttpGet("nature")]
    public async Task<IActionResult> GetNature(
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync("nature", municipality, language);
        return Ok(cards);
    }

    [HttpGet("routes")]
    [HttpGet("itineraries")]
    public async Task<IActionResult> GetRoutes(
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync("routes", municipality, language);
        return Ok(cards);
    }

    [HttpGet("events")]
    public async Task<IActionResult> GetEvents(
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync("events", municipality, language);
        return Ok(cards);
    }

    [HttpGet("sleep")]
    public async Task<IActionResult> GetSleep(
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync("sleep", municipality, language);
        return Ok(cards);
    }

    [HttpGet("typical-products")]
    public async Task<IActionResult> GetTypicalProducts(
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync("typicalproducts", municipality, language);
        return Ok(cards);
    }

    [HttpGet("shopping")]
    public async Task<IActionResult> GetShopping(
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync("shopping", municipality, language);
        return Ok(cards);
    }

    [HttpGet("entertainment-leisure")]
    [HttpGet("recreation-fun")]
    public async Task<IActionResult> GetEntertainmentLeisure(
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync("entertainmentleisure", municipality, language);
        return Ok(cards);
    }

    [HttpGet("services")]
    [HttpGet("economic-operators")]
    [HttpGet("points-of-sale")]
    public async Task<IActionResult> GetServices(
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync("services", municipality, language);
        return Ok(cards);
    }

    [HttpGet("articles-magazines")]
    [HttpGet("articles")]
    [HttpGet("organizations")]
    public async Task<IActionResult> GetArticles(
        [FromQuery] string municipality = "Lugano",
        [FromQuery] string language = "it")
    {
        var cards = await _swaggerEppoiService.GetCategoryCardsAsync("articles", municipality, language);
        return Ok(cards);
    }

    // ===============================
    //  DETAILS
    // ===============================
    [HttpGet("eat-and-drinks/detail/{id}")]
    [HttpGet("detail/{id}")]
    [HttpGet("{category}/detail/{id}")]
    public async Task<IActionResult> GetDetail(
        string id,
        [FromQuery] string language = "it")
    {
        try
        {
            var result = await _swaggerEppoiService.GetCardDetailAsync(id, language);
            if (result == null)
            {
                return NotFound(new { message = $"POI with ID {id} not found." });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching detail for ID: {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // ===============================
    //  IMAGE PROXY
    // ===============================
    [HttpGet("proxy-image")]
    public async Task<IActionResult> ProxyImage([FromQuery] string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl))
        {
            return BadRequest("Image URL is required");
        }

        try
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("User-Agent", "CulturalGuideSwitzerland/2.0");
            var imageBytes = await httpClient.GetByteArrayAsync(imageUrl);

            var contentType = imageUrl.EndsWith(".webp", StringComparison.OrdinalIgnoreCase) ? "image/webp"
                : imageUrl.EndsWith(".png", StringComparison.OrdinalIgnoreCase) ? "image/png"
                : imageUrl.EndsWith(".svg", StringComparison.OrdinalIgnoreCase) ? "image/svg+xml"
                : "image/jpeg";

            return File(imageBytes, contentType);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to proxy image: {ImageUrl}", imageUrl);
            return Redirect(imageUrl);
        }
    }

    // ===============================
    //  PROFILE VECTOR ENDPOINTS
    // ===============================
    [HttpPost("save-profile-vector")]
    public async Task<IActionResult> SavePreferences([FromBody] ProfileVectorDTO profileVectorDto)
    {
        try
        {
            if (string.IsNullOrEmpty(profileVectorDto.UserId))
            {
                return BadRequest(new { message = "UserId is required" });
            }

            if (string.IsNullOrEmpty(profileVectorDto.Municipality))
            {
                return BadRequest(new { message = "Municipality is required" });
            }

            if (profileVectorDto.EndTime <= profileVectorDto.StartTime)
            {
                return BadRequest(new { message = "End time must be after start time" });
            }

            var cleanMuni = SwaggerEppoiApiService.CleanMunicipality(profileVectorDto.Municipality);

            var existingPreference = await _db.ProfileVector
                .FirstOrDefaultAsync(p => p.UserId == profileVectorDto.UserId);

            if (existingPreference != null)
            {
                existingPreference.Municipality = cleanMuni;
                existingPreference.StartTime = profileVectorDto.StartTime;
                existingPreference.EndTime = profileVectorDto.EndTime;
                existingPreference.SelectedCategories = JsonSerializer.Serialize(profileVectorDto.SelectedCategories);
                existingPreference.UpdatedAt = DateTime.UtcNow;

                _db.ProfileVector.Update(existingPreference);
                _logger.LogInformation("Updated preferences for user: {UserId}", profileVectorDto.UserId);
            }
            else
            {
                var newPreference = new ProfileVector
                {
                    UserId = profileVectorDto.UserId,
                    Municipality = cleanMuni,
                    StartTime = profileVectorDto.StartTime,
                    EndTime = profileVectorDto.EndTime,
                    SelectedCategories = JsonSerializer.Serialize(profileVectorDto.SelectedCategories),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _db.ProfileVector.Add(newPreference);
                _logger.LogInformation("Created new preferences for user: {UserId}", profileVectorDto.UserId);
            }

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Preferences saved successfully",
                userId = profileVectorDto.UserId,
                municipality = cleanMuni,
                categoriesCount = profileVectorDto.SelectedCategories.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving preferences for user: {UserId}", profileVectorDto.UserId);
            return StatusCode(500, new { message = "Error saving preferences", error = ex.Message });
        }
    }

    [HttpGet("profile-vector/{userId}")]
    public async Task<IActionResult> GetPreferences(string userId)
    {
        try
        {
            var profileVector = await _db.ProfileVector
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profileVector == null)
            {
                return NotFound(new { message = "No profileVector yet for this user" });
            }

            var categories = JsonSerializer.Deserialize<List<string>>(profileVector.SelectedCategories) ?? new List<string>();

            return Ok(new
            {
                userId = profileVector.UserId,
                municipality = profileVector.Municipality,
                startTime = profileVector.StartTime,
                endTime = profileVector.EndTime,
                selectedCategories = categories,
                createdAt = profileVector.CreatedAt,
                updatedAt = profileVector.UpdatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving preferences for user: {UserId}", userId);
            return StatusCode(500, new { message = "Error retrieving preferences" });
        }
    }

    [HttpDelete("profile-vector/{userId}")]
    public async Task<IActionResult> DeletePreferences(string userId)
    {
        try
        {
            var preference = await _db.ProfileVector
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (preference == null)
            {
                return NotFound(new { message = "No preferences found for this user" });
            }

            _db.ProfileVector.Remove(preference);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Deleted preferences for user: {UserId}", userId);
            return Ok(new { message = "Preferences deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting preferences for user: {UserId}", userId);
            return StatusCode(500, new { message = "Error deleting preferences" });
        }
    }

    [HttpPost("search")]
    public async Task<IActionResult> SearchExperiences([FromBody] SwaggerEppoiRequest request)
    {
        var result = await _swaggerEppoiService.SearchExperiencesAsync(request);
        return Ok(result);
    }
}
