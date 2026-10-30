import i18n from "i18next";
import { initReactI18next } from 'react-i18next';


import en from './locales/en.json';
import de from './locales/de.json';
import it from './locales/it.json';


const initialLang = (typeof window !== "undefined" && localStorage.getItem("lang")) || "it";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            de: { translation: de },
            it: { translation: it },
        },
        lng: initialLang,
        fallbackLng: "it",
        interpolation: {
            escapeValue: false,
            formatSeparator: ",",
        }
    });
export default i18n;
