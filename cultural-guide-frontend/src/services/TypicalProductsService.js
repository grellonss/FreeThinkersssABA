// services/TypicalProductsService.js
import defaultImage from "../images/ImageWithFallback.jpg";

/**
 * Recupera la lista dei prodotti tipici filtrata per comune e lingua.
 * @param {string} municipality - Il nome del comune (es. "Massignano")
 * @param {string} language - Codice lingua (default "it")
 */
export const fetchTypicalProducts = async (municipality, language = "it") => {
    if (!municipality) {
        throw new Error("Municipality is required");
    }

    try {
        // Seguendo il pattern delle API SPM di Eppoi per i prodotti tipici.
        const url = `https://apispm.eppoi.io/api/typical-products/card-list?municipality=${encodeURIComponent(municipality)}&language=${encodeURIComponent(language)}`;

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
            type: item.badgeText || "Prodotto Tipico",
            // Gestione immagine con prefisso dominio e fallback
            image: item.imagePath
                ? (item.imagePath.startsWith('http') ? item.imagePath : `https://eppoi.io${item.imagePath}`)
                : defaultImage,
            title: item.entityName || item.title,
            // Descrizione breve presa dal badge
            description: item.badgeText || "",
            location: item.address || "Origine locale",
            openingHours: "N/A",
        }));

    } catch (err) {
        console.error("Errore fetchTypicalProducts:", err);
        throw new Error("Network error while fetching typical products data");
    }
};