// Accent del paese attivo: rosso per la Svizzera, verde per l'Italia.
const THEMES = {
    CH: {
        flag: "🇨🇭",
        label: "FHNW · Olten",
        text: "text-red-800 dark:text-red-400",
        solid: "bg-red-800 hover:bg-red-900 text-white",
        soft: "bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-200",
        border: "border-red-200 dark:border-red-900",
        hoverBorder: "hover:border-red-700 dark:hover:border-red-600",
        ring: "focus-visible:ring-red-700",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Alte%20Br%C3%BCcke%20in%20Olten-20140514.jpg?width=1200",
    },
    IT: {
        flag: "🇮🇹",
        label: "UNICAM · Camerino",
        text: "text-emerald-700 dark:text-emerald-400",
        solid: "bg-emerald-700 hover:bg-emerald-800 text-white",
        soft: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200",
        border: "border-emerald-200 dark:border-emerald-900",
        hoverBorder: "hover:border-emerald-600 dark:hover:border-emerald-500",
        ring: "focus-visible:ring-emerald-600",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Camerino_veduta_04.jpg?width=1200",
    },
};

export const countryTheme = (country) => THEMES[country] || THEMES.CH;
