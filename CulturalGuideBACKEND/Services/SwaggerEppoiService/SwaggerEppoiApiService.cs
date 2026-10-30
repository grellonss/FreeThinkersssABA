using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CulturalGuideBACKEND.DTO.SwaggerEppoiDTO;
using CulturalGuideBACKEND.Models;
using CulturalGuideBACKEND.Data;

namespace CulturalGuideBACKEND.Services.SwaggerEppoiService
{
    public class SwaggerEppoiApiService : ISwaggerEppoiApiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly ILogger<SwaggerEppoiApiService> _logger;
        private readonly AppDbContext _db;

        public SwaggerEppoiApiService(IHttpClientFactory httpClientFactory, IConfiguration config,
            ILogger<SwaggerEppoiApiService> logger, AppDbContext db)
        {
            _httpClient = httpClientFactory.CreateClient();
            _config = config;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            // Base URL for the API
            _httpClient.BaseAddress = new Uri(_config["SwaggerEppoiApi:BaseUrl"]);
            _db = db;
        }

        // =====================
        // AUTHENTICATION
        // =====================
        private async Task EnsureAuthenticatedAsync()
        {
            // TODO: implement token retrieval and caching
            string token = "FAKE_TOKEN"; // placeholder
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }

        // =====================
        // POINTS OF INTEREST
        // =====================
        public async Task<object> GetPointsOfInterestAsync(string city)
        {
            await EnsureAuthenticatedAsync();
            // TODO: implement actual API call
            return new { message = "POI endpoint skeleton", city };
        }

        // =====================
        // EATANDDRINK BY MUNICIPALITY
        // =====================
        public async Task<IEnumerable<EppoiEatAndDrinksDTO>> GetEatAndDrinksAsync(string municipality, string language)
        {
            await EnsureAuthenticatedAsync();

            var url = $"/api/eat-and-drink/card-list?municipality={municipality}&language={language}";

            _logger.LogInformation($"Eppoi GetEatAndDrinksAsync Base URL: {url}");
            var response = await _httpClient.GetAsync(url);

            response.EnsureSuccessStatusCode();

            // Deserialize JSON response into DTOs
            var result = await response.Content.ReadFromJsonAsync<IEnumerable<EppoiEatAndDrinksDTO>>();
            
            _logger.LogInformation(
                $"Eppoi GetEatAndDrinksAsync response: {result.Count()} items received for municipality: {municipality}");

            // save to db if not already present
            //foreach (var m in result)
            //{
            //    bool exists = _db.EatAndDrink.Any(x => x.EntityName == m.EntityName);

            //    if (!exists)
            //    {
            //        _db.EatAndDrink.Add(new EatAndDrink
            //        {
            //            EntityName = m.EntityName,
            //            ImagePath = m.ImagePath,
            //			BadgeText = m.BadgeText,
            //			Address = m.Address
            //        });
            //        await _db.SaveChangesAsync();	
            //    }
            //}

            return result ?? Array.Empty<EppoiEatAndDrinksDTO>();
        }

        // =====================
        // EATANDDRINK DETAIL (SINGLE ITEM)
        // =====================
        public async Task<object> GetEatAndDrinkDetailAsync(string id, string language)
        {
            await EnsureAuthenticatedAsync();

            // Endpoint call: /api/eat-and-drink/detail/{identifier}
            var url = $"/api/eat-and-drink/detail/{id}?language={language}";

            _logger.LogInformation($"Eppoi GetEatAndDrinkDetailAsync calling: {url}");

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    $"Eppoi GetEatAndDrinkDetailAsync failed with status: {response.StatusCode} for ID: {id}");
                return null;
            }

            var result = await response.Content.ReadFromJsonAsync<object>();
            return result;
        }

        // =====================
        // SEARCH EXPERIENCES
        // =====================
        public async Task<object> SearchExperiencesAsync(SwaggerEppoiRequest request)
        {
            await EnsureAuthenticatedAsync();
            return new { message = "Search skeleton", request };
        }

        // =====================
        // CATEGORIES BY MUNICIPALITY
        // =====================
        public async Task<IEnumerable<EppoiCategoriesDTO>> GetCategoriesAsync(string municipality, string language)
        {
            try
            {
                var url = $"/api/categories?municipality={municipality}&language={language}";
                _logger.LogInformation($"Eppoi Base URL: {url}");

                var response = await _httpClient.GetAsync(url);
                _logger.LogInformation($"Eppoi GetCategoriesAsync response status: {response.StatusCode}");

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning($"Eppoi GetCategoriesAsync failed with status {response.StatusCode}: {errorBody}");
                    return Array.Empty<EppoiCategoriesDTO>();
                }

                var resultCategories = await response.Content.ReadFromJsonAsync<IEnumerable<EppoiCategoriesDTO>>();
                _logger.LogInformation($"Categories received from Eppoi API: {resultCategories?.Count() ?? 0} items");

                return resultCategories ?? Array.Empty<EppoiCategoriesDTO>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in GetCategoriesAsync for municipality '{municipality}'");
                return Array.Empty<EppoiCategoriesDTO>();
            }
        }
        
        // GET municipalities from Eppoi API and save into local DB table if not already present
        public async Task<IEnumerable<EppoiMunicipalitiesDTO>> GetMunicipalitiesIntoDbAsync()
        {
            await EnsureAuthenticatedAsync();

            var url = "/api/organizations/municipalities";

            var response = await _httpClient.GetAsync(url);
            _logger.LogInformation($"Eppoi GetMunicipalitiesAsync BaseUrl: {url}");
            _logger.LogInformation($"Eppoi GetMunicipalitiesAsync response status: {response.StatusCode}");
            response.EnsureSuccessStatusCode();

            // Deserialize JSON response into DTOs
            var result = await response.Content.ReadFromJsonAsync<IEnumerable<EppoiMunicipalitiesDTO>>();

            // save to database			
            int addedCount = 0;

            // save to db if not already present
            foreach (var m in result)
            {
                bool exists = _db.Municipalities.Any(x => x.LegalName == m.LegalName);

                if (!exists)
                {
                    _db.Municipalities.Add(new Municipality
                    {
                        LegalName = m.LegalName,
                        ImagePath = m.ImagePath
                    });

                    addedCount++;
                }
            }

            if (addedCount > 0)
                await _db.SaveChangesAsync();

            return result ?? Array.Empty<EppoiMunicipalitiesDTO>();
        }

        // GET municipalities from local DB table for frontend use
        public async Task<IEnumerable<EppoiMunicipalitiesDTO>> GetMunicipalitiesAsync()
        {
            var municipalities = await _db.Municipalities
                .Select(m => new EppoiMunicipalitiesDTO
                {
                    LegalName = m.LegalName,
                    ImagePath = m.ImagePath
                })
                .ToListAsync();

            return municipalities;
        }

    public async Task<IEnumerable<EppoiUnifiedCardDTO>> GetCardsAsync(
        string[] municipalities,
        string[] languages,
        string[] endpoints)
    {
        var allResults = new List<EppoiUnifiedCardDTO>();

        // Track entityId -> (endpoint, municipality)
        var entityIdMetadata = new Dictionary<string, (string endpoint, string municipality)>();

        foreach (var municipality in municipalities)
        {
            foreach (var language in languages)
            {
                foreach (var endpoint in endpoints)
                {
                    try
                    {
                        var url =
                            $"https://apispm.eppoi.io/api/{endpoint}/card-list?municipality={Uri.EscapeDataString(municipality)}&language={Uri.EscapeDataString(language)}";

                        _logger.LogInformation($"Calling Eppoi API: {url}");

                        var response = await _httpClient.GetAsync(url);

                        if (!response.IsSuccessStatusCode)
                            continue;

                        var content = await response.Content.ReadAsStringAsync();

                        var items = JsonSerializer.Deserialize<List<EppoiUnifiedCardDTO>>(content,
                            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                        if (items == null)
                            continue;

                        foreach (var item in items)
                        {
                            if (!string.IsNullOrEmpty(item.EntityId) &&
                                !entityIdMetadata.ContainsKey(item.EntityId))
                            {
                                entityIdMetadata[item.EntityId] = (endpoint, municipality);
                            }

                            item.Language = language;
                            item.Municipality = municipality;
                        }

                        allResults.AddRange(items);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error fetching {endpoint} for {municipality}");
                    }
                }
            }
        }

        // ---------------------
        // FETCH DETAILS
        // ---------------------
        int detailsFetchedCount = 0;
        int detailsSkippedCount = 0;
        int detailsErrorCount = 0;

        foreach (var kvp in entityIdMetadata)
        {
            var entityId = kvp.Key;
            var (endpoint, municipality) = kvp.Value;

            foreach (var language in languages)
            {
                try
                {
                    bool detailExists = await _db.CardItemDetails.AnyAsync(x =>
                        x.EntityId == entityId &&
                        x.Language == language);

                    if (detailExists)
                    {
                        detailsSkippedCount++;
                        continue;
                    }

                    var detailUrl =
                        $"https://apispm.eppoi.io/api/{endpoint}/detail/{Uri.EscapeDataString(entityId)}?language={Uri.EscapeDataString(language)}";

                    var detailResponse = await _httpClient.GetAsync(detailUrl);

                    if (!detailResponse.IsSuccessStatusCode)
                    {
                        detailsErrorCount++;
                        continue;
                    }

                    var detailContent = await detailResponse.Content.ReadAsStringAsync();

                    var detail = JsonSerializer.Deserialize<EppoiCardItemDetailDTO>(
                        detailContent,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (detail == null)
                        continue;

                    var detailEntity = new CardItemDetail
                    {
                        EntityId = TruncateString(entityId, 255),
                        Category = TruncateString(endpoint, 50),
                        Language = TruncateString(language, 10),
                        Municipality = TruncateString(municipality, 255),
                        Title = TruncateString(detail.Title ?? detail.Name ?? detail.EntityName, 500),
                        Description = detail.Description ?? detail.ShortDescription,
                        Address = TruncateString(detail.Address, 500),
                        PrimaryImage = TruncateString(detail.PrimaryImage ?? detail.ImagePath, 1000),
                        Latitude = detail.Latitude,
                        Longitude = detail.Longitude,
                        JsonPayload = detailContent,
                        CreatedAt = DateTime.UtcNow
                    };

                    _db.CardItemDetails.Add(detailEntity);
                    detailsFetchedCount++;

                    if (detailsFetchedCount % 50 == 0)
                        await _db.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error fetching detail for {entityId}");
                    detailsErrorCount++;
                }
            }
        }

        await _db.SaveChangesAsync();

        _logger.LogInformation($"Details saved: {detailsFetchedCount}, skipped: {detailsSkippedCount}, errors: {detailsErrorCount}");

        return allResults;
    }


        // Helper method to truncate strings
        private string TruncateString(string value, int maxLength)
        {
            if (string.IsNullOrEmpty(value))
                return value;
    
            return value.Length <= maxLength ? value : value.Substring(0, maxLength);
        }

        // =====================
        // Fetch all card details depending on the above card items
        // =====================
        private Task<List<string>> GetCardDetailsAsync()
        {
            var entityIds = _db.CardItems
                .Select(ci => ci.EntityId)
                .Distinct()
                .ToList();

            return Task.FromResult(entityIds);
        }

        // =====================
        // MAP MARKERS FOR MUNICIPALITY
        // =====================
        public async Task<object?> GetMapAsync(string municipality)
        {
            try
            {
                var cleanMunicipality = municipality;
                if (cleanMunicipality.StartsWith("Comune di ", StringComparison.OrdinalIgnoreCase))
                    cleanMunicipality = cleanMunicipality.Substring("Comune di ".Length).Trim();
                else if (cleanMunicipality.StartsWith("Commune di ", StringComparison.OrdinalIgnoreCase))
                    cleanMunicipality = cleanMunicipality.Substring("Commune di ".Length).Trim();

                var url = $"/api/map?municipality={Uri.EscapeDataString(cleanMunicipality)}";
                _logger.LogInformation($"Eppoi GetMapAsync URL: {url}");

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"Eppoi GetMapAsync returned status: {response.StatusCode}");
                    return new { markers = Array.Empty<object>(), centerLatitude = 43.0, centerLongitude = 13.8 };
                }

                var result = await response.Content.ReadFromJsonAsync<object>();
                return result ?? new { markers = Array.Empty<object>(), centerLatitude = 43.0, centerLongitude = 13.8 };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching map data for {Municipality}", municipality);
                return new { markers = Array.Empty<object>(), centerLatitude = 43.0, centerLongitude = 13.8 };
            }
        }
    }
}
