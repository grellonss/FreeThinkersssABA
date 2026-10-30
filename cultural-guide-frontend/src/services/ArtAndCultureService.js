// services/ArtAndCultureService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchArtAndCulture = async (municipality, language = "it") => {
    return fetchCategoryCards("art-culture", municipality, language, "Arte e Cultura");
};