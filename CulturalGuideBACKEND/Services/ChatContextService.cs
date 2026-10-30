// Services/ChatContextService.cs
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CulturalGuideBACKEND.Data;
using CulturalGuideBACKEND.Services;

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

			// ---------------------
			// 1: Get all SelectedCategories from the user's preferences from ProfileVector
			// ---------------------

            // Get user preferences
			var userPreference = await _db.ProfileVector.FirstOrDefaultAsync(p => p.UserId == userId);

			//if (userPreference != null)
            //{
            //    context += $"User interests: {userPreference.SelectedCategories}\n";
            //    context += $"Travel dates: {userPreference.StartTime:yyyy-MM-dd} to {userPreference.EndTime:yyyy-MM-dd}\n";
            //}

            // Convert the stored string into an IEnumerable<string> (split on commas/semicolons), handle nulls
            var selectedCategoriesInput = userPreference?.SelectedCategories != null
                ? userPreference.SelectedCategories
                    .Split(new[] { ',', ';' }, System.StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim().Trim('"', '[', ']', '\''))
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                : Enumerable.Empty<string>();


			// map userPreference.SelectedCategories to CardItemDetails.Category (eatanddrink -> eat-and-drink)
			var categoriesMapped = CategoryMapper.MapMany(selectedCategoriesInput).ToList(); // IEnumerable<string> -> List<string>

			categoriesMapped.ForEach(c => 
                _logger.LogInformation($"Mapped user category to selectedCategory: {c}"));

            // Get top cards for the municipality
            //var topCards = await _db.CardItems
            //    .Where(c => c.Municipality == municipality.Substring(10))
            //    .Take(10)
            //    .Select(c => new { c.EntityName, c.BadgeText, c.Address })
            //    .ToListAsync();

			_logger.LogInformation($"Building chat context for user {userId} in municipality {municipality.Substring(10)} with language {language}.");

			// Get CardItemDetails by categories from ProfileVector
			var categoryCards = await _db.CardItemDetails
				.Where(c => c.Municipality == municipality.Substring(10)
				&& categoriesMapped.Contains(c.Category) 
				&& c.Language == language)
				.ToListAsync();
			
			_logger.LogInformation($"Found {categoryCards.Count()} cards for municipality {municipality.Substring(10)}.");
			categoryCards.ForEach(c => 
                _logger.LogInformation($"Card collected to send to GEMINI: {c.Id}, Category: {c.Category})"));
			
			// context list with all card details
            var context = string.Empty;
            
            

            if (categoryCards.Any())
            {
                context += "\nAvailable places:\n";
                foreach (var cardDetail in categoryCards)
                {
                    context += new StringBuilder()
                        .AppendLine($"- Name: {cardDetail.Id}")
                        .AppendLine($"  Category: {cardDetail.Category}")
                        .AppendLine($"  Municipality: {cardDetail.Municipality}")
                        .AppendLine($"  Address: {cardDetail.Address}")
                        .AppendLine($"  Description: {cardDetail.Description}")
                        .AppendLine($"  Language: {cardDetail.Language}")
                        .AppendLine($"  Longitude: {cardDetail.Longitude}")
                        .AppendLine($"  Latitude: {cardDetail.Latitude}");
                }
            }

			_logger.LogInformation("Chat context built successfully with the following context:");
			_logger.LogInformation(context);

            return context;
        }
    }
}