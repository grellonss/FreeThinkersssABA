using System;
using System.Collections.Generic;
using System.Linq;

namespace CulturalGuideBACKEND.Services
{
    public static class CategoryMapper
    {
        private static readonly Dictionary<string, string> _map = new(StringComparer.OrdinalIgnoreCase)
        {
            { "artculture", "art-culture" },
            { "articles", "articles" },
            { "eatanddrink", "eat-and-drink" },
            { "entertainment", "entertainment-leisure" },
            { "events", "events" },
            { "nature", "nature" },
            { "organizations", "organizations" },
            { "routes", "routes" },
            { "services", "services" },
            { "shopping", "shopping" },
            { "sleep", "sleep" },
            { "typicalproducts", "typical-products" }
        };

        public static string Map(string category)
        {
            if (string.IsNullOrWhiteSpace(category)) return category;
            var key = category.Trim();
            return _map.TryGetValue(key, out var mapped) ? mapped : key.Replace("-", "");
        }

        public static IEnumerable<string> MapMany(IEnumerable<string> categories) =>
            categories?.Select(Map) ?? Enumerable.Empty<string>();
    }
}
