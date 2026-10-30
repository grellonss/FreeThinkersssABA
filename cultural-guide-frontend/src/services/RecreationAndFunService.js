// services/RecreationAndFunService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchRecreationAndFun = async (municipality, language = "it") => {
    return fetchCategoryCards("entertainment-leisure", municipality, language, "Svago e Divertimento");
};