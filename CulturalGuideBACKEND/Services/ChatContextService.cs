// Services/ChatContextService.cs
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CulturalGuideBACKEND.Data;
using CulturalGuideBACKEND.Services;
using CulturalGuideBACKEND.Services.SwaggerEppoiService;

namespace CulturalGuideBACKEND.Services
{
    public interface IChatContextService
    {
        Task<string> BuildContextAsync(string municipality, string userId, string language);
    }

    public class ChatContextService : IChatContextService
    {
        private readonly AppDbContext _db;
        private readonly ILogger<ChatContextService> _logger;

        public ChatContextService(AppDbContext db, ILogger<ChatContextService> logger)
        {
            _logger = logger;
            _db = db;
        }

        public async Task<string> BuildContextAsync(string municipality, string userId, string language)
        {
            var cleanCity = SwaggerEppoiApiService.CleanMunicipality(municipality);
            var langCode = language?.ToLowerInvariant().StartsWith("de") == true ? "de"
                : language?.ToLowerInvariant().StartsWith("en") == true ? "en" : "it";

            // Get user preferences
            var userPreference = await _db.ProfileVector.FirstOrDefaultAsync(p => p.UserId == userId);

            var selectedCategoriesInput = userPreference?.SelectedCategories != null
                ? userPreference.SelectedCategories
                    .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim().Trim('"', '[', ']', '\''))
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                : Enumerable.Empty<string>();

            var categoriesMapped = CategoryMapper.MapMany(selectedCategoriesInput).ToList();

            _logger.LogInformation("Building Swiss chat context for user {UserId} in city {City} with language {Language}.",
                userId, cleanCity, langCode);

            // Fetch Swiss POI details for this city
            var query = _db.CardItemDetails.Where(c => c.Municipality == cleanCity);

            if (categoriesMapped.Any())
            {
                query = query.Where(c => categoriesMapped.Contains(c.Category) || c.Category == null);
            }

            var categoryCards = await query.Take(15).ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine($"Swiss Destination: {cleanCity}, Switzerland");
            if (userPreference != null)
            {
                sb.AppendLine($"User Travel Window: {userPreference.StartTime:yyyy-MM-dd HH:mm} to {userPreference.EndTime:yyyy-MM-dd HH:mm}");
            }

            if (categoryCards.Any())
            {
                sb.AppendLine("\nAvailable cultural attractions, sights, and places:");
                foreach (var card in categoryCards)
                {
                    sb.AppendLine($"- Title: {card.Title ?? "Attrazione Svizzera"}");
                    sb.AppendLine($"  Category: {card.Category}");
                    sb.AppendLine($"  Address: {card.Address}");
                    if (!string.IsNullOrWhiteSpace(card.Description))
                    {
                        var shortDesc = card.Description.Length > 200 ? card.Description.Substring(0, 200) + "..." : card.Description;
                        sb.AppendLine($"  Description: {shortDesc}");
                    }
                    if (card.Latitude.HasValue && card.Longitude.HasValue)
                    {
                        sb.AppendLine($"  Coordinates: Lat {card.Latitude:F4}, Lon {card.Longitude:F4}");
                    }
                }
            }
            else
            {
                sb.AppendLine($"General Highlights for {cleanCity}: museums, historic monuments, Swiss gastronomy (grotti & fondue), lake promenade, alpine panoramic trails.");
            }

            return sb.ToString();
        }
    }
}