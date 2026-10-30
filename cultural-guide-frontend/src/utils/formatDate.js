import i18n from "i18next";

export const formatDate = (dateInput) => {
    if (!dateInput) return '';

    // Handle if dateInput is an object with { date, hour }
    let date;
    if (dateInput.date && dateInput.date instanceof Date) {
        date = dateInput.date;
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        console.error("Invalid date input:", dateInput);
        return '';
    }

    const localeMap = {
        de: 'de-DE',
        en: 'en-GB',
        it: 'it-IT',
    };

    const locale = localeMap[i18n.language] || 'en-GB';

    const dayName = date.toLocaleDateString(locale, { weekday: 'short' });
    const formattedDate = date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return `${dayName}, ${formattedDate}`;
};