// services/ItinerariesService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchItineraries = async (municipality, language = "it") => {
    return fetchCategoryCards("routes", municipality, language, "Itinerari Panoramici");
};