// services/EatAndDrinksService.js
import { fetchCategoryCards, API_BASE_URL } from "./apiUtils";

export const fetchEatAndDrinks = async (municipality, language = "it") => {
    return fetchCategoryCards("eat-and-drinks", municipality, language, "Enogastronomia Tipica");
};

export const fetchEatAndDrinkDetail = async (id, language = "it") => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/detail/${encodeURIComponent(id)}?language=${encodeURIComponent(language)}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Error fetching detail: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.warn("fetchEatAndDrinkDetail warning:", error);
        return null;
    }
};