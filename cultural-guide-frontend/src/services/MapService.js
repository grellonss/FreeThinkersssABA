import { getAuthenticFallbackImage } from "./imageResolver";
import { API_BASE_URL, cleanMunicipalityName } from "./apiUtils";

/**
 * Recupera i marker della mappa per il comune svizzero o italiano selezionato.
 * @param {string} municipality - Il nome della destinazione (es. "Olten" o "Camerino")
 */
export const fetchMap = async (municipality) => {
    if (!municipality) {
        return {
            locations: [],
            center: { latitude: 46.8182, longitude: 8.2275 }
        };
    }

    const cleanCity = cleanMunicipalityName(municipality);
    const country = localStorage.getItem("cultural_guide_country") || "CH";

    try {
        const url = `${API_BASE_URL}/map?municipality=${encodeURIComponent(cleanCity)}&country=${encodeURIComponent(country)}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.warn(`HTTP ${response.status} fetching map data for ${cleanCity}`);
            return {
                locations: [],
                center: { latitude: country === "IT" ? 43.1352 : 47.3524, longitude: country === "IT" ? 13.0673 : 7.9077 }
            };
        }

        const data = await response.json().catch(() => ({ markers: [] }));
        const markers = Array.isArray(data.markers) ? data.markers : [];

        const transformedMarkers = markers.map((item, idx) => {
            let img = item.imagePath || item.image || item.primaryImage;
            if (img && img.startsWith('/')) {
                img = `http://localhost:5203${img}`;
            }

            const title = item.entityName || item.title || item.name || (country === "IT" ? "Attrazione Marche" : "Attrazione Svizzera");
            const authenticImg = (!img || img.includes("photo-1568084680786-a84f91d1153c"))
                ? getAuthenticFallbackImage(title, cleanCity, country, idx)
                : img;

            return {
                id: item.entityId || item.id || `loc-${Math.random().toString(36).substring(2, 9)}`,
                latitude: item.latitude != null ? item.latitude : (country === "IT" ? 43.1352 : 47.3524),
                longitude: item.longitude != null ? item.longitude : (country === "IT" ? 13.0673 : 7.9077),
                type: item.badgeText || item.type || "Punto di Interesse",
                title: title,
                image: authenticImg,
                description: item.description || item.badgeText || "Destinazione culturale",
                location: item.address || item.location || `${cleanCity}, ${country === "IT" ? "Italia" : "Svizzera"}`,
                openingHours: item.openingHours || "09:00 - 18:00"
            };
        });

        return {
            locations: transformedMarkers,
            center: {
                latitude: data.centerLatitude || (transformedMarkers[0]?.latitude || 46.8182),
                longitude: data.centerLongitude || (transformedMarkers[0]?.longitude || 8.2275)
            }
        };

    } catch (err) {
        console.warn("Network error while fetching Swiss map data:", err);
        return {
            locations: [],
            center: { latitude: 46.8182, longitude: 8.2275 }
        };
    }
};