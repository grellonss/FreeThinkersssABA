// services/EventsService.js
import defaultImage from "../images/ImageWithFallback.jpg";

/**
 * Recupera la lista degli eventi filtrata per comune e lingua.
 * @param {string} municipality - Il nome del comune (es. "Massignano")
 * @param {string} language - Codice lingua (default "it")
 */
export const fetchEvents = async (municipality, language = "it") => {
    if (!municipality) {
        throw new Error("Municipality is required");
    }

    try {
        // Seguendo il pattern delle API SPM di Eppoi per gli eventi
        const url = `https://apispm.eppoi.io/api/events/card-list?municipality=${encodeURIComponent(municipality)}&language=${encodeURIComponent(language)}`;

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
            type: item.badgeText || "Evento",
            // Gestione URL immagine: prefisso e fallback
            image: item.imagePath
                ? (item.imagePath.startsWith('http') ? item.imagePath : `https://eppoi.io${item.imagePath}`)
                : defaultImage,
            title: item.entityName || item.title,
            // Utilizziamo il badgeText per la descrizione breve
            description: item.badgeText || "",
            location: item.address || "Luogo non specificato",
            // Per gli eventi, openingHours potrebbe rappresentare la data/ora se disponibile
            openingHours: item.eventDate || "Vedi dettagli",
        }));

    } catch (err) {
        console.error("Errore fetchEvents:", err);
        throw new Error("Network error while fetching events");
    }
};