// services/imageResolver.js
// Authentic cultural and destination image resolver for Switzerland & Italy

export const SWISS_AUTHENTIC_IMAGES = [
    "https://commons.wikimedia.org/wiki/Special:FilePath/Old_town_panorama_with_covered_bridge_and_Stadtturm%2C_Olten%2C_Solothurn.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Alte%20Br%C3%BCcke%20in%20Olten-20140514.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Olten%20-%20Rathaus%202.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Aarburg%20-%20Festung%2001.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Picswiss%20SO-18-02.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Lugano%20Riva%20Albertolli.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Gandria%20-%20Lago%20di%20Lugano.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Bern%20-%20Zytglogge%2001.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Grossm%C3%BCnster%20Z%C3%BCrich.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Kapellbr%C3%BCcke%20Luzern%202020.jpg?width=900"
];

export const ITALIAN_AUTHENTIC_IMAGES = [
    "https://commons.wikimedia.org/wiki/Special:FilePath/Camerino_veduta_04.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Palazzo_Ducale_Camerino.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Rocca_Borgesca_Camerino.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Palazzo_Ducale_Urbino.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Piazza_del_Popolo_Ascoli_Piceno.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Sferisterio_di_Macerata.jpg?width=900",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Jesi_mura_rinascimentali.jpg?width=900",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80"
];

/**
 * Returns an authentic cultural landmark photo resembling the place / territory.
 */
export function getAuthenticFallbackImage(title = "", city = "", country = "CH", index = 0) {
    const isIt = country === "IT" || city.toLowerCase().includes("camerino") || city.toLowerCase().includes("macerata") || city.toLowerCase().includes("ascoli");
    const pool = isIt ? ITALIAN_AUTHENTIC_IMAGES : SWISS_AUTHENTIC_IMAGES;

    if (index >= 0 && index < pool.length) {
        return pool[index % pool.length];
    }

    // Hash the title string to pick a consistent realistic photo
    let hash = 0;
    const key = (title + city);
    for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
    }
    const idx = Math.abs(hash) % pool.length;
    return pool[idx];
}

/**
 * Safe image onError handler: replaces a broken or missing image with an authentic landmark photo.
 */
export function handleImageFallback(event, title = "", city = "", country = "CH") {
    if (!event || !event.target) return;
    event.target.onerror = null; // Prevent infinite loop
    event.target.src = getAuthenticFallbackImage(title, city, country);
}

export default getAuthenticFallbackImage;
