using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using CulturalGuideBACKEND.Data;
using CulturalGuideBACKEND.DTO.SwaggerEppoiDTO;
using CulturalGuideBACKEND.Models;

namespace CulturalGuideBACKEND.Services.SwaggerEppoiService
{
    public class SwaggerEppoiApiService : ISwaggerEppoiApiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly ILogger<SwaggerEppoiApiService> _logger;
        private readonly AppDbContext _db;

        // Predefined Swiss Cities with accurate coordinates and high-res imagery (ESN Olten partner)
        // Predefined Swiss Cities with accurate coordinates and authentic imagery (ESN Olten partner)
        private static readonly List<CityLocationInfo> SwissCities = new()
        {
            new("Olten", "SO", "CH", 47.3522, 7.9077, "https://commons.wikimedia.org/wiki/Special:FilePath/Alte%20Br%C3%BCcke%20in%20Olten-20140514.jpg?width=800"),
            new("Lugano", "TI", "CH", 46.0037, 8.9511, "https://images.unsplash.com/photo-1573155993874-d5d48af862ba?w=800&auto=format&fit=crop&q=80"),
            new("Zürich", "ZH", "CH", 47.3769, 8.5417, "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&auto=format&fit=crop&q=80"),
            new("Bern", "BE", "CH", 46.9480, 7.4474, "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop&q=80"),
            new("Genève", "GE", "CH", 46.2044, 6.1432, "https://images.unsplash.com/photo-1573157268794-074f636dd81c?w=800&auto=format&fit=crop&q=80"),
            new("Luzern", "LU", "CH", 47.0502, 8.3093, "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&auto=format&fit=crop&q=80"),
            new("Basel", "BS", "CH", 47.5596, 7.5886, "https://images.unsplash.com/photo-1573152958734-522207829467?w=800&auto=format&fit=crop&q=80"),
            new("Bellinzona", "TI", "CH", 46.1928, 9.0227, "https://commons.wikimedia.org/wiki/Special:FilePath/Castelgrande_Bellinzona.jpg?width=800"),
            new("Locarno", "TI", "CH", 46.1685, 8.7984, "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80"),
            new("Lausanne", "VD", "CH", 46.5197, 6.6323, "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80"),
            new("Zermatt", "VS", "CH", 45.9765, 7.7491, "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=800&auto=format&fit=crop&q=80"),
            new("St. Moritz", "GR", "CH", 46.4908, 9.8355, "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&auto=format&fit=crop&q=80"),
            new("Interlaken", "BE", "CH", 46.6863, 7.8632, "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80"),
            new("Montreux", "VD", "CH", 46.4312, 6.9107, "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&auto=format&fit=crop&q=80"),
            new("St. Gallen", "SG", "CH", 47.4245, 9.3767, "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=800&auto=format&fit=crop&q=80"),
            new("Ascona", "TI", "CH", 46.1558, 8.7731, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80"),
            new("Mendrisio", "TI", "CH", 45.8703, 8.9863, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"),
            new("Neuchâtel", "NE", "CH", 46.9896, 6.9293, "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80"),
            new("Sion", "VS", "CH", 46.2331, 7.3606, "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80"),
            new("Chur", "GR", "CH", 46.8508, 9.5320, "https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800&auto=format&fit=crop&q=80"),
            new("Fribourg", "FR", "CH", 46.8065, 7.1620, "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80"),
            new("Schaffhausen", "SH", "CH", 47.6959, 8.6380, "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop&q=80"),
            new("Thun", "BE", "CH", 46.7580, 7.6280, "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80")
        };

        // Predefined Italian Cities (Marche & partners - ESN Camerino partner)
        private static readonly List<CityLocationInfo> ItalianCities = new()
        {
            new("Camerino", "MC", "IT", 43.1364, 13.0683, "https://commons.wikimedia.org/wiki/Special:FilePath/Camerino_veduta_04.jpg?width=800"),
            new("Massignano", "AP", "IT", 43.0519, 13.7972, "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80"),
            new("Urbino", "PU", "IT", 43.7262, 12.6366, "https://images.unsplash.com/photo-1548625361-19597282b0f4?w=800&auto=format&fit=crop&q=80"),
            new("Ascoli Piceno", "AP", "IT", 42.8546, 13.5758, "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&auto=format&fit=crop&q=80"),
            new("Macerata", "MC", "IT", 43.3002, 13.4533, "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80"),
            new("Recanati", "MC", "IT", 43.4037, 13.5505, "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80"),
            new("Ancona", "AN", "IT", 43.6158, 13.5189, "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80"),
            new("San Benedetto del Tronto", "AP", "IT", 42.9467, 13.8828, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"),
            new("Fermo", "FM", "IT", 43.1614, 13.7176, "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop&q=80"),
            new("Pesaro", "PU", "IT", 43.9125, 12.9155, "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80"),
            new("Jesi", "AN", "IT", 43.5225, 13.2439, "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=800&auto=format&fit=crop&q=80"),
            new("Loreto", "AN", "IT", 43.4419, 13.6094, "https://commons.wikimedia.org/wiki/Special:FilePath/Santuario_della_Santa_Casa_di_Loreto.jpg?width=800"),
            new("Senigallia", "AN", "IT", 43.7144, 13.2183, "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80")
        };

        // Rich pool of unique, authentic Swiss images (Guaranteed distinct - no repetition!)
        private static readonly string[] DistinctSwissImages = new[]
        {
            "https://commons.wikimedia.org/wiki/Special:FilePath/Alte%20Br%C3%BCcke%20in%20Olten-20140514.jpg?width=800",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Old_town_panorama_with_covered_bridge_and_Stadtturm%2C_Olten%2C_Solothurn.jpg?width=800",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Aarburg_-_Festung_01.jpg?width=800",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Olten%20-%20Rathaus%202.jpg?width=800",
            "https://upload.wikimedia.org/wikipedia/commons/a/ad/Picswiss_SO-18-02.jpg",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Solothurn_St_Ursenkathedrale.jpg?width=800",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Castelgrande_Bellinzona.jpg?width=800",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Bern_-_Zytglogge_01.jpg?width=800",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Gandria_-_Lago_di_Lugano.jpg?width=800",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Luzern_Kapellbr%C3%BCcke_mit_Wasserturm.jpg?width=800",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Grossm%C3%BCnster_Z%C3%BCrich.jpg?width=800",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Chillon_Castle_from_Montreux.jpg?width=800",
            "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1573155993874-d5d48af862ba?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1573157268794-074f636dd81c?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1573152958734-522207829467?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80"
        };

        // Rich pool of unique, authentic Italian & Marche images (Guaranteed distinct - no repetition!)
        private static readonly string[] DistinctItalianImages = new[]
        {
            "https://commons.wikimedia.org/wiki/Special:FilePath/Camerino_veduta_04.jpg?width=800",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Palazzo_Ducale_Camerino.jpg?width=800",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Rocca_Borgesca_Camerino.jpg?width=800",
            "https://commons.wikimedia.org/wiki/Special:FilePath/Santuario_della_Santa_Casa_di_Loreto.jpg?width=800",
            "https://images.unsplash.com/photo-1548625361-19597282b0f4?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80"
        };

        public SwaggerEppoiApiService(
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            ILogger<SwaggerEppoiApiService> logger,
            AppDbContext db)
        {
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "CulturalGuide/3.0 (DualSwissItalian; info@culturalguide.eu)");
            _config = config;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _db = db;
        }

        public record CityLocationInfo(string Name, string ProvinceOrCanton, string Country, double Latitude, double Longitude, string Image);

        public static string CleanMunicipality(string? name)
        {
            if (string.IsNullOrWhiteSpace(name)) return "Olten";
            var clean = name.Trim();

            // Strip typical prefixes if present
            string[] prefixes = { "Comune di ", "Commune di ", "Commune de ", "Gemeinde ", "Comune ", "Commune " };
            foreach (var p in prefixes)
            {
                if (clean.StartsWith(p, StringComparison.OrdinalIgnoreCase))
                {
                    clean = clean.Substring(p.Length).Trim();
                    break;
                }
            }

            // If it ends with code in parenthesis like " (TI)", " (MC)", extract the city name
            var parenIdx = clean.IndexOf('(');
            if (parenIdx > 0)
            {
                clean = clean.Substring(0, parenIdx).Trim();
            }

            return string.IsNullOrWhiteSpace(clean) ? "Olten" : clean;
        }

        public static bool IsItalianDestination(string? municipality, string? country = null)
        {
            if (!string.IsNullOrWhiteSpace(country))
            {
                if (country.Equals("IT", StringComparison.OrdinalIgnoreCase) ||
                    country.Equals("Italia", StringComparison.OrdinalIgnoreCase) ||
                    country.Equals("Italy", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }

            if (string.IsNullOrWhiteSpace(municipality)) return false;
            var clean = CleanMunicipality(municipality);
            return ItalianCities.Any(c => c.Name.Equals(clean, StringComparison.OrdinalIgnoreCase) ||
                                          clean.Contains(c.Name, StringComparison.OrdinalIgnoreCase) ||
                                          c.Name.Contains(clean, StringComparison.OrdinalIgnoreCase));
        }

        private CityLocationInfo ResolveCity(string? municipality, string? country = null)
        {
            var clean = CleanMunicipality(municipality);
            var isIt = IsItalianDestination(clean, country);

            if (isIt)
            {
                var matchIt = ItalianCities.FirstOrDefault(c => c.Name.Equals(clean, StringComparison.OrdinalIgnoreCase));
                if (matchIt != null) return matchIt;

                var partialIt = ItalianCities.FirstOrDefault(c => c.Name.Contains(clean, StringComparison.OrdinalIgnoreCase) || clean.Contains(c.Name, StringComparison.OrdinalIgnoreCase));
                if (partialIt != null) return partialIt;

                // Default to Camerino (MC) for Italian destinations
                return ItalianCities[0];
            }

            var matchCh = SwissCities.FirstOrDefault(c => c.Name.Equals(clean, StringComparison.OrdinalIgnoreCase));
            if (matchCh != null) return matchCh;

            var partialCh = SwissCities.FirstOrDefault(c => c.Name.Contains(clean, StringComparison.OrdinalIgnoreCase) || clean.Contains(c.Name, StringComparison.OrdinalIgnoreCase));
            if (partialCh != null) return partialCh;

            // Default to Olten (SO) for Swiss destinations
            return SwissCities[0];
        }

        // =====================
        // MUNICIPALITIES
        // =====================
        public async Task<IEnumerable<EppoiMunicipalitiesDTO>> GetMunicipalitiesIntoDbAsync()
        {
            int added = 0;
            // Seed Swiss cities
            foreach (var city in SwissCities)
            {
                string legalName = $"{city.Name} ({city.ProvinceOrCanton})";
                bool exists = await _db.Municipalities.AnyAsync(x => x.LegalName == legalName || x.LegalName == city.Name);
                if (!exists)
                {
                    _db.Municipalities.Add(new Municipality
                    {
                        LegalName = legalName,
                        ImagePath = city.Image
                    });
                    added++;
                }
            }

            // Seed Italian cities
            foreach (var city in ItalianCities)
            {
                string legalName = $"{city.Name} ({city.ProvinceOrCanton})";
                bool exists = await _db.Municipalities.AnyAsync(x => x.LegalName == legalName || x.LegalName == city.Name);
                if (!exists)
                {
                    _db.Municipalities.Add(new Municipality
                    {
                        LegalName = legalName,
                        ImagePath = city.Image
                    });
                    added++;
                }
            }

            if (added > 0)
            {
                await _db.SaveChangesAsync();
                _logger.LogInformation($"Seeded {added} Swiss & Italian municipalities into SQLite DB.");
            }

            return await GetMunicipalitiesAsync();
        }

        public async Task<IEnumerable<EppoiMunicipalitiesDTO>> GetMunicipalitiesAsync(string? country = null)
        {
            var isIt = country?.Equals("IT", StringComparison.OrdinalIgnoreCase) == true;
            var isCh = country?.Equals("CH", StringComparison.OrdinalIgnoreCase) == true;

            var list = new List<EppoiMunicipalitiesDTO>();

            if (isIt)
            {
                return ItalianCities.Select(c => new EppoiMunicipalitiesDTO
                {
                    LegalName = $"{c.Name} ({c.ProvinceOrCanton})",
                    Canton = c.ProvinceOrCanton,
                    Country = "IT",
                    Latitude = c.Latitude,
                    Longitude = c.Longitude,
                    ImagePath = c.Image
                }).ToList();
            }

            if (isCh)
            {
                return SwissCities.Select(c => new EppoiMunicipalitiesDTO
                {
                    LegalName = $"{c.Name} ({c.ProvinceOrCanton})",
                    Canton = c.ProvinceOrCanton,
                    Country = "CH",
                    Latitude = c.Latitude,
                    Longitude = c.Longitude,
                    ImagePath = c.Image
                }).ToList();
            }

            // Both countries (Olten and Camerino at top)
            list.AddRange(SwissCities.Select(c => new EppoiMunicipalitiesDTO
            {
                LegalName = $"{c.Name} ({c.ProvinceOrCanton})",
                Canton = c.ProvinceOrCanton,
                Country = "CH",
                Latitude = c.Latitude,
                Longitude = c.Longitude,
                ImagePath = c.Image
            }));

            list.AddRange(ItalianCities.Select(c => new EppoiMunicipalitiesDTO
            {
                LegalName = $"{c.Name} ({c.ProvinceOrCanton})",
                Canton = c.ProvinceOrCanton,
                Country = "IT",
                Latitude = c.Latitude,
                Longitude = c.Longitude,
                ImagePath = c.Image
            }));

            return list;
        }

        public Task<IEnumerable<EppoiMunicipalitiesDTO>> GetMunicipalitiesAsync() => GetMunicipalitiesAsync(null);

        public async Task<IEnumerable<EppoiMunicipalitiesDTO>> SearchMunicipalitiesAsync(string query, string? country = null)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return await GetMunicipalitiesAsync(country);
            }

            var cleanQuery = query.Trim();
            var matches = new List<EppoiMunicipalitiesDTO>();

            var allowCh = string.IsNullOrWhiteSpace(country) || country.Equals("CH", StringComparison.OrdinalIgnoreCase);
            var allowIt = string.IsNullOrWhiteSpace(country) || country.Equals("IT", StringComparison.OrdinalIgnoreCase);

            if (allowCh)
            {
                matches.AddRange(SwissCities
                    .Where(c => c.Name.Contains(cleanQuery, StringComparison.OrdinalIgnoreCase) ||
                                c.ProvinceOrCanton.Equals(cleanQuery, StringComparison.OrdinalIgnoreCase))
                    .Select(c => new EppoiMunicipalitiesDTO
                    {
                        LegalName = $"{c.Name} ({c.ProvinceOrCanton})",
                        ImagePath = c.Image,
                        Canton = c.ProvinceOrCanton,
                        Country = "CH",
                        Latitude = c.Latitude,
                        Longitude = c.Longitude
                    }));
            }

            if (allowIt)
            {
                matches.AddRange(ItalianCities
                    .Where(c => c.Name.Contains(cleanQuery, StringComparison.OrdinalIgnoreCase) ||
                                c.ProvinceOrCanton.Equals(cleanQuery, StringComparison.OrdinalIgnoreCase))
                    .Select(c => new EppoiMunicipalitiesDTO
                    {
                        LegalName = $"{c.Name} ({c.ProvinceOrCanton})",
                        ImagePath = c.Image,
                        Canton = c.ProvinceOrCanton,
                        Country = "IT",
                        Latitude = c.Latitude,
                        Longitude = c.Longitude
                    }));
            }

            // If Swiss search requested or generic search, also try GeoAdmin
            if (allowCh && matches.Count < 5)
            {
                try
                {
                    var geoUrl = $"https://api3.geo.admin.ch/rest/services/ech/SearchServer?type=locations&origins=gg25&searchText={Uri.EscapeDataString(cleanQuery)}";
                    var geoResponse = await _httpClient.GetAsync(geoUrl);
                    if (geoResponse.IsSuccessStatusCode)
                    {
                        var content = await geoResponse.Content.ReadAsStringAsync();
                        using var doc = JsonDocument.Parse(content);
                        if (doc.RootElement.TryGetProperty("results", out var resultsElement))
                        {
                            foreach (var res in resultsElement.EnumerateArray())
                            {
                                if (res.TryGetProperty("attrs", out var attrs))
                                {
                                    var label = attrs.TryGetProperty("label", out var lbl) ? lbl.GetString() ?? "" : "";
                                    label = Regex.Replace(label, "<.*?>", string.Empty).Trim();
                                    var lat = attrs.TryGetProperty("lat", out var lt) ? lt.GetDouble() : 47.3;
                                    var lon = attrs.TryGetProperty("lon", out var ln) ? ln.GetDouble() : 7.9;
                                    var detail = attrs.TryGetProperty("detail", out var dt) ? dt.GetString() ?? "" : "";
                                    var canton = detail.Split(' ').LastOrDefault()?.ToUpperInvariant() ?? "CH";

                                    if (!matches.Any(m => m.LegalName.Equals(label, StringComparison.OrdinalIgnoreCase)))
                                    {
                                        matches.Add(new EppoiMunicipalitiesDTO
                                        {
                                            LegalName = label,
                                            ImagePath = "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&auto=format&fit=crop&q=80",
                                            Canton = canton,
                                            Country = "CH",
                                            Latitude = lat,
                                            Longitude = lon
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "GeoAdmin search failed for query: {Query}", query);
                }
            }

            return matches;
        }

        public Task<IEnumerable<EppoiMunicipalitiesDTO>> SearchMunicipalitiesAsync(string query) => SearchMunicipalitiesAsync(query, null);

        // =====================
        // CATEGORIES
        // =====================
        public Task<IEnumerable<EppoiCategoriesDTO>> GetCategoriesAsync(string municipality, string language)
        {
            var isIt = language?.StartsWith("it", StringComparison.OrdinalIgnoreCase) ?? true;
            var isDe = language?.StartsWith("de", StringComparison.OrdinalIgnoreCase) ?? false;

            var categories = new List<EppoiCategoriesDTO>
            {
                new()
                {
                    Category = "artculture",
                    Label = isIt ? "Arte, Musei e Monumenti" : (isDe ? "Kunst, Museen & Denkmäler" : "Art, Museums & Heritage"),
                    ImagePath = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
                },
                new()
                {
                    Category = "nature",
                    Label = isIt ? "Natura, Laghi e Vette Alpine" : (isDe ? "Natur, Seen & Alpengipfel" : "Nature, Lakes & Alpine Peaks"),
                    ImagePath = "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=600&auto=format&fit=crop&q=80"
                },
                new()
                {
                    Category = "eatanddrink",
                    Label = isIt ? "Enogastronomia, Grotti e Fondue" : (isDe ? "Gastronomie, Grotti & Fondue" : "Gastronomy, Grotti & Fondue"),
                    ImagePath = "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
                },
                new()
                {
                    Category = "routes",
                    Label = isIt ? "Itinerari Panoramici e Sentieri" : (isDe ? "Panoramowege & Wanderrouten" : "Scenic Trails & Routes"),
                    ImagePath = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80"
                },
                new()
                {
                    Category = "typicalproducts",
                    Label = isIt ? "Prodotti Tipici, Cioccolato e Formaggi" : (isDe ? "Schweizer Schokolade & Käse" : "Swiss Chocolate & Cheese"),
                    ImagePath = "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80"
                },
                new()
                {
                    Category = "events",
                    Label = isIt ? "Eventi, Festival e Tradizioni" : (isDe ? "Events, Festivals & Traditionen" : "Events, Festivals & Traditions"),
                    ImagePath = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80"
                },
                new()
                {
                    Category = "sleep",
                    Label = isIt ? "Ospitalità, Chalet e Grand Hotel" : (isDe ? "Hotels, Chalets & Unterkünfte" : "Hotels, Chalets & Stays"),
                    ImagePath = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"
                },
                new()
                {
                    Category = "shopping",
                    Label = isIt ? "Shopping, Orologeria e Boutique" : (isDe ? "Shopping, Uhrmacherei & Boutiquen" : "Shopping, Watches & Boutiques"),
                    ImagePath = "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=600&auto=format&fit=crop&q=80"
                },
                new()
                {
                    Category = "entertainmentleisure",
                    Label = isIt ? "Svago, Terme e Treni Panoramici" : (isDe ? "Freizeit, Wellness & Panoramazüge" : "Leisure, Thermal Spas & Trains"),
                    ImagePath = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80"
                }
            };

            return Task.FromResult<IEnumerable<EppoiCategoriesDTO>>(categories);
        }

        // =====================
        // EAT AND DRINKS (For compatibility)
        // =====================
        public async Task<IEnumerable<EppoiEatAndDrinksDTO>> GetEatAndDrinksAsync(string municipality, string language)
        {
            var cards = await GetCategoryCardsAsync("eatanddrink", municipality, language);
            return cards.Select(c => new EppoiEatAndDrinksDTO
            {
                EntityId = c.EntityId ?? Guid.NewGuid().ToString(),
                EntityName = c.EntityName ?? "Specialità Svizzera",
                ImagePath = c.ImagePath ?? "https://images.unsplash.com/photo-1544025162-d76694265947?w=600",
                BadgeText = c.BadgeText ?? "Gastronomia Tipica",
                Address = c.Address ?? $"{CleanMunicipality(municipality)}, Svizzera",
                Description = c.Description,
                Latitude = c.Latitude,
                Longitude = c.Longitude
            }).ToList();
        }

        // =====================
        // CATEGORY CARDS MAIN FETCH
        // =====================
        public async Task<IEnumerable<EppoiUnifiedCardDTO>> GetCategoryCardsAsync(string category, string municipality, string language, string? country = null)
        {
            var cleanCity = CleanMunicipality(municipality);
            var isItalian = IsItalianDestination(cleanCity, country);
            var cityInfo = ResolveCity(cleanCity, country);
            var langCode = language?.ToLowerInvariant() switch
            {
                var s when s != null && s.StartsWith("de") => "de",
                var s when s != null && s.StartsWith("en") => "en",
                var s when s != null && s.StartsWith("fr") => "fr",
                _ => "it"
            };

            var normalizedCategory = CategoryMapper.Map(category);
            var results = new List<EppoiUnifiedCardDTO>();

            // 1. Check local DB for cached cards
            var cachedCards = await _db.CardItemDetails
                .Where(c => c.Municipality == cleanCity &&
                            (c.Category == normalizedCategory || c.Category == category) &&
                            c.Language == langCode)
                .ToListAsync();

            if (cachedCards.Count >= 3)
            {
                _logger.LogInformation($"Returning {cachedCards.Count} cached items for {cleanCity}/{category} ({langCode})");
                var cachedList = cachedCards.Select(c => new EppoiUnifiedCardDTO
                {
                    EntityId = c.EntityId,
                    EntityName = c.Title,
                    BadgeText = c.Category,
                    Address = c.Address,
                    ImagePath = c.PrimaryImage,
                    Description = c.Description,
                    Latitude = c.Latitude,
                    Longitude = c.Longitude,
                    Language = c.Language,
                    Municipality = c.Municipality
                }).ToList();

                // Guarantee that even cached items don't have repeating images
                EnsureUniqueImages(cachedList, isItalian);
                return cachedList;
            }

            if (isItalian)
            {
                // 2a. Fetch from Eppoi Marche API (with 2.5s cancellation timeout)
                var eppoiCards = await FetchFromEppoiMarcheAsync(cleanCity, normalizedCategory, langCode);
                results.AddRange(eppoiCards);

                // 2b. Fetch from Wikipedia Geosearch around Italian city coordinates
                var wikiCards = await FetchFromWikipediaAsync(cityInfo, normalizedCategory, langCode);
                foreach (var w in wikiCards)
                {
                    if (!results.Any(r => r.EntityName?.Equals(w.EntityName, StringComparison.OrdinalIgnoreCase) == true))
                    {
                        results.Add(w);
                    }
                }

                // 2c. Enrich with authentic Italian/Marche cultural cards (Camerino, Massignano, etc.)
                var curatedCards = GetCuratedItalianCards(cleanCity, cityInfo, normalizedCategory, langCode);
                foreach (var c in curatedCards)
                {
                    if (!results.Any(r => r.EntityName?.Equals(c.EntityName, StringComparison.OrdinalIgnoreCase) == true))
                    {
                        results.Add(c);
                    }
                }
            }
            else
            {
                // 2a. Fetch from Official Swiss Geodata (geo.admin.ch KGS Inventar)
                var geoCards = await FetchFromGeoAdminAsync(cleanCity, normalizedCategory, langCode);
                results.AddRange(geoCards);

                // 2b. Fetch from Wikipedia Geosearch around Swiss city coordinates
                var wikiCards = await FetchFromWikipediaAsync(cityInfo, normalizedCategory, langCode);
                foreach (var w in wikiCards)
                {
                    if (!results.Any(r => r.EntityName?.Equals(w.EntityName, StringComparison.OrdinalIgnoreCase) == true))
                    {
                        results.Add(w);
                    }
                }

                // 2c. Enrich with authentic Swiss regional sights (Olten, Lugano, etc.)
                var curatedCards = GetCuratedSwissCards(cleanCity, cityInfo, normalizedCategory, langCode);
                foreach (var c in curatedCards)
                {
                    if (!results.Any(r => r.EntityName?.Equals(c.EntityName, StringComparison.OrdinalIgnoreCase) == true))
                    {
                        results.Add(c);
                    }
                }
            }

            // 2d. Guarantee distinct, non-repeating images across all cards!
            EnsureUniqueImages(results, isItalian);

            // 3. Cache newly fetched cards into DB for fast retrieval and Gemini chatbot context
            await SaveCardsToDbAsync(results, cleanCity, normalizedCategory, langCode);

            return results;
        }

        private static void EnsureUniqueImages(List<EppoiUnifiedCardDTO> cards, bool isItalian)
        {
            var pool = isItalian ? DistinctItalianImages : DistinctSwissImages;
            var usedImages = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            int poolIndex = 0;

            foreach (var card in cards)
            {
                if (string.IsNullOrWhiteSpace(card.ImagePath) || usedImages.Contains(card.ImagePath) || card.ImagePath.Contains("photo-1568084680786-a84f91d1153c"))
                {
                    while (poolIndex < pool.Length && usedImages.Contains(pool[poolIndex]))
                    {
                        poolIndex++;
                    }

                    if (poolIndex < pool.Length)
                    {
                        card.ImagePath = pool[poolIndex];
                        poolIndex++;
                    }
                    else
                    {
                        var baseImg = pool[(poolIndex++) % pool.Length];
                        card.ImagePath = $"{baseImg}&sig={Guid.NewGuid().ToString("N")[..6]}";
                    }
                }

                if (!string.IsNullOrWhiteSpace(card.ImagePath))
                {
                    usedImages.Add(card.ImagePath);
                }
            }
        }

        public Task<IEnumerable<EppoiUnifiedCardDTO>> GetCategoryCardsAsync(string category, string municipality, string language)
            => GetCategoryCardsAsync(category, municipality, language, null);

        // =====================
        // EPPOI MARCHE API (ITALY)
        // =====================
        private async Task<List<EppoiUnifiedCardDTO>> FetchFromEppoiMarcheAsync(string cleanCity, string category, string langCode)
        {
            var list = new List<EppoiUnifiedCardDTO>();
            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(2500));
                string ep = category switch
                {
                    "artculture" => "art-culture",
                    "nature" => "nature",
                    "events" => "events",
                    "sleep" => "sleep",
                    "shopping" => "shopping",
                    "entertainmentleisure" => "entertainment-leisure",
                    "eatanddrink" => "eat-and-drinks",
                    "typicalproducts" => "typical-products",
                    "routes" => "routes",
                    _ => category
                };

                var url = $"https://apispm.eppoi.io/api/{ep}/card-list?municipality={Uri.EscapeDataString(cleanCity)}&language={langCode}";
                var response = await _httpClient.GetAsync(url, cts.Token);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync(cts.Token);
                    using var doc = JsonDocument.Parse(content);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var el in doc.RootElement.EnumerateArray())
                        {
                            var id = el.TryGetProperty("entityId", out var idProp) ? idProp.GetString() : Guid.NewGuid().ToString();
                            var name = el.TryGetProperty("entityName", out var nProp) ? nProp.GetString() : null;
                            if (string.IsNullOrWhiteSpace(name) && el.TryGetProperty("title", out var tProp))
                            {
                                name = tProp.GetString();
                            }
                            if (string.IsNullOrWhiteSpace(name)) continue;

                            var badge = el.TryGetProperty("badgeText", out var bProp) ? bProp.GetString() : "Marche Turismo";
                            var addr = el.TryGetProperty("address", out var aProp) ? aProp.GetString() : $"{cleanCity}, Marche, Italia";
                            var desc = el.TryGetProperty("description", out var dProp) ? dProp.GetString() : badge;
                            var img = el.TryGetProperty("imagePath", out var imgProp) ? imgProp.GetString() : null;
                            if (!string.IsNullOrWhiteSpace(img) && !img.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                            {
                                img = $"https://eppoi.io{img}";
                            }
                            if (string.IsNullOrWhiteSpace(img))
                            {
                                img = "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=800&auto=format&fit=crop&q=80";
                            }

                            list.Add(new EppoiUnifiedCardDTO
                            {
                                EntityId = id,
                                EntityName = name,
                                BadgeText = badge,
                                Address = addr,
                                ImagePath = img,
                                Description = desc,
                                Language = langCode,
                                Municipality = cleanCity
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Eppoi Marche API unreachable or timed out for {City}/{Category}: {Msg}", cleanCity, category, ex.Message);
            }
            return list;
        }

        // =====================
        // GEO.ADMIN.CH CULTURAL HERITAGE (KGS INVENTAR)
        // =====================
        private async Task<List<EppoiUnifiedCardDTO>> FetchFromGeoAdminAsync(string cleanCity, string category, string langCode)
        {
            var list = new List<EppoiUnifiedCardDTO>();
            try
            {
                var url = $"https://api3.geo.admin.ch/rest/services/ech/MapServer/find?layer=ch.babs.kulturgueter&searchText={Uri.EscapeDataString(cleanCity)}&searchField=gemeinde&returnGeometry=true&sr=4326";
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return list;

                var content = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(content);
                if (!doc.RootElement.TryGetProperty("results", out var resultsElem)) return list;

                foreach (var item in resultsElem.EnumerateArray())
                {
                    if (list.Count >= 8) break;

                    var featureId = item.TryGetProperty("featureId", out var fid) ? fid.GetString() ?? Guid.NewGuid().ToString() : Guid.NewGuid().ToString();
                    double? lat = null, lon = null;
                    if (item.TryGetProperty("geometry", out var geom))
                    {
                        if (geom.TryGetProperty("y", out var y)) lat = y.GetDouble();
                        if (geom.TryGetProperty("x", out var x)) lon = x.GetDouble();
                    }

                    if (item.TryGetProperty("attributes", out var attrs))
                    {
                        var label = attrs.TryGetProperty("label", out var lbl) ? lbl.GetString() ?? "" : "";
                        var desc = attrs.TryGetProperty("beschreibung", out var bsc) ? bsc.GetString() ?? label : label;
                        var address = attrs.TryGetProperty("adresse_list", out var adr) ? adr.GetString() ?? "" : "";
                        var kanton = attrs.TryGetProperty("kanton", out var kt) ? kt.GetString() ?? "" : "";
                        var bildList = attrs.TryGetProperty("bild_url_list", out var bld) ? bld.GetString() ?? "" : "";
                        var image = bildList.Split(',').FirstOrDefault(s => !string.IsNullOrWhiteSpace(s))?.Trim();

                        if (string.IsNullOrWhiteSpace(image))
                        {
                            image = await TryFindAuthenticWebImageAsync(label, cleanCity, kanton, langCode);
                        }

                        var categoryLabel = langCode switch
                        {
                            "de" => "KGS Kulturgut A",
                            "en" => "Swiss National Heritage",
                            _ => "Bene Culturale Svizzero"
                        };

                        if (!string.IsNullOrWhiteSpace(label))
                        {
                            list.Add(new EppoiUnifiedCardDTO
                            {
                                EntityId = $"geo-kgs-{featureId}",
                                EntityName = label,
                                BadgeText = $"{categoryLabel} ({kanton})",
                                Address = !string.IsNullOrWhiteSpace(address) ? $"{address}, {cleanCity} ({kanton})" : $"{cleanCity} ({kanton}), Svizzera",
                                ImagePath = image,
                                Description = desc,
                                Latitude = lat,
                                Longitude = lon,
                                Language = langCode,
                                Municipality = cleanCity
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error querying geo.admin.ch for {City}", cleanCity);
            }

            return list;
        }

        private async Task<string> TryFindAuthenticWebImageAsync(string query, string cityName, string kanton, string langCode)
        {
            try
            {
                var cleanQuery = System.Text.RegularExpressions.Regex.Replace(query, @"\s*\(.*?\)\s*", " ").Trim();
                cleanQuery = cleanQuery.Replace("Dorfstrasse/", "").Replace("Strasse", "").Trim();

                var wikiDomain = langCode == "de" || langCode == "it" ? $"{langCode}.wikipedia.org" : "de.wikipedia.org";
                var searchUrl = $"https://{wikiDomain}/w/api.php?action=query&generator=search&gsrsearch={Uri.EscapeDataString(cleanQuery + " " + cityName)}&gsrlimit=3&prop=pageimages&pithumbsize=800&format=json";

                using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(2000));
                var resp = await _httpClient.GetAsync(searchUrl, cts.Token);
                if (resp.IsSuccessStatusCode)
                {
                    var json = await resp.Content.ReadAsStringAsync(cts.Token);
                    using var doc = JsonDocument.Parse(json);
                    if (doc.RootElement.TryGetProperty("query", out var qElem) &&
                        qElem.TryGetProperty("pages", out var pagesElem))
                    {
                        foreach (var page in pagesElem.EnumerateObject())
                        {
                            if (page.Value.TryGetProperty("thumbnail", out var thumbElem) &&
                                thumbElem.TryGetProperty("source", out var srcElem))
                            {
                                var foundUrl = srcElem.GetString();
                                if (!string.IsNullOrWhiteSpace(foundUrl))
                                {
                                    return foundUrl;
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "Could not fetch web image for {Query}", query);
            }

            // Authentic destination photos
            if (cityName.Equals("Olten", StringComparison.OrdinalIgnoreCase))
            {
                return "https://commons.wikimedia.org/wiki/Special:FilePath/Old_town_panorama_with_covered_bridge_and_Stadtturm%2C_Olten%2C_Solothurn.jpg?width=800";
            }
            if (cityName.Equals("Camerino", StringComparison.OrdinalIgnoreCase))
            {
                return "https://commons.wikimedia.org/wiki/Special:FilePath/Palazzo_Ducale_Camerino.jpg?width=800";
            }

            return "https://commons.wikimedia.org/wiki/Special:FilePath/Alte%20Br%C3%BCcke%20in%20Olten-20140514.jpg?width=800";
        }

        // =====================
        // WIKIPEDIA GEOSEARCH
        // =====================
        private async Task<List<EppoiUnifiedCardDTO>> FetchFromWikipediaAsync(CityLocationInfo cityInfo, string category, string langCode)
        {
            var list = new List<EppoiUnifiedCardDTO>();
            try
            {
                var wikiDomain = $"{langCode}.wikipedia.org";
                var geoSearchUrl = $"https://{wikiDomain}/w/api.php?action=query&list=geosearch&gscoord={cityInfo.Latitude}|{cityInfo.Longitude}&gsradius=10000&gslimit=15&format=json";

                var geoResp = await _httpClient.GetAsync(geoSearchUrl);
                if (!geoResp.IsSuccessStatusCode) return list;

                var geoContent = await geoResp.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(geoContent);
                if (!doc.RootElement.TryGetProperty("query", out var queryElem) ||
                    !queryElem.TryGetProperty("geosearch", out var gsElem))
                {
                    return list;
                }

                var pageIds = new List<long>();
                var coordsMap = new Dictionary<long, (double lat, double lon)>();

                foreach (var place in gsElem.EnumerateArray())
                {
                    if (place.TryGetProperty("pageid", out var pid))
                    {
                        var id = pid.GetInt64();
                        pageIds.Add(id);
                        double plat = place.TryGetProperty("lat", out var lt) ? lt.GetDouble() : cityInfo.Latitude;
                        double plon = place.TryGetProperty("lon", out var ln) ? ln.GetDouble() : cityInfo.Longitude;
                        coordsMap[id] = (plat, plon);
                    }
                }

                if (!pageIds.Any()) return list;

                var idsParam = string.Join("|", pageIds.Take(12));
                var detailUrl = $"https://{wikiDomain}/w/api.php?action=query&pageids={idsParam}&prop=pageimages|extracts|info&inprop=url&pithumbsize=800&exintro=1&explaintext=1&format=json";

                var detailResp = await _httpClient.GetAsync(detailUrl);
                if (!detailResp.IsSuccessStatusCode) return list;

                var detailContent = await detailResp.Content.ReadAsStringAsync();
                using var detailDoc = JsonDocument.Parse(detailContent);
                if (detailDoc.RootElement.TryGetProperty("query", out var dqElem) &&
                    dqElem.TryGetProperty("pages", out var pagesElem))
                {
                    var isIt = cityInfo.Country == "IT";
                    var badgePrefix = isIt ? "Italia Cultura" : "Svizzera Turismo";
                    var countryName = isIt ? "Italia" : "Svizzera";

                    foreach (var prop in pagesElem.EnumerateObject())
                    {
                        var page = prop.Value;
                        var title = page.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                        var extract = page.TryGetProperty("extract", out var ext) ? ext.GetString() ?? "" : "";
                        var pageId = page.TryGetProperty("pageid", out var pid) ? pid.GetInt64() : 0;

                        string? image = null;
                        if (page.TryGetProperty("thumbnail", out var thumb) &&
                            thumb.TryGetProperty("source", out var src))
                        {
                            image = src.GetString();
                        }

                        if (string.IsNullOrWhiteSpace(image) && page.TryGetProperty("pageimage", out var piProp))
                        {
                            var piStr = piProp.GetString();
                            if (!string.IsNullOrWhiteSpace(piStr))
                            {
                                image = $"https://commons.wikimedia.org/wiki/Special:FilePath/{Uri.EscapeDataString(piStr)}?width=800";
                            }
                        }

                        var coords = coordsMap.TryGetValue(pageId, out var c) ? c : (cityInfo.Latitude, cityInfo.Longitude);

                        list.Add(new EppoiUnifiedCardDTO
                        {
                            EntityId = $"wiki-{pageId}",
                            EntityName = title,
                            BadgeText = $"{badgePrefix} - {cityInfo.ProvinceOrCanton}",
                            Address = $"{cityInfo.Name} ({cityInfo.ProvinceOrCanton}), {countryName}",
                            ImagePath = image,
                            Description = extract.Length > 300 ? extract.Substring(0, 300) + "..." : extract,
                            Latitude = coords.Item1,
                            Longitude = coords.Item2,
                            Language = langCode,
                            Municipality = cityInfo.Name
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Wikipedia geosearch failed for {City}", cityInfo.Name);
            }

            return list;
        }

        // =====================
        // AUTHENTIC CURATED SWISS SIGHTS PER CATEGORY (ESN Olten Partner)
        // =====================
        private List<EppoiUnifiedCardDTO> GetCuratedSwissCards(string cleanCity, CityLocationInfo city, string category, string langCode)
        {
            var isIt = langCode == "it";
            var isDe = langCode == "de";

            var list = new List<EppoiUnifiedCardDTO>();

            // Olten specific highlights (ESN Olten partner)
            if (cleanCity.Equals("Olten", StringComparison.OrdinalIgnoreCase))
            {
                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = "curated-olten-holzbruecke",
                    EntityName = isIt ? "Alte Holzbrücke (Ponte Storico in Legno)" : "Alte Holzbrücke Olten",
                    BadgeText = isIt ? "Simbolo Storico di Olten (ESN)" : "Wahrzeichen von Olten",
                    Address = "Brückengasse, 4600 Olten (SO), Svizzera",
                    ImagePath = "https://commons.wikimedia.org/wiki/Special:FilePath/Alte%20Br%C3%BCcke%20in%20Olten-20140514.jpg?width=800",
                    Description = isIt ? "Lo storico ponte in legno coperto sull'Aare, risalente al 1803, punto d'incontro simbolo degli studenti internazionali e di ESN Olten." : "Historic covered wooden bridge over the Aare river, iconic meeting place of international students and ESN Olten.",
                    Latitude = 47.3512,
                    Longitude = 7.9048,
                    Language = langCode,
                    Municipality = "Olten"
                });

                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = "curated-olten-esn-hub",
                    EntityName = isIt ? "ESN Olten Student & Cultural Hub" : "ESN Olten Student Centre",
                    BadgeText = "ESN Olten Partner Community",
                    Address = "Riggenbachstrasse 16, 4600 Olten (FHNW Campus)",
                    ImagePath = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Il cuore pulsante dell'Erasmus Student Network Olten: eventi interculturali, visite guidate del cantone Soletta e scambi linguistici per studenti universitari." : "Hub of Erasmus Student Network Olten: cultural tours, campus events, and intercultural exchanges.",
                    Latitude = 47.3489,
                    Longitude = 7.9021,
                    Language = langCode,
                    Municipality = "Olten"
                });
            }

            if (category.Contains("eat") || category.Contains("drink"))
            {
                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = $"curated-grotto-{cleanCity.ToLowerInvariant()}",
                    EntityName = isIt ? $"Grotto & Tradizione {cleanCity}" : (isDe ? $"Traditionelles Stübli {cleanCity}" : $"Traditional Swiss Dining {cleanCity}"),
                    BadgeText = isIt ? "Cucina Tipica Svizzera" : (isDe ? "Schweizer Spezialitäten" : "Traditional Swiss Cuisine"),
                    Address = $"Marktgasse, {cleanCity} ({city.ProvinceOrCanton}), Svizzera",
                    ImagePath = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Autentica esperienza enogastronomica svizzera: polenta nostrana, rösti dorato, formaggi d'alpeggio e vini del territorio elvetico." : "Authentic Swiss culinary experience: golden rösti, alpine cheeses and regional wines.",
                    Latitude = city.Latitude + 0.002,
                    Longitude = city.Longitude + 0.003,
                    Language = langCode,
                    Municipality = cleanCity
                });
                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = $"curated-fondue-{cleanCity.ToLowerInvariant()}",
                    EntityName = isIt ? "Chalet del Formaggio & Fondue" : (isDe ? "Chalet Fondue Stübli" : "Swiss Fondue & Raclette Chalet"),
                    BadgeText = isIt ? "Fondue & Raclette AOP" : "Swiss Cheese Specialties",
                    Address = $"Bahnhofstrasse, {cleanCity} ({city.ProvinceOrCanton}), Svizzera",
                    ImagePath = "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "La vera fondue moitié-moitié con formaggi Gruyère AOP e Vacherin Fribourgeois, accompagnata da patate novelle e vino Fendant." : "Traditional Swiss cheese fondue moitié-moitié with Gruyère AOP and regional specialties.",
                    Latitude = city.Latitude - 0.002,
                    Longitude = city.Longitude - 0.001,
                    Language = langCode,
                    Municipality = cleanCity
                });
            }
            else if (category.Contains("nature"))
            {
                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = $"curated-nature-{cleanCity.ToLowerInvariant()}",
                    EntityName = isIt ? $"Belvedere Panoramico & Sentieri di {cleanCity}" : $"Panoramic Summit & Trail of {cleanCity}",
                    BadgeText = isIt ? "Natura & Panorama Alpino" : "Alpine Nature & View",
                    Address = $"{cleanCity} ({city.ProvinceOrCanton}), Svizzera",
                    ImagePath = "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Spettacolare punto panoramico con vista sui rilievi svizzeri, sentieri botanici e aria pura d'alta quota." : "Spectacular panoramic viewpoint with views over the Swiss landscape and nature trails.",
                    Latitude = city.Latitude + 0.008,
                    Longitude = city.Longitude + 0.006,
                    Language = langCode,
                    Municipality = cleanCity
                });
            }
            else if (category.Contains("typical") || category.Contains("product"))
            {
                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = $"curated-chocolate-{cleanCity.ToLowerInvariant()}",
                    EntityName = isIt ? "Boutique del Cioccolato Svizzero Artigianale" : "Artisanal Swiss Chocolate Atelier",
                    BadgeText = isIt ? "Cioccolato Svizzero d'Eccellenza" : "Swiss Grand Cru Chocolate",
                    Address = $"Hauptgasse, {cleanCity} ({city.ProvinceOrCanton}), Svizzera",
                    ImagePath = "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Degustazione di praline artigianali, tavolette monorigine e cioccolato svizzero finissimo lavorato secondo la grande tradizione elvetica." : "Tasting of artisanal pralines, single-origin bars, and world-renowned Swiss chocolate.",
                    Latitude = city.Latitude + 0.001,
                    Longitude = city.Longitude + 0.001,
                    Language = langCode,
                    Municipality = cleanCity
                });
            }
            else if (category.Contains("route"))
            {
                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = $"curated-route-{cleanCity.ToLowerInvariant()}",
                    EntityName = isIt ? $"Sentiero Panoramico di {cleanCity}" : $"Scenic Trail of {cleanCity}",
                    BadgeText = isIt ? "Escursionismo & Sentieri Svizzeri" : "Swiss Hiking Trail",
                    Address = $"{cleanCity} ({city.ProvinceOrCanton}), Percorso Segnalato",
                    ImagePath = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Itinerario pedonale perfettamente segnalato con cartelli gialli ufficiali di Sentieri Svizzeri, immerso nella natura panoramica." : "Official Swiss hiking path marked with iconic yellow signs, offering scenic mountain views.",
                    Latitude = city.Latitude + 0.004,
                    Longitude = city.Longitude - 0.003,
                    Language = langCode,
                    Municipality = cleanCity
                });
            }

            return list;
        }

        // =====================
        // AUTHENTIC CURATED ITALIAN SIGHTS PER CATEGORY (ESN Camerino & Marche Partner)
        // =====================
        private List<EppoiUnifiedCardDTO> GetCuratedItalianCards(string cleanCity, CityLocationInfo city, string category, string langCode)
        {
            var isIt = langCode == "it";
            var list = new List<EppoiUnifiedCardDTO>();

            // Camerino specific highlights (ESN Camerino partner)
            if (cleanCity.Equals("Camerino", StringComparison.OrdinalIgnoreCase))
            {
                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = "curated-camerino-rocca-borgesca",
                    EntityName = isIt ? "Rocca Borgesca di Camerino" : "Borgia Fortress of Camerino",
                    BadgeText = "Monumento Storico Rinascimentale",
                    Address = "Piazzale della Rocca, 62032 Camerino (MC), Italia",
                    ImagePath = "https://commons.wikimedia.org/wiki/Special:FilePath/Camerino_veduta_04.jpg?width=800",
                    Description = isIt ? "Imponente fortezza rinascimentale del 1503 voluta da Cesare Borgia. Offre uno dei più straordinari belvederi panoramici sui monti Sibillini e giardini pubblici storici." : "Imposing 1503 Renaissance fortress built by Cesare Borgia with sweeping panoramic views of the Sibillini Mountains.",
                    Latitude = 43.1345,
                    Longitude = 13.0645,
                    Language = langCode,
                    Municipality = "Camerino"
                });

                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = "curated-camerino-palazzo-ducale",
                    EntityName = isIt ? "Palazzo Ducale dei Da Varano & Polo Museale" : "Ducal Palace of the Da Varano",
                    BadgeText = "Patrimonio Storico & Culturale",
                    Address = "Piazza Cavour, 62032 Camerino (MC), Italia",
                    ImagePath = "https://images.unsplash.com/photo-1548625361-19597282b0f4?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Sede della celebre signoria dei Da Varano e dell'Università di Camerino (UNICAM), fondata nel 1336. Magnifico cortile rinascimentale quadriporticato." : "Historic seat of the Da Varano dukes and University of Camerino (founded 1336) with Renaissance cloister.",
                    Latitude = 43.1358,
                    Longitude = 13.0679,
                    Language = langCode,
                    Municipality = "Camerino"
                });

                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = "curated-camerino-orto-botanico",
                    EntityName = isIt ? "Orto Botanico Carmela Cortini (UNICAM)" : "UNICAM Botanical Gardens",
                    BadgeText = "Natura & Scienza Universitaria",
                    Address = "Viale Pieragostini 1, 62032 Camerino (MC), Italia",
                    ImagePath = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Fondato nel 1828 presso le antiche mura ducali, conserva oltre 1000 specie botaniche dell'Appennino centrale e serre secolari gestite dall'Università di Camerino." : "Historic botanical garden founded in 1828 by the University of Camerino, featuring rare Apennine flora.",
                    Latitude = 43.1372,
                    Longitude = 13.0695,
                    Language = langCode,
                    Municipality = "Camerino"
                });

                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = "curated-camerino-esn-hub",
                    EntityName = isIt ? "ESN Camerino Student Community Hub" : "ESN Camerino Student Hub",
                    BadgeText = "ESN Camerino Partner Community",
                    Address = "Campus Universitario UNICAM, 62032 Camerino (MC), Italia",
                    ImagePath = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Punto di riferimento per gli studenti Erasmus e internazionali di Camerino: escursioni sui Sibillini, feste culturali e supporto all'integrazione accademica." : "Student community hub by Erasmus Student Network Camerino: cultural excursions, events, and student support.",
                    Latitude = 43.1360,
                    Longitude = 13.0670,
                    Language = langCode,
                    Municipality = "Camerino"
                });
            }

