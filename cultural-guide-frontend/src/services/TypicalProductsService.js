// services/TypicalProductsService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchTypicalProducts = async (municipality, language = "it") => {
    return fetchCategoryCards("typical-products", municipality, language, "Prodotti Tipici ed Eccellenze");
};