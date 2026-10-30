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
    private readonly string _swaggerEppoiBaseUrl;
    private readonly string _swaggerEppoiApiKey;
    private readonly ILogger<EppoiApiController> _logger;
    private readonly AppDbContext _db;

    public EppoiApiController(
        ISwaggerEppoiApiService swaggerEppoiService, IConfiguration config, ILogger<EppoiApiController> logger, AppDbContext db)
    {
        _swaggerEppoiService = swaggerEppoiService;
        _swaggerEppoiBaseUrl = config["SwaggerEppoiApi:BaseUrl"]!;
        _swaggerEppoiApiKey = config["SwaggerEppoiApi:ApiKey"]!;
        _logger = logger;
        _db = db;
    }

    // --------------------------------------------------------------------
    //  GENERAL INFORMATION
    // --------------------------------------------------------------------
    // This controller acts as the BACKEND interface for the external API:
    //
    //   https://apispm.eppoi.io/swagger/index.html
    //
    // All calls to the external API go through a dedicated service:
    //   IEppoiApiService
    //
    // Authentication to Eppoi is also handled inside that service.
    //
    // In the future, this controller will transform the API responses
    // into Frontend DTOs for optimal presentation.
    // --------------------------------------------------------------------


    // ===============================
    //  EXAMPLE ENDPOINT #1
    //  Fetch POIs in a city
    // ===============================
    [HttpGet("pois")]
    public async Task<IActionResult> GetPointsOfInterest([FromQuery] string city)
    {
        // Call service (implementation later)
        var result = await _swaggerEppoiService.GetPointsOfInterestAsync(city);

        return Ok(result);
    }
    
    // ===============================
    //  Proxy Image Endpoint for POI images
    // ===============================
    [HttpGet("proxy-image")]
    public async Task<IActionResult> ProxyImage([FromQuery] string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl))
        { return BadRequest("Image URL is required"); }

        try
        {
	        using var httpClient = new HttpClient();
	        var imageBytes = await httpClient.GetByteArrayAsync(imageUrl);
    
	        // Detect content type from URL extension
	        var contentType = imageUrl.EndsWith(".webp") ? "image/webp" 
		        : imageUrl.EndsWith(".jpg") || imageUrl.EndsWith(".jpeg") ? "image/jpeg"
		        : imageUrl.EndsWith(".png") ? "image/png"
		        : "image/jpeg";
    
	        return File(imageBytes, contentType);
        }	
        catch (Exception ex)
        {
	        _logger.LogError(ex, "Failed to proxy image: {ImageUrl}", imageUrl);
	        return NotFound();
        }
    }


    // ===============================
    //  EXAMPLE ENDPOINT #2
    //  Fetch details for a EatAndDrink POI by municipality
    // ===============================
	
	/// <summary>
	/// Retrieves the Eat And Drink (POIs) for a given city.
	/// </summary>
	/// <param name="city">Name of the municipality</param>
	/// <returns>List of POIs</returns>
	[HttpGet("eat-and-drinks")]
    public async Task<IActionResult> GetEatAndDrinks(
        [FromQuery] string municipality,
        [FromQuery] string language)
    {
        var result = await _swaggerEppoiService.GetEatAndDrinksAsync(municipality, language);
        return Ok(result);
    }

     // ===============================
     //  DETAIL: Fetch SINGLE EatAndDrink by ID
     // ===============================
    [HttpGet("eat-and-drinks/detail/{id}")]
        public async Task<IActionResult> GetEatAndDrinkDetail(string id, [FromQuery] string language = "it")
        {
            try
            {
                var result = await _swaggerEppoiService.GetEatAndDrinkDetailAsync(id, language);

                if (result == null) return NotFound($"POI with ID {id} not found.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching details for ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    // ===============================
    //  EXAMPLE ENDPOINT #3
    //  Search for experiences based on interests
    // ===============================
	/// <summary>
	/// Returns all available categories available for a specific municipality from the external Eppoi API.
	/// </summary>
	/// <remarks>
	/// Maps to: https://apispm.eppoi.io/api/categories
	/// </remarks>
	/// <response code="200">List of municipalities</response>
	/// <response code="500">Server error fetching municipalities</response>
    [HttpPost("search")]
    public async Task<IActionResult> SearchExperiences([FromBody] SwaggerEppoiRequest request)
    {
        var result = await _swaggerEppoiService.SearchExperiencesAsync(request);
        return Ok(result);
    }
    
    // ===============================
    //  EXAMPLE ENDPOINT #4
    //  Fetch categories for a municipality
    //  Maps to:
    //  https://apispm.eppoi.io/api/categories?municipality=Massignano&language=it
    // ===============================
	
	/// <summary>
	/// Returns all available categories available for a specific municipality from the external Eppoi API.
	/// </summary>
	/// <remarks>
	/// Maps to: https://apispm.eppoi.io/api/categories
	/// </remarks>
	/// <response code="200">List of municipalities</response>
	/// <response code="500">Server error fetching municipalities</response>
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(
        [FromQuery] string municipality,
        [FromQuery] string language = "it")
    {
        var categories = await _swaggerEppoiService.GetCategoriesAsync(municipality, language);
        return Ok(categories);
    }
    
    // ===============================
    //  EXAMPLE ENDPOINT #5
    //  municipalities
    //  Maps to: https://apispm.eppoi.io/api/municipalities
    // ===============================
	/// <summary>
	/// Returns all available municipalities from the external Eppoi API.
	/// </summary>
	/// <remarks>
	/// Maps to: https://apispm.eppoi.io/api/organizations/municipalities
	/// </remarks>
	/// <response code="200">List of municipalities</response>
	/// <response code="500">Server error fetching municipalities</response>
    [HttpGet("municipalities")]
    public async Task<IActionResult> GetMunicipalities()
    {
        // print log
        _logger.LogInformation("Fetching municipalities from EppoiApiController...");
        var municipalities = await _swaggerEppoiService.GetMunicipalitiesAsync();
        return Ok(municipalities);
    }

    [HttpGet("map")]
    public async Task<IActionResult> GetMap([FromQuery] string municipality)
    {
        var mapData = await _swaggerEppoiService.GetMapAsync(municipality);
        return Ok(mapData);
    }
	
	
	
    // ===============================
    //  PROFILE VECTOR ENDPOINTS
    // ===============================
    /// <summary>
    /// POST user categories, timeAvailability and municipality as a profile vector.
    /// </summary>
    /// <response code="200">List of municipalities</response>
    /// <response code="500">Server error fetching municipalities</response>
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

            // ------------
            // Check if preference already exists for this user
            // ------------
            var existingPreference = await _db.ProfileVector
                .FirstOrDefaultAsync(p => p.UserId == profileVectorDto.UserId);

            if (existingPreference != null)
            {
                // Update existing preference
                existingPreference.Municipality = profileVectorDto.Municipality;
                existingPreference.StartTime = profileVectorDto.StartTime;
                existingPreference.EndTime = profileVectorDto.EndTime;
                existingPreference.SelectedCategories = JsonSerializer.Serialize(profileVectorDto.SelectedCategories);
                existingPreference.UpdatedAt = DateTime.UtcNow;

                _db.ProfileVector.Update(existingPreference);
                _logger.LogInformation("Updated preferences for user: {UserId}", profileVectorDto.UserId);
            }
            else
            {
                // Create new profile vector
                var newPreference = new ProfileVector
                {
                    UserId = profileVectorDto.UserId,
                    Municipality = profileVectorDto.Municipality,
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
                municipality = profileVectorDto.Municipality,
                categoriesCount = profileVectorDto.SelectedCategories.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving preferences for user: {UserId}", profileVectorDto.UserId);
            return StatusCode(500, new { message = "Error saving preferences", error = ex.Message });
        }
    }

    /// <summary>
    /// GET user categories, timeAvailability and municipality as a profile vector.
    /// returns either the profile vector or 404 if not found
    /// </summary>
    /// <response code="200">List of municipalities</response>
    /// <response code="404">No preferences found for this user</response>
    /// <response code="500">Server error fetching municipalities</response>
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

    /// <summary>
    /// DELETE user categories, timeAvailability and municipality as a profile vector.
    /// </summary>
    /// <response code="200">List of municipalities</response>
    /// <response code="500">Server error fetching municipalities</response>
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
}

