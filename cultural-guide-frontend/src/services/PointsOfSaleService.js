// services/PointsOfSaleService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchPointsOfSale = async (municipality, language = "it") => {
    return fetchCategoryCards("points-of-sale", municipality, language, "Punti Vendita ed Eccellenze");
};