// services/ItinerariesService.js
import defaultImage from "../images/ImageWithFallback.jpg";

/**
 * Recupera la lista degli itinerari filtrata per comune e lingua.
 * @param {string} municipality - Il nome del comune (es. "Massignano")
 * @param {string} language - Codice lingua (default "it")
 */
export const fetchItineraries = async (municipality, language = "it") => {
    if (!municipality) {
        throw new Error("Municipality is required");
    }

    try {
        // Pattern URL per l'API degli itinerari
        const url = `https://apispm.eppoi.io/api/itineraries/card-list?municipality=${encodeURIComponent(municipality)}&language=${encodeURIComponent(language)}`;

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
            type: item.badgeText || "Itinerario",
            // Gestione immagine con prefisso dominio e fallback
            image: item.imagePath
                ? (item.imagePath.startsWith('http') ? item.imagePath : `https://eppoi.io${item.imagePath}`)
                : defaultImage,
            title: item.entityName || item.title,
            // Descrizione breve presa dal badge
            description: item.badgeText || "",
            location: item.address || "Punto di partenza non specificato",
            // Per gli itinerari, potresti usare questo campo per la durata o difficoltà se disponibile
            openingHours: "Vedi percorso",
        }));

    } catch (err) {
        console.error("Errore fetchItineraries:", err);
        throw new Error("Network error while fetching itineraries");
    }
};