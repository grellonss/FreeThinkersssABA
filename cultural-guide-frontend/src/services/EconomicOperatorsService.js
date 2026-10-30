// services/EconomicOperatorsService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchEconomicOperators = async (municipality, language = "it") => {
    return fetchCategoryCards("economic-operators", municipality, language, "Operatori e Partner Svizzeri");
};