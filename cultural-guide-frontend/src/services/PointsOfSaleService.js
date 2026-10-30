// services/PointsOfSaleService.js
import defaultImage from "../images/ImageWithFallback.jpg";

/**
 * Recupera la lista dei punti vendita filtrata per comune e lingua.
 * @param {string} municipality - Il nome del comune (es. "Massignano")
 * @param {string} language - Codice lingua (default "it")
 */
export const fetchPointsOfSale = async (municipality, language = "it") => {
    if (!municipality) {
        throw new Error("Municipality is required");
    }

    try {
        // Pattern URL per l'API dei punti vendita
        const url = `https://apispm.eppoi.io/api/points-of-sale/card-list?municipality=${encodeURIComponent(municipality)}&language=${encodeURIComponent(language)}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json().catch(() => []);

        // Trasformazione dati per il formato del carosello
        return data.map((item) => ({
            id: item.entityId || item.id,
            type: item.badgeText || "Punto Vendita",
            // Gestione immagine con prefisso dominio e fallback
            image: item.imagePath
                ? (item.imagePath.startsWith('http') ? item.imagePath : `https://eppoi.io${item.imagePath}`)
                : defaultImage,
            title: item.entityName || item.title,
            // Descrizione breve presa dal badge
            description: item.badgeText || "",
            location: item.address || "Indirizzo non disponibile",
            openingHours: "N/A",
        }));

    } catch (err) {
        console.error("Errore fetchPointsOfSale:", err);
        throw new Error("Network error while fetching points of sale data");
    }
};