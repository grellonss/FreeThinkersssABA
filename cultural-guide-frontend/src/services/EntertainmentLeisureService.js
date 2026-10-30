// services/EntertainmentLeisureService.js
import defaultImage from "../images/ImageWithFallback.jpg";

/**
 * Fetch entertainment & leisure cards
 * @param {string} municipality
 * @param {string} language
 */
export const fetchEntertainmentLeisure = async (municipality, language = "it") => {
    if (!municipality) {
        throw new Error("Municipality is required");
    }

    try {
        const url = `https://apispm.eppoi.io/api/entertainment-leisure/card-list?municipality=${encodeURIComponent(
            municipality
        )}&language=${encodeURIComponent(language)}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        return data.map((item) => ({
            id: item.entityId,
            type: item.badgeText || "Entertainment & Leisure",
            title: item.entityName,
            image: item.imagePath
                ? item.imagePath.startsWith("http")
                    ? item.imagePath
                    : `https://eppoi.io${item.imagePath}`
                : defaultImage,
            location: item.address || "Indirizzo non disponibile",
        }));
    } catch (err) {
        console.error("Errore nel caricamento EntertainmentLeisure:", err);
        throw new Error("Impossibile caricare i dati Entertainment & Leisure");
    }
};