            // Massignano specific highlights (original Eppoi Marche partner)
            if (cleanCity.Equals("Massignano", StringComparison.OrdinalIgnoreCase))
            {
                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = "curated-massignano-fischietti",
                    EntityName = isIt ? "Museo dei Fischietti di Terracotta" : "Terracotta Whistle Museum",
                    BadgeText = "Tradizione Artigianale Marchigiana",
                    Address = "Piazza Garibaldi, 63061 Massignano (AP), Italia",
                    ImagePath = "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Celebre museo unico in Italia dedicato all'antica arte dei 'fischiettai' di terracotta di Massignano, con collezioni storiche e botteghe tradizionali." : "Unique Italian museum celebrating the historic terracotta whistling artisans of Massignano.",
                    Latitude = 43.0520,
                    Longitude = 13.7975,
                    Language = langCode,
                    Municipality = "Massignano"
                });
            }

            // General Italian / Marche categories
            if (category.Contains("eat") || category.Contains("drink"))
            {
                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = $"curated-osteria-{cleanCity.ToLowerInvariant()}",
                    EntityName = isIt ? $"Osteria Tipica Marchigiana {cleanCity}" : $"Traditional Marche Osteria {cleanCity}",
                    BadgeText = isIt ? "Cucina Tipica Marchigiana" : "Marche Regional Food",
                    Address = $"Centro Storico, {cleanCity} ({city.ProvinceOrCanton}), Italia",
                    ImagePath = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "I sapori autentici delle Marche: vincisgrassi tradizionali al forno, ciauscolo IGP spalmabile, tagliatelle al tartufo e vino Vernaccia di Serrapetrona DOCG." : "Authentic Marche gastronomy: homemade vincisgrassi lasagna, ciauscolo salami, and local DOCG wines.",
                    Latitude = city.Latitude + 0.001,
                    Longitude = city.Longitude + 0.002,
                    Language = langCode,
                    Municipality = cleanCity
                });
            }
            else if (category.Contains("typical") || category.Contains("product"))
            {
                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = $"curated-ciauscolo-{cleanCity.ToLowerInvariant()}",
                    EntityName = isIt ? "Bottega delle Eccellenze Marchigiane & Ciauscolo IGP" : "Marche Artisanal Food Atelier",
                    BadgeText = isIt ? "Eccellenze Gastronomiche IGP" : "Artisanal Marche Specialties",
                    Address = $"Corso Vittorio Emanuele, {cleanCity} ({city.ProvinceOrCanton}), Italia",
                    ImagePath = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Selezione delle migliori specialità marchigiane: ciauscolo IGP, formaggio di fossa dei Sibillini, olive all'ascolana e miele millefiori dei monti appenninici." : "Tasting of top Marche specialties: ciauscolo IGP salami, pit cheese, and Apennine honeys.",
                    Latitude = city.Latitude - 0.001,
                    Longitude = city.Longitude - 0.001,
                    Language = langCode,
                    Municipality = cleanCity
                });
            }
            else if (category.Contains("nature"))
            {
                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = $"curated-nature-it-{cleanCity.ToLowerInvariant()}",
                    EntityName = isIt ? $"Sentieri dei Monti Sibillini & Colline di {cleanCity}" : $"Sibillini Nature Trail near {cleanCity}",
                    BadgeText = isIt ? "Natura & Parchi Marchigiani" : "Nature & Hills of Marche",
                    Address = $"{cleanCity} ({city.ProvinceOrCanton}), Italia",
                    ImagePath = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Incantevoli percorsi naturalistici tra colline ondulate e vette appenniniche con vista verso il mare Adriatico e i monti azzurri." : "Scenic nature trails through Marche rolling hills and panoramic Apennine views.",
                    Latitude = city.Latitude + 0.005,
                    Longitude = city.Longitude + 0.005,
                    Language = langCode,
                    Municipality = cleanCity
                });
            }

            return list;
        }

        // =====================
        // SAVE CARDS TO LOCAL SQLITE DB
        // =====================
        private async Task SaveCardsToDbAsync(List<EppoiUnifiedCardDTO> cards, string cleanCity, string category, string langCode)
        {
            try
            {
                int savedCount = 0;
                foreach (var c in cards)
                {
                    var entityId = c.EntityId ?? Guid.NewGuid().ToString();

                    bool exists = await _db.CardItemDetails.AnyAsync(x =>
                        x.EntityId == entityId &&
                        x.Language == langCode &&
                        x.Municipality == cleanCity);

                    if (!exists)
                    {
                        var detail = new CardItemDetail
                        {
                            EntityId = entityId,
                            Category = category,
                            Language = langCode,
                            Municipality = cleanCity,
                            Title = c.EntityName ?? "Attrazione Svizzera",
                            Description = c.Description ?? c.BadgeText,
                            Address = c.Address ?? $"{cleanCity}, Svizzera",
                            PrimaryImage = c.ImagePath ?? "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800",
                            Latitude = c.Latitude,
                            Longitude = c.Longitude,
                            JsonPayload = JsonSerializer.Serialize(c),
                            CreatedAt = DateTime.UtcNow
                        };

                        _db.CardItemDetails.Add(detail);
                        savedCount++;
                    }
                }

                if (savedCount > 0)
                {
                    await _db.SaveChangesAsync();
                    _logger.LogInformation($"Saved {savedCount} Swiss POI details into SQLite for {cleanCity}/{category}.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error caching cards to DB for {City}/{Category}", cleanCity, category);
            }
        }

        // =====================
        // BATCH CARDS (AppStartupService)
        // =====================
        public async Task<IEnumerable<EppoiUnifiedCardDTO>> GetCardsAsync(string[] municipalities, string[] languages, string[] endpoints)
        {
            var all = new List<EppoiUnifiedCardDTO>();

            foreach (var m in municipalities)
            {
                foreach (var lang in languages)
                {
                    foreach (var ep in endpoints)
                    {
                        try
                        {
                            var cards = await GetCategoryCardsAsync(ep, m, lang);
                            all.AddRange(cards);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Batch fetch failed for {M}/{Ep}/{Lang}", m, ep, lang);
                        }
                    }
                }
            }

            return all;
        }

        // =====================
        // MAP MARKERS FOR MUNICIPALITY
        // =====================
        public async Task<object?> GetMapAsync(string municipality)
        {
            var cleanCity = CleanMunicipality(municipality);
            var cityInfo = ResolveCity(cleanCity);

            try
            {
                var cards = await _db.CardItemDetails
                    .Where(c => c.Municipality == cleanCity)
                    .ToListAsync();

                if (!cards.Any())
                {
                    // Fetch categories on the fly
                    await GetCategoryCardsAsync("artculture", cleanCity, "it");
                    cards = await _db.CardItemDetails.Where(c => c.Municipality == cleanCity).ToListAsync();
                }

                var markers = cards
                    .Where(c => c.Latitude.HasValue && c.Longitude.HasValue)
                    .Select(c => new
                    {
                        id = c.EntityId,
                        title = c.Title,
                        type = c.Category,
                        latitude = c.Latitude,
                        longitude = c.Longitude,
                        location = c.Address,
                        description = c.Description,
                        image = c.PrimaryImage,
                        openingHours = "Tutti i giorni 09:00 - 18:00"
                    })
                    .ToList();

                return new
                {
                    centerLatitude = cityInfo.Latitude,
                    centerLongitude = cityInfo.Longitude,
                    zoom = 13,
                    municipality = cityInfo.Name,
                    canton = cityInfo.ProvinceOrCanton,
                    markers
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting map for {City}", cleanCity);
                return new
                {
                    centerLatitude = cityInfo.Latitude,
                    centerLongitude = cityInfo.Longitude,
                    zoom = 13,
                    markers = Array.Empty<object>()
                };
            }
        }

        // =====================
        // DETAILS
        // =====================
        public async Task<object?> GetCardDetailAsync(string id, string language)
        {
            var cleanId = id?.Trim() ?? "";
            var langCode = language?.ToLowerInvariant() switch
            {
                var s when s != null && s.StartsWith("de") => "de",
                var s when s != null && s.StartsWith("en") => "en",
                var s when s != null && s.StartsWith("fr") => "fr",
                _ => "it"
            };

            var dbDetail = await _db.CardItemDetails
                .FirstOrDefaultAsync(x => x.EntityId == cleanId && x.Language == langCode)
                ?? await _db.CardItemDetails.FirstOrDefaultAsync(x => x.EntityId == cleanId);

            if (dbDetail != null)
            {
                return new EppoiCardItemDetailDTO
                {
                    EntityId = dbDetail.EntityId,
                    EntityName = dbDetail.Title,
                    Title = dbDetail.Title,
                    Description = dbDetail.Description,
                    ShortDescription = dbDetail.Description,
                    Address = dbDetail.Address,
                    ImagePath = dbDetail.PrimaryImage,
                    PrimaryImage = dbDetail.PrimaryImage,
                    Latitude = dbDetail.Latitude,
                    Longitude = dbDetail.Longitude,
                    OpeningHours = "09:00 - 18:00",
                    Prices = "Ingresso gratuito o tariffa standard musei"
                };
            }

            return null;
        }

        public async Task<object> GetEatAndDrinkDetailAsync(string id, string language)
        {
            var detail = await GetCardDetailAsync(id, language);
            return detail ?? new { message = "POI not found", id };
        }

        public Task<object> GetPointsOfInterestAsync(string city)
        {
            var info = ResolveCity(city);
            return Task.FromResult<object>(new { municipality = info.Name, canton = info.ProvinceOrCanton, latitude = info.Latitude, longitude = info.Longitude });
        }

        public Task<object> SearchExperiencesAsync(SwaggerEppoiRequest request)
        {
            return Task.FromResult<object>(new { message = "Swiss search experiences", request });
        }
    }
}
