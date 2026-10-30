import { getAuthenticFallbackImage } from "./imageResolver";

export const API_BASE_URL = "http://localhost:5203/api/eppoiapi";

export const cleanMunicipalityName = (municipality) => {
    if (!municipality) return "Olten";
    return municipality
        .replace(/^Com[m]?une\s+(di|de)\s+/i, "")
        .replace(/^Gemeinde\s+/i, "")
        .replace(/\s*\([A-Z]{2}\)$/, "")
        .trim() || municipality;
};

export const fetchCategoryCards = async (endpoint, municipality, language = "it", defaultType = "Punto di Interesse") => {
    if (!municipality) {
        return [];
    }

    const cleanCity = cleanMunicipalityName(municipality);
    const country = localStorage.getItem("cultural_guide_country") || "";

    try {
        const countryParam = country ? `&country=${encodeURIComponent(country)}` : "";
        const url = `${API_BASE_URL}/${endpoint}?municipality=${encodeURIComponent(cleanCity)}&language=${encodeURIComponent(language)}${countryParam}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.warn(`HTTP ${response.status} fetching ${endpoint} for ${cleanCity}`);
            return [];
        }

        const data = await response.json();
        const items = Array.isArray(data) ? data : (data?.items || []);

        return items.map((item, idx) => {
            let img = item.imagePath || item.image || item.primaryImage;
            if (img && img.startsWith('/')) {
                img = `http://localhost:5203${img}`;
            }

            const title = item.entityName || item.title || item.name || "Attrazione Culturale";
            const authenticImg = (!img || img.includes("photo-1568084680786-a84f91d1153c"))
                ? getAuthenticFallbackImage(title, cleanCity, country, idx)
                : img;

            return {
                id: item.entityId || item.id || `poi-${Math.random().toString(36).substring(2, 9)}`,
                type: item.badgeText || item.type || defaultType,
                image: authenticImg,
                title: title,
                description: item.description || item.badgeText || "",
                location: item.address || item.location || `${cleanCity}`,
                openingHours: item.openingHours || "Tutti i giorni 09:00 - 18:00",
                latitude: item.latitude ?? null,
                longitude: item.longitude ?? null,
            };
        });
    } catch (err) {
        console.warn(`Error fetching ${endpoint} for ${cleanCity}:`, err);
        return [];
    }
};
