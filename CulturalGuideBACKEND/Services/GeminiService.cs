// Services/GeminiService.cs
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CulturalGuideBACKEND.Services
{
    public interface IGeminiService
    {
        Task<string> GenerateResponseAsync(string userMessage, string municipality, string language, string context);
    }

    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly ILogger<GeminiService> _logger;
        private readonly string _apiKey;

        public GeminiService(
            IHttpClientFactory httpClientFactory, 
            IConfiguration config,
            ILogger<GeminiService> logger)
        {
            _httpClient = httpClientFactory.CreateClient();
            _config = config;
            _logger = logger;
            _apiKey = _config["Gemini:ApiKey"];
        }

        public async Task<string> GenerateResponseAsync(string userMessage, string municipality, string language, string context)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(_apiKey) || _apiKey == "NEVER-PUSH-TO-GIT" || _apiKey.Contains("YOUR_"))
                {
                    _logger.LogInformation("Gemini API key is not configured in appsettings.json. Returning context-aware Swiss response.");
                    return GenerateSmartFallback(userMessage, municipality, language, context);
                }

                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";

                var systemPrompt = $@"You are a helpful travel assistant for {municipality}. 
                    You have access to information about points of interest in certain categories.
                    Be friendly, concise, and provide useful recommendations in maximum 100 words.
                    
                    Context about the area:
                    {context}
                    ";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = $"{systemPrompt}\n\nUser: {userMessage}" }
                            }
                        }
                    }
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _logger.LogInformation($"Sending request to Gemini API for municipality: {municipality}");

                var response = await _httpClient.PostAsync(url, content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Gemini API error: {response.StatusCode} - {responseString}");
                    return "I'm having trouble connecting right now. Please try again in a moment.";
                }

                var geminiResponse = JsonSerializer.Deserialize<GeminiApiResponse>(responseString);
                var generatedText = geminiResponse?.candidates?[0]?.content?.parts?[0]?.text;

                return generatedText ?? "I'm not sure how to respond to that. Could you rephrase your question?";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Gemini API");
                return "I encountered an error processing your request. Please try again.";
            }
        }

        private string GenerateSmartFallback(string userMessage, string municipality, string language, string context)
        {
            var isDe = language?.StartsWith("de", StringComparison.OrdinalIgnoreCase) ?? false;
            var isEn = language?.StartsWith("en", StringComparison.OrdinalIgnoreCase) ?? false;
            var msg = userMessage.ToLowerInvariant();

            // Extract titles and descriptions from context
            var poiMatches = new List<(string Title, string Category, string Address, string Description)>();
            var lines = context.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            string? currentTitle = null, currentCat = null, currentAddr = null, currentDesc = null;

            foreach (var line in lines)
            {
                var trimmed = line.Trim();
                if (trimmed.StartsWith("- Title:", StringComparison.OrdinalIgnoreCase))
                {
                    if (!string.IsNullOrEmpty(currentTitle))
                    {
                        poiMatches.Add((currentTitle, currentCat ?? "general", currentAddr ?? "", currentDesc ?? ""));
                        currentCat = null; currentAddr = null; currentDesc = null;
                    }
                    currentTitle = trimmed.Substring("- Title:".Length).Trim();
                }
                else if (trimmed.StartsWith("Category:", StringComparison.OrdinalIgnoreCase))
                {
                    currentCat = trimmed.Substring("Category:".Length).Trim();
                }
                else if (trimmed.StartsWith("Address:", StringComparison.OrdinalIgnoreCase))
                {
                    currentAddr = trimmed.Substring("Address:".Length).Trim();
                }
                else if (trimmed.StartsWith("Description:", StringComparison.OrdinalIgnoreCase))
                {
                    currentDesc = trimmed.Substring("Description:".Length).Trim();
                }
            }
            if (!string.IsNullOrEmpty(currentTitle))
            {
                poiMatches.Add((currentTitle, currentCat ?? "general", currentAddr ?? "", currentDesc ?? ""));
            }

            // Filter relevant POIs based on query
            List<(string Title, string Category, string Address, string Description)> relevantPois;
            if (msg.Contains("cibo") || msg.Contains("mangia") || msg.Contains("ristoran") || msg.Contains("grotto") || msg.Contains("grotti") || msg.Contains("cioccolat") || msg.Contains("formaggi") || msg.Contains("essen") || msg.Contains("food") || msg.Contains("eat") || msg.Contains("drink"))
            {
                relevantPois = poiMatches.Where(p => p.Category.Contains("eat") || p.Category.Contains("typical") || p.Category.Contains("drink")).ToList();
            }
            else if (msg.Contains("museo") || msg.Contains("musei") || msg.Contains("arte") || msg.Contains("cultur") || msg.Contains("monument") || msg.Contains("storia") || msg.Contains("museum") || msg.Contains("kunst") || msg.Contains("art"))
            {
                relevantPois = poiMatches.Where(p => p.Category.Contains("art") || p.Category.Contains("cultur")).ToList();
            }
            else if (msg.Contains("natura") || msg.Contains("lago") || msg.Contains("montagna") || msg.Contains("sentier") || msg.Contains("passeggiata") || msg.Contains("alpi") || msg.Contains("see") || msg.Contains("berge") || msg.Contains("natur") || msg.Contains("lake") || msg.Contains("trail"))
            {
                relevantPois = poiMatches.Where(p => p.Category.Contains("nature") || p.Category.Contains("route")).ToList();
            }
            else
            {
                relevantPois = poiMatches.Take(3).ToList();
            }

            if (!relevantPois.Any())
            {
                relevantPois = poiMatches.Take(3).ToList();
            }

            bool isItalian = (municipality?.Contains("(MC)") ?? false) ||
                             (municipality?.Contains("(AP)") ?? false) ||
                             (municipality?.Contains("(AN)") ?? false) ||
                             (municipality?.Contains("(PU)") ?? false) ||
                             (municipality?.Contains("(FM)") ?? false) ||
                             (context?.Contains("Italia") ?? false) ||
                             (context?.Contains("Camerino") ?? false);

            var sb = new StringBuilder();
            if (isDe)
            {
                sb.AppendLine(isItalian 
                    ? $"🇮🇹 Kulturführer Italien & Marken – Empfehlungen für {municipality}:" 
                    : $"🇨🇭 Schweizer Kulturführer – Empfehlungen für {municipality}:");
                sb.AppendLine();
                if (relevantPois.Any())
                {
                    sb.AppendLine($"Hier sind die empfohlenen Höhepunkte für Ihren Besuch in {municipality}:");
                    foreach (var poi in relevantPois.Take(3))
                    {
                        sb.AppendLine($"• **{poi.Title}**");
                        if (!string.IsNullOrWhiteSpace(poi.Address)) sb.AppendLine($"  📍 {poi.Address}");
                        if (!string.IsNullOrWhiteSpace(poi.Description)) sb.AppendLine($"  ℹ️ {poi.Description}");
                    }
                }
                else
                {
                    sb.AppendLine(isItalian
                        ? $"In {municipality} können Sie wunderschöne historische Orte, die Marken und die Aktivitäten von ESN Camerino entdecken."
                        : $"In {municipality} können Sie wunderschöne historische Orte, erstklassige Museen und malerische Schweizer Landschaften entdecken.");
                }
            }
            else if (isEn)
            {
                sb.AppendLine(isItalian
                    ? $"🇮🇹 Cultural Guide Italy & Marche – Recommendations for {municipality}:"
                    : $"🇨🇭 Swiss Cultural Guide – Recommendations for {municipality}:");
                sb.AppendLine();
                if (relevantPois.Any())
                {
                    sb.AppendLine($"Here are the top cultural recommendations for your stay in {municipality}:");
                    foreach (var poi in relevantPois.Take(3))
                    {
                        sb.AppendLine($"• **{poi.Title}**");
                        if (!string.IsNullOrWhiteSpace(poi.Address)) sb.AppendLine($"  📍 {poi.Address}");
                        if (!string.IsNullOrWhiteSpace(poi.Description)) sb.AppendLine($"  ℹ️ {poi.Description}");
                    }
                }
                else
                {
                    sb.AppendLine(isItalian
                        ? $"In {municipality}, you can explore historic Italian landmarks, universities, and student life with ESN Camerino."
                        : $"In {municipality}, you can explore historic landmarks, Swiss cultural heritage, and scenic alpine panoramas with ESN Olten.");
                }
            }
            else
            {
                sb.AppendLine(isItalian
                    ? $"🇮🇹 Guida Culturale Italia & Marche – Suggerimenti per {municipality}:"
                    : $"🇨🇭 Guida Culturale Svizzera – Suggerimenti per {municipality}:");
                sb.AppendLine();
                if (relevantPois.Any())
                {
                    sb.AppendLine($"Ecco i punti di maggiore interesse selezionati per te a {municipality}:");
                    foreach (var poi in relevantPois.Take(3))
                    {
                        sb.AppendLine($"• **{poi.Title}**");
                        if (!string.IsNullOrWhiteSpace(poi.Address)) sb.AppendLine($"  📍 {poi.Address}");
                        if (!string.IsNullOrWhiteSpace(poi.Description)) sb.AppendLine($"  ℹ️ {poi.Description}");
                    }
                }
                else
                {
                    sb.AppendLine(isItalian
                        ? $"A {municipality} puoi scoprire splendidi beni storici, borghi marchigiani, tesori d'arte e la comunità universitaria di ESN Camerino."
                        : $"A {municipality} puoi scoprire splendidi beni storici, musei dell'inventario culturale svizzero e suggestive passeggiate panoramiche.");
                }
            }

            return sb.ToString().TrimEnd();
        }
    }

    // Response models for Gemini API
    public class GeminiApiResponse
    {
        public Candidate[] candidates { get; set; }
    }

    public class Candidate
    {
        public Content content { get; set; }
    }

    public class Content
    {
        public Part[] parts { get; set; }
    }

    public class Part
    {
        public string text { get; set; }
    }
}