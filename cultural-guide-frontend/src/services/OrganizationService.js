// services/OrganizationService.js
import defaultImage from "../images/ImageWithFallback.jpg";

/**
 * Fetch organizations for a municipality
 * @param {string} municipality
 */
export const fetchOrganizations = async (municipality) => {
    if (!municipality) {
        throw new Error("Municipality is required");
    }

    try {
        const url = `https://apispm.eppoi.io/api/organizations/municipalities?search=${encodeURIComponent(
            municipality
        )}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        return data.map((item, index) => ({
            id: `${item.legalName}-${index}`,
            title: item.legalName,
            image: item.imagePath
                ? item.imagePath.startsWith("http")
                    ? item.imagePath
                    : `https://eppoi.io${item.imagePath}`
                : defaultImage,
        }));
    } catch (err) {
        console.error("Errore nel caricamento Organizations:", err);
        throw new Error("Impossibile caricare le organizzazioni");
    }
};
