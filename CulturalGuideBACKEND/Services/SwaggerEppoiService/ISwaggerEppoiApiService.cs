using System.Collections.Generic;
using System.Threading.Tasks;
using CulturalGuideBACKEND.DTO.SwaggerEppoiDTO;
using CulturalGuideBACKEND.Models;

namespace CulturalGuideBACKEND.Services.SwaggerEppoiService
{
    public interface ISwaggerEppoiApiService
    {
        Task<object> GetPointsOfInterestAsync(string city);
        Task<object> SearchExperiencesAsync(SwaggerEppoiRequest request);
        Task<object> GetEatAndDrinkDetailAsync(string id, string language);

        Task<IEnumerable<EppoiCategoriesDTO>> GetCategoriesAsync(string municipality, string language);
        Task<IEnumerable<EppoiMunicipalitiesDTO>> GetMunicipalitiesAsync();
        Task<IEnumerable<EppoiMunicipalitiesDTO>> SearchMunicipalitiesAsync(string query);
        Task<IEnumerable<EppoiEatAndDrinksDTO>> GetEatAndDrinksAsync(string municipality, string language);
        Task<IEnumerable<EppoiMunicipalitiesDTO>> GetMunicipalitiesIntoDbAsync();
        Task<IEnumerable<EppoiUnifiedCardDTO>> GetCardsAsync(string[] municipalities, string[] languages, string[] endpoints);
        Task<IEnumerable<EppoiUnifiedCardDTO>> GetCategoryCardsAsync(string category, string municipality, string language);
        Task<object?> GetCardDetailAsync(string id, string language);
        Task<object?> GetMapAsync(string municipality);
    }
}

