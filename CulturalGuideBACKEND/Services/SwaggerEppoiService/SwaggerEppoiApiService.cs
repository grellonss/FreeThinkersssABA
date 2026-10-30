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

        // Predefined Swiss Cities with accurate coordinates and high-res imagery
        private static readonly List<SwissCityInfo> SwissCities = new()
        {
            new("Lugano", "TI", 46.0037, 8.9511, "https://images.unsplash.com/photo-1573155993874-d5d48af862ba?w=800&auto=format&fit=crop&q=80"),
            new("Zürich", "ZH", 47.3769, 8.5417, "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&auto=format&fit=crop&q=80"),
            new("Bern", "BE", 46.9480, 7.4474, "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop&q=80"),
            new("Genève", "GE", 46.2044, 6.1432, "https://images.unsplash.com/photo-1573157268794-074f636dd81c?w=800&auto=format&fit=crop&q=80"),
            new("Luzern", "LU", 47.0502, 8.3093, "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&auto=format&fit=crop&q=80"),
            new("Basel", "BS", 47.5596, 7.5886, "https://images.unsplash.com/photo-1573152958734-522207829467?w=800&auto=format&fit=crop&q=80"),
            new("Bellinzona", "TI", 46.1928, 9.0227, "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&auto=format&fit=crop&q=80"),
            new("Locarno", "TI", 46.1685, 8.7984, "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80"),
            new("Lausanne", "VD", 46.5197, 6.6323, "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80"),
            new("Zermatt", "VS", 45.9765, 7.7491, "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=800&auto=format&fit=crop&q=80"),
            new("St. Moritz", "GR", 46.4908, 9.8355, "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&auto=format&fit=crop&q=80"),
            new("Interlaken", "BE", 46.6863, 7.8632, "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80"),
            new("Montreux", "VD", 46.4312, 6.9107, "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&auto=format&fit=crop&q=80"),
            new("St. Gallen", "SG", 47.4245, 9.3767, "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&auto=format&fit=crop&q=80"),
            new("Ascona", "TI", 46.1558, 8.7731, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80"),
            new("Mendrisio", "TI", 45.8703, 8.9863, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"),
            new("Neuchâtel", "NE", 46.9896, 6.9293, "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80"),
            new("Sion", "VS", 46.2331, 7.3606, "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80"),
            new("Chur", "GR", 46.8508, 9.5320, "https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800&auto=format&fit=crop&q=80"),
            new("Fribourg", "FR", 46.8065, 7.1620, "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80"),
            new("Schaffhausen", "SH", 47.6959, 8.6380, "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop&q=80"),
            new("Thun", "BE", 46.7580, 7.6280, "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80")
        };

        public SwaggerEppoiApiService(
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            ILogger<SwaggerEppoiApiService> logger,
            AppDbContext db)
        {
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "CulturalGuideSwitzerland/2.0 (SwissCulturalGuide; info@culturalguide.ch)");
            _config = config;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _db = db;
        }

        public record SwissCityInfo(string Name, string Canton, double Latitude, double Longitude, string Image);

        public static string CleanMunicipality(string? name)
        {
            if (string.IsNullOrWhiteSpace(name)) return "Lugano";
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

            // If it ends with cantonal code like " (TI)" or " (ZH)", extract the city name
            var parenIdx = clean.IndexOf('(');
            if (parenIdx > 0)
            {
                clean = clean.Substring(0, parenIdx).Trim();
            }

            return string.IsNullOrWhiteSpace(clean) ? "Lugano" : clean;
        }

        private SwissCityInfo ResolveCity(string? municipality)
        {
            var clean = CleanMunicipality(municipality);
            var match = SwissCities.FirstOrDefault(c => c.Name.Equals(clean, StringComparison.OrdinalIgnoreCase));
            if (match != null) return match;

            var partial = SwissCities.FirstOrDefault(c => c.Name.Contains(clean, StringComparison.OrdinalIgnoreCase) || clean.Contains(c.Name, StringComparison.OrdinalIgnoreCase));
            if (partial != null) return partial;

            // Default to Lugano (TI)
            return SwissCities[0];
        }

        // =====================
        // MUNICIPALITIES
        // =====================
        public async Task<IEnumerable<EppoiMunicipalitiesDTO>> GetMunicipalitiesIntoDbAsync()
        {
            int added = 0;
            foreach (var city in SwissCities)
            {
                string legalName = $"{city.Name} ({city.Canton})";
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
                _logger.LogInformation($"Seeded {added} Swiss municipalities into SQLite DB.");
            }

            return await GetMunicipalitiesAsync();
        }

        public async Task<IEnumerable<EppoiMunicipalitiesDTO>> GetMunicipalitiesAsync()
        {
            var dbList = await _db.Municipalities.ToListAsync();

            if (!dbList.Any())
            {
                await GetMunicipalitiesIntoDbAsync();
                dbList = await _db.Municipalities.ToListAsync();
            }

            return dbList.Select(m =>
            {
                var clean = CleanMunicipality(m.LegalName);
                var city = SwissCities.FirstOrDefault(c => c.Name.Equals(clean, StringComparison.OrdinalIgnoreCase));
                return new EppoiMunicipalitiesDTO
                {
                    LegalName = m.LegalName,
                    ImagePath = !string.IsNullOrEmpty(m.ImagePath) ? m.ImagePath : (city?.Image ?? "https://images.unsplash.com/photo-1573155993874-d5d48af862ba?w=800"),
                    Canton = city?.Canton,
                    Latitude = city?.Latitude,
                    Longitude = city?.Longitude
                };
            }).ToList();
        }

        public async Task<IEnumerable<EppoiMunicipalitiesDTO>> SearchMunicipalitiesAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return await GetMunicipalitiesAsync();
            }

            var cleanQuery = query.Trim();
            var matches = SwissCities
                .Where(c => c.Name.Contains(cleanQuery, StringComparison.OrdinalIgnoreCase) ||
                            c.Canton.Equals(cleanQuery, StringComparison.OrdinalIgnoreCase))
                .Select(c => new EppoiMunicipalitiesDTO
                {
                    LegalName = $"{c.Name} ({c.Canton})",
                    ImagePath = c.Image,
                    Canton = c.Canton,
                    Latitude = c.Latitude,
                    Longitude = c.Longitude
                })
                .ToList();

            // Try GeoAdmin Search API for any Swiss municipality
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
                                // Strip HTML tags like <b>Lugano (TI)</b>
                                label = Regex.Replace(label, "<.*?>", string.Empty).Trim();
                                var lat = attrs.TryGetProperty("lat", out var lt) ? lt.GetDouble() : 46.8;
                                var lon = attrs.TryGetProperty("lon", out var ln) ? ln.GetDouble() : 8.2;
                                var detail = attrs.TryGetProperty("detail", out var dt) ? dt.GetString() ?? "" : "";
                                var canton = detail.Split(' ').LastOrDefault()?.ToUpperInvariant() ?? "CH";

                                if (!matches.Any(m => m.LegalName.Equals(label, StringComparison.OrdinalIgnoreCase)))
                                {
                                    matches.Add(new EppoiMunicipalitiesDTO
                                    {
                                        LegalName = label,
                                        ImagePath = "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&auto=format&fit=crop&q=80",
                                        Canton = canton,
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

            return matches;
        }

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
                    ImagePath = "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=600&auto=format&fit=crop&q=80"
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
        public async Task<IEnumerable<EppoiUnifiedCardDTO>> GetCategoryCardsAsync(string category, string municipality, string language)
        {
            var cleanCity = CleanMunicipality(municipality);
            var cityInfo = ResolveCity(cleanCity);
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
                return cachedCards.Select(c => new EppoiUnifiedCardDTO
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
            }

            // 2. Fetch from Official Swiss Geodata (geo.admin.ch KGS Inventar)
            var geoCards = await FetchFromGeoAdminAsync(cleanCity, normalizedCategory, langCode);
            results.AddRange(geoCards);

            // 3. Fetch from Wikipedia Geosearch around city coordinates
            var wikiCards = await FetchFromWikipediaAsync(cityInfo, normalizedCategory, langCode);
            foreach (var w in wikiCards)
            {
                if (!results.Any(r => r.EntityName?.Equals(w.EntityName, StringComparison.OrdinalIgnoreCase) == true))
                {
                    results.AddRange(new[] { w });
                }
            }

            // 4. If fewer than 4 items or specific categories, enrich with Authentic Swiss Regional Sights
            var curatedCards = GetCuratedSwissCards(cleanCity, cityInfo, normalizedCategory, langCode);
            foreach (var c in curatedCards)
            {
                if (!results.Any(r => r.EntityName?.Equals(c.EntityName, StringComparison.OrdinalIgnoreCase) == true))
                {
                    results.Add(c);
                }
            }

            // 5. Cache newly fetched cards into DB for fast retrieval and Gemini chatbot context
            await SaveCardsToDbAsync(results, cleanCity, normalizedCategory, langCode);

            return results;
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
                            image = "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&auto=format&fit=crop&q=80";
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

        // =====================
        // WIKIPEDIA GEOSEARCH
        // =====================
        private async Task<List<EppoiUnifiedCardDTO>> FetchFromWikipediaAsync(SwissCityInfo cityInfo, string category, string langCode)
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

                        if (string.IsNullOrWhiteSpace(image))
                        {
                            image = "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&auto=format&fit=crop&q=80";
                        }

                        var coords = coordsMap.TryGetValue(pageId, out var c) ? c : (cityInfo.Latitude, cityInfo.Longitude);

                        list.Add(new EppoiUnifiedCardDTO
                        {
                            EntityId = $"wiki-{pageId}",
                            EntityName = title,
                            BadgeText = $"Svizzera Turismo - {cityInfo.Canton}",
                            Address = $"{cityInfo.Name} ({cityInfo.Canton}), Svizzera",
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
        // AUTHENTIC CURATED SWISS SIGHTS PER CATEGORY
        // =====================
        private List<EppoiUnifiedCardDTO> GetCuratedSwissCards(string cleanCity, SwissCityInfo city, string category, string langCode)
        {
            var isIt = langCode == "it";
            var isDe = langCode == "de";

            var list = new List<EppoiUnifiedCardDTO>();

            if (category.Contains("eat") || category.Contains("drink"))
            {
                list.Add(new EppoiUnifiedCardDTO
                {
                    EntityId = $"curated-grotto-{cleanCity.ToLowerInvariant()}",
                    EntityName = isIt ? $"Grotto Tipico {cleanCity}" : (isDe ? $"Traditionelles Tessiner Grotto {cleanCity}" : $"Traditional Swiss Grotto {cleanCity}"),
                    BadgeText = isIt ? "Grotto & Cucina Tipica" : (isDe ? "Tessiner Spezialitäten" : "Traditional Swiss Cuisine"),
                    Address = $"Via del Grotto 12, {cleanCity} ({city.Canton})",
                    ImagePath = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Autentica esperienza enogastronomica svizzera: polenta nostrana cotta al camino, risotto al Merlot, formaggi d'alpeggio e vini del territorio." : "Authentic Swiss culinary experience: local polenta, Merlot risotto, alpine cheeses and regional wines.",
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
                    Address = $"Piazza Grande 5, {cleanCity} ({city.Canton})",
                    ImagePath = "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "La vera fondue moitié-moitié con formaggi Gruyère AOP e Vacherin Fribourgeois, accompagnata da patate novelle e vino bianco Fendant." : "Traditional Swiss cheese fondue moitié-moitié with Gruyère AOP and regional specialties.",
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
                    EntityName = isIt ? $"Belvedere Panoramico & Vetta {cleanCity}" : $"Panoramic Summit & Nature Park {cleanCity}",
                    BadgeText = isIt ? "Natura & Panorama Alpino" : "Alpine Nature & View",
                    Address = $"{cleanCity} ({city.Canton}), Svizzera",
                    ImagePath = "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Spettacolare punto panoramico con vista a 360 gradi sulle Alpi svizzere, sentieri botanici e aria pura d'alta quota." : "Spectacular panoramic viewpoint with 360-degree views over the Swiss Alps and alpine flora.",
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
                    Address = $"Via Nassa / Marktgasse, {cleanCity} ({city.Canton})",
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
                    Address = $"{cleanCity} ({city.Canton}), Percorso Segnalato",
                    ImagePath = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
                    Description = isIt ? "Itinerario pedonale perfettamente segnalato con cartelli gialli ufficiali di Sentieri Svizzeri, immerso tra vigneti e boschi panoramici." : "Official Swiss hiking path marked with iconic yellow signs, offering scenic mountain views.",
                    Latitude = city.Latitude + 0.004,
                    Longitude = city.Longitude - 0.003,
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
                    canton = cityInfo.Canton,
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
                    Prices = "Ingresso gratuito o tariffa standard musei svizzeri"
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
            return Task.FromResult<object>(new { municipality = info.Name, canton = info.Canton, latitude = info.Latitude, longitude = info.Longitude });
        }

        public Task<object> SearchExperiencesAsync(SwaggerEppoiRequest request)
        {
            return Task.FromResult<object>(new { message = "Swiss search experiences", request });
        }
    }
}
