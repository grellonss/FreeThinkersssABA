// services/ShoppingService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchShopping = async (municipality, language = "it") => {
    return fetchCategoryCards("shopping", municipality, language, "Shopping & Orologeria");
};
