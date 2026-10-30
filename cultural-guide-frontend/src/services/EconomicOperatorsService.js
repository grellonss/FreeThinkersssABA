// services/EconomicOperatorsService.js
import defaultImage from "../images/ImageWithFallback.jpg";

/**
 * Recupera la lista degli operatori economici filtrata per comune e lingua.
 * @param {string} municipality - Il nome del comune (es. "Massignano")
 * @param {string} language - Codice lingua (default "it")
 */
export const fetchEconomicOperators = async (municipality, language = "it") => {
    if (!municipality) {
        throw new Error("Municipality is required");
    }

    try {
        // Seguendo il pattern delle altre API SPM (Art & Culture, Articles)
        const url = `https://apispm.eppoi.io/api/economic-operators/card-list?municipality=${encodeURIComponent(municipality)}&language=${encodeURIComponent(language)}`;

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

        // Trasformazione dati per il carosello
        return data.map((item) => ({
            id: item.entityId || item.id,
            type: item.badgeText || "Operatore Economico",
            // Gestione URL immagine con fallback
            image: item.imagePath
                ? (item.imagePath.startsWith('http') ? item.imagePath : `https://eppoi.io${item.imagePath}`)
                : defaultImage,
            title: item.entityName || item.title,
            // Usiamo badgeText per la descrizione come negli altri caroselli
            description: item.badgeText || "",
            location: item.address || "Indirizzo non disponibile",
            openingHours: "N/A",
        }));

    } catch (err) {
        console.error("Errore fetchEconomicOperators:", err);
        throw new Error("Network error while fetching economic operators");
    }
};