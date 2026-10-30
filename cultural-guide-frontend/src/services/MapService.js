// services/MapService.js
import defaultImage from "../images/ImageWithFallback.jpg";

/**
 * Recupera la lista dei mappa filtrata per comune e lingua.
 * @param {string} municipality - Il nome del comune (es. "Massignano")
 */
export const fetchMap = async (municipality) => {
    if (!municipality) {
        throw new Error("Municipality is required");
    }

    try {
        const url = `http://localhost:5203/api/eppoiapi/map?municipality=${encodeURIComponent(municipality)}`;

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

        const data = await response.json().catch(() => ({ markers: [] }));
        
        // Check if data has markers array
        if (!data.markers || !Array.isArray(data.markers)) {
            console.log("No markers found in response");
            return [];
        }

        // Transform markers to the format expected by MapView
        const transformedMarkers = data.markers.map((item) => ({
            id: item.entityId || item.id || String(Math.random()),
            latitude: item.latitude || 0,
            longitude: item.longitude || 0,
            type: item.badgeText || item.typology || "Point of Interest",
            title: item.entityName || item.name || "Unnamed Location",
            image: item.imagePath
                ? (item.imagePath.startsWith('http')
                    ? item.imagePath
                    : `http://localhost:5203/api/eppoiapi/proxy-image?imageUrl=${encodeURIComponent(`https://eppoi.io${item.imagePath}`)}`)
                : defaultImage,
            description: item.description || item.badgeText || "No description available",
            location: item.address || "Address not available",
            openingHours: item.openingHours || "N/A"
        }));

        // Return the transformed data with center coordinates
        return {
            locations: transformedMarkers,
            center: {
                latitude: data.centerLatitude || (transformedMarkers[0]?.latitude || 52.52),
                longitude: data.centerLongitude || (transformedMarkers[0]?.longitude || 13.405)
            }
        };

    } catch (err) {
        throw new Error("Network error while fetching map data");
    }
};