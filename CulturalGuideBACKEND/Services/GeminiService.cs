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
                    _logger.LogWarning("Gemini API key is not configured in appsettings.json. Returning context-aware response.");
                    return $"[Gemini Assistant for {municipality}]: Currently running in local mode. You can ask about points of interest, events, and restaurants in {municipality}!";
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