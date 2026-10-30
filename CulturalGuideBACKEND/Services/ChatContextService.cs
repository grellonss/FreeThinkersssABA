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

            var isIt = SwaggerEppoiApiService.IsItalianDestination(cleanCity, userPreference?.Country);
            var countryName = isIt ? "Italia" : "Svizzera";
            var esnPartner = isIt ? "ESN Camerino (Italia)" : "ESN Olten (Svizzera)";

            _logger.LogInformation("Building chat context for user {UserId} in city {City} ({Country}, partner {Partner}) with language {Language}.",
                userId, cleanCity, countryName, esnPartner, langCode);

            // Fetch POI details for this city
            var query = _db.CardItemDetails.Where(c => c.Municipality == cleanCity);

            if (categoriesMapped.Any())
            {
                query = query.Where(c => categoriesMapped.Contains(c.Category) || c.Category == null);
            }

            var categoryCards = await query.Take(15).ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine($"Destination: {cleanCity}, {countryName}");
            sb.AppendLine($"Partner Organization: {esnPartner}");
            if (userPreference != null)
            {
                sb.AppendLine($"User Travel Window: {userPreference.StartTime:yyyy-MM-dd HH:mm} to {userPreference.EndTime:yyyy-MM-dd HH:mm}");
            }

            if (categoryCards.Any())
            {
                sb.AppendLine("\nAvailable cultural attractions, sights, and places:");
                foreach (var card in categoryCards)
                {
                    sb.AppendLine($"- Title: {card.Title ?? "Attrazione Culturale"}");
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
                if (isIt)
                {
                    sb.AppendLine($"General Highlights for {cleanCity}: monumenti storici, borghi marchigiani, gastronomia tipica (ciauscolo, vincisgrassi, tartufo), sentieri dei Monti Sibillini e vita universitaria UNICAM.");
                }
                else
                {
                    sb.AppendLine($"General Highlights for {cleanCity}: musei e monumenti storici elvetici, gastronomia svizzera (grotti & fondue), lungolago e fiumi, percorsi panoramici alpini e campus FHNW.");
                }
            }

            return sb.ToString();
        }
    }
}