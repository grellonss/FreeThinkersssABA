using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using CulturalGuideBACKEND.Services.SwaggerEppoiService;

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
            _logger.LogInformation(">>> Swiss Cultural Guide startup warmup starting in background...");

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
                using var scope = _services.CreateScope();
                var swissService = scope.ServiceProvider.GetRequiredService<ISwaggerEppoiApiService>();

                // 1. Seed Swiss municipalities
                _logger.LogInformation(">>> Seeding Swiss municipalities into database...");
                await swissService.GetMunicipalitiesIntoDbAsync();

                // 2. Warm up categories
                var categories = await swissService.GetCategoriesAsync("Olten", "it");
                _logger.LogInformation($">>> Categories verified: {categories.Count()} categories loaded.");

                // 3. Preload cultural cards for partner destinations (ESN Olten CH & ESN Camerino IT)
                string[] startupCities = { "Olten", "Camerino", "Lugano", "Massignano" };
                string[] startupCategories = { "artculture", "nature", "eatanddrink", "typicalproducts" };
                string[] languages = { "it", "en" };

                foreach (var city in startupCities)
                {
                    foreach (var cat in startupCategories)
                    {
                        try
                        {
                            await swissService.GetCategoryCardsAsync(cat, city, "it");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Warmup error for {City}/{Category}", city, cat);
                        }
                    }
                }

                _logger.LogInformation(">>> Cultural Guide (Switzerland 🇨🇭 & Italy 🇮🇹) startup warmup completed successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ">>> Error during Swiss Cultural Guide startup warmup");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
