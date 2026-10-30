// services/ArticlesAndMagazinesService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchArticlesAndMagazines = async (municipality, language = "it") => {
    return fetchCategoryCards("articles-magazines", municipality, language, "Articoli e Approfondimenti");
};