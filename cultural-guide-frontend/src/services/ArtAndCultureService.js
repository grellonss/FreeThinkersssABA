// services/ArtAndCultureService.js
import defaultImage from "../images/ImageWithFallback.jpg";

/**
 * Recupera la lista di card per Arte e Cultura filtrata per comune e lingua.
 * @param {string} municipality - Il nome del comune (es. "Massignano")
 * @param {string} language - Codice lingua (default "it")
 */
export const fetchArtAndCulture = async (municipality, language = "it") => {
    // 1. Controllo validità input
    if (!municipality) {
        throw new Error("Municipality is required");
    }

    try {
        // 2. Costruzione URL e chiamata API
        const url = `https://apispm.eppoi.io/api/art-culture/card-list?municipality=${encodeURIComponent(municipality)}&language=${encodeURIComponent(language)}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json"
            }
            // Nota: Se l'API esterna non richiede cookie di sessione,
            // puoi omettere credentials: "include" usato in locale.
        });

        // 3. Controllo risposta HTTP
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        // 4. Mapping/Trasformazione dei dati
        // Adattiamo i campi che arrivano dall'API al formato usato dal tuo Carousel/Frontend
        return data.map((item) => ({
            id: item.entityId || item.id,
            type: item.badgeText || "Arte e Cultura",
            // Costruzione URL immagine: controlliamo se il path è già completo o se va prefissato
            image: item.imagePath
                ? (item.imagePath.startsWith('http') ? item.imagePath : `https://eppoi.io${item.imagePath}`)
                : defaultImage,
            title: item.entityName || item.title,
            description: item.badgeText || "",
            location: item.address || "Indirizzo non disponibile",
            openingHours: "N/A", // Campo opzionale se non fornito dall'API
        }));

    } catch (err) {
        console.error("Errore nel caricamento ArtAndCulture:", err);
        throw new Error("Impossibile caricare i dati di Arte e Cultura");
    }
};