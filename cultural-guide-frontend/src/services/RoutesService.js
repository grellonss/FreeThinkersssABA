// services/RoutesService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchRoutes = async (municipality, language = "it") => {
    return fetchCategoryCards("routes", municipality, language, "Itinerari e Sentieri Svizzeri");
};
