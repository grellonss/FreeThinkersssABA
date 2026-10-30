// services/EatAndDrinksService.js
import defaultImage from "../images/ImageWithFallback.jpg";

const API_BASE_URL = "http://localhost:5203/api/eppoiapi";


export const fetchEatAndDrinks = async (municipality, language = "it") => {
    if (!municipality) {
        throw new Error("Municipality is required");
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/eat-and-drinks?municipality=${encodeURIComponent(municipality)}&language=${encodeURIComponent(language)}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        // let's read the body only once and overwrite data with mapping
        let data = await response.json().catch(() => []);

        // Transform backend data to the expected template
        data = data.map((eatAndDrinks) => ({
            id: eatAndDrinks.entityId,
            type: eatAndDrinks.badgeText,                       // Rename entityId with id
            image: eatAndDrinks.imagePath                       // rename badgeText with type
                ? `https://eppoi.io${eatAndDrinks.imagePath}`   // Create the complete URL of the image
                : defaultImage,                                 // If missing, uses the fallback image
            title: eatAndDrinks.entityName,                     // Rename entityName in title
            description: eatAndDrinks.badgeText || "",
            location: eatAndDrinks.address || "Unknown address",
            openingHours: "N/A",
        }));

        return data;
    } catch (err) {
        console.error(err);
        throw new Error("Network error while fetching eatAndDrinks");
    }
};

export const fetchEatAndDrinkDetail = async (id, language = "it") => {
    try{
        const response = await fetch(
            `${API_BASE_URL}/eat-and-drinks/detail/${encodeURIComponent(id)}?language=${encodeURIComponent(language)}`,
            {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Detail API non found for Id ${id} .`);
                return null;
            }
            throw new Error(`Error fetching detail: ${response.status}`);
        }

        return await response.json();
    }catch (error){
        console.error("fetchEatAndDrinkDetail error:", error);
        throw error;
    }
}