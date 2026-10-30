import i18n from "i18next";
import { initReactI18next } from 'react-i18next';


import en from './locales/en.json';
import de from './locales/de.json';
import it from './locales/it.json';


i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {translation: en},
            de: {translation: de},
            it: {translation: it},
        },
        lng: "en",
        fallbackLng: "it",

        //ns means namespace. It is used to group translations into different files.
        // can have multiple namespaces, in case you want to divide a huge
        // translation into smaller pieces and load them on demand
        interpolation: {
            escapeValue: false,
            formatSeparator: ",",
        }
    });
export default i18n;
