// services/NatureService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchNature = async (municipality, language = "it") => {
    return fetchCategoryCards("nature", municipality, language, "Natura e Paesaggi Alpini");
};