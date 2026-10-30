using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using CulturalGuideBACKEND.Services.SwaggerEppoiService;
using CulturalGuideBACKEND.DTO.SwaggerEppoiDTO;

namespace CulturalGuideBACKEND.Services
{
    public class AppStartupService : IHostedService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<AppStartupService> _logger;

        public AppStartupService(IServiceProvider services, ILogger<AppStartupService> logger)
        {
            _services = services;
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation(">>> App startup service starting in background...");

            _ = Task.Run(async () =>
            {
                await RunWarmupAsync();
            }, cancellationToken);

            return Task.CompletedTask;
        }

        private async Task RunWarmupAsync()
        {

            try
            {
                // Create scope because ISwaggerEppoiApiService is scoped
                using var scope = _services.CreateScope();

                string municipality = "Massignano";
                string language = "it";

                var eppoiService = scope.ServiceProvider.GetRequiredService<ISwaggerEppoiApiService>();

                _logger.LogInformation(">>> Calling GetCategoriesAsync on startup...");

                var categories = await eppoiService.GetCategoriesAsync(municipality, language);

                _logger.LogInformation($">>> Categories received: {categories.Count()}");

                foreach (var c in categories)
                {
                    _logger.LogInformation($" - Category: {c.Category}, Label: {c.Label}, ImagePath: {c.ImagePath}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ">>> Error calling GetCategoriesAsync on startup");
            }

            // ---------------------
            // invoke GetMunicipalitiesAsync at every startup to warm up the db
            // ---------------------
            try
            {
                using var scope = _services.CreateScope();
                var eppoiService = scope.ServiceProvider.GetRequiredService<ISwaggerEppoiApiService>();
                await eppoiService.GetMunicipalitiesIntoDbAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ">>> Error calling GetMunicipalitiesAsync on startup");
            }

            _logger.LogInformation(">>> Startup service finished.");
            
            // ---------------------
            // invoke GetAllCards at every startup to provide content to the db for the chatbot
            // ---------------------
            try
            {
                using var scope = _services.CreateScope();
                var eppoiService = scope.ServiceProvider.GetRequiredService<ISwaggerEppoiApiService>();

                // endpoints used in app
                string[] endpoints = new string[]
                {
                    "art-culture",
                    "articles",
                    "eat-and-drink",
                    "entertainment-leisure",
                    "events",
                    "nature",
                    "organizations",
                    "routes",
                    "services",
                    "shopping",
                    "sleep",
                    "typical-products"
                };

                // languages used in app
                string[] languages = new string[] { "it", "en", "de" };
                
                // municipalities used in app
                var allMunicipalities = await eppoiService.GetMunicipalitiesAsync();
                string[] municipalities = allMunicipalities
                    .Select(m => {
                        var name = m?.LegalName ?? string.Empty;
                        if (name.StartsWith("Comune di ", StringComparison.OrdinalIgnoreCase))
                            return name.Substring("Comune di ".Length).Trim();
                        if (name.StartsWith("Commune di ", StringComparison.OrdinalIgnoreCase))
                            return name.Substring("Commune di ".Length).Trim();
                        return name.Trim();
                    })
                    .Where(name => !string.IsNullOrWhiteSpace(name))
                    .ToArray();

                if (municipalities.Length > 0)
                {
                    await eppoiService.GetCardsAsync(municipalities, languages, endpoints);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ">>> Error calling GetCardsAsync on startup");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            // Nothing to clean up
            return Task.CompletedTask;
        }
    }
}
