// services/ArticlesAndMagazinesService.js
import defaultImage from "../images/ImageWithFallback.jpg";

/**
 * Recupera la lista di articoli e riviste filtrata per comune e lingua.
 * @param {string} municipality - Il nome del comune (es. "Massignano")
 * @param {string} language - Codice lingua (default "it")
 */
export const fetchArticlesAndMagazines = async (municipality, language = "it") => {
    if (!municipality) {
        throw new Error("Municipality is required");
    }

    try {
        // Costruiamo l'URL seguendo il pattern delle altre API SPM di Eppoi
        const url = `https://apispm.eppoi.io/api/articles-magazines/card-list?municipality=${encodeURIComponent(municipality)}&language=${encodeURIComponent(language)}`;

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

        // Trasformiamo i dati nel formato atteso dal carosello
        return data.map((item) => ({
            id: item.entityId || item.id,
            type: item.badgeText || "Articolo",
            // Se il path dell'immagine esiste, aggiungiamo il prefisso del dominio
            image: item.imagePath
                ? (item.imagePath.startsWith('http') ? item.imagePath : `https://eppoi.io${item.imagePath}`)
                : defaultImage,
            title: item.entityName || item.title,
            // Mapping della descrizione (usiamo badgeText come nel tuo esempio o una stringa vuota)
            description: item.badgeText || "",
            location: item.address || "Info non disponibile",
            openingHours: "N/A",
        }));

    } catch (err) {
        console.error("Errore fetchArticlesAndMagazines:", err);
        throw new Error("Network error while fetching articles and magazines");
    }
};