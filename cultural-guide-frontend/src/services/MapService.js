// services/MapService.js
import defaultImage from "../images/ImageWithFallback.jpg";
import { API_BASE_URL, cleanMunicipalityName } from "./apiUtils";

/**
 * Recupera i marker della mappa per il comune svizzero selezionato.
 * @param {string} municipality - Il nome della destinazione svizzera (es. "Lugano")
 */
export const fetchMap = async (municipality) => {
    if (!municipality) {
        return {
            locations: [],
            center: { latitude: 46.8182, longitude: 8.2275 }
        };
    }

    const cleanCity = cleanMunicipalityName(municipality);

    try {
        const url = `${API_BASE_URL}/map?municipality=${encodeURIComponent(cleanCity)}`;

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
                center: { latitude: 46.8182, longitude: 8.2275 }
            };
        }

        const data = await response.json().catch(() => ({ markers: [] }));
        const markers = Array.isArray(data.markers) ? data.markers : [];

        const transformedMarkers = markers.map((item) => {
            let img = item.imagePath || item.image || item.primaryImage;
            if (img && img.startsWith('/')) {
                img = `http://localhost:5203${img}`;
            }

            return {
                id: item.entityId || item.id || `loc-${Math.random().toString(36).substring(2, 9)}`,
                latitude: item.latitude != null ? item.latitude : 46.8182,
                longitude: item.longitude != null ? item.longitude : 8.2275,
                type: item.badgeText || item.type || "Punto di Interesse",
                title: item.entityName || item.title || item.name || "Attrazione Svizzera",
                image: img || defaultImage,
                description: item.description || item.badgeText || "Destinazione culturale in Svizzera",
                location: item.address || item.location || `${cleanCity}, Svizzera`,
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