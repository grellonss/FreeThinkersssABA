import React from "react";
import {
    UserCheck,
    Sparkles,
    MessageSquare,
    MapPin,
    ArrowRight,
    Edit3,
    CheckCircle2
} from "lucide-react";
import { CulturalGuideLogo } from "./CulturalGuideLogo";
import { useTranslation } from "react-i18next";

const CATEGORY_NAMES = {
    artculture: "Arte & Cultura",
    nature: "Natura & Parchi",
    eatanddrink: "Enogastronomia",
    typicalproducts: "Prodotti Tipici",
    routes: "Itinerari & Escursioni",
    events: "Eventi & Folklore",
    sleep: "Ospitalità & Soggiorno",
    shopping: "Shopping Locale",
    entertainmentleisure: "Intrattenimento & Svago"
};

export function Dashboard({
    user,
    preferences,
    onNavigate,
    onSwitchCountry
}) {
    const { t } = useTranslation();

    const country = preferences?.country || localStorage.getItem("cultural_guide_country") || "CH";
    const isIt = country === "IT";
    const city = preferences?.municipality || localStorage.getItem("cultural_guide_city") || (isIt ? "Camerino" : "Olten");
    const firstName = preferences?.firstName || user?.name || "Viaggiatore";
    const lastName = preferences?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const categories = preferences?.selectedCategories || ["artculture", "nature", "eatanddrink"];

    // Format dates summary
    let datesSummary = "Date flessibili";
    if (preferences?.startTime && preferences?.endTime) {
        try {
            const s = new Date(preferences.startTime);
            const e = new Date(preferences.endTime);
            const options = { day: "numeric", month: "short" };
            const sStr = s.toLocaleDateString(undefined, options);
            const eStr = e.toLocaleDateString(undefined, options);
            const diffDays = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
            datesSummary = `${sStr} - ${eStr} (${diffDays} gg)`;
        } catch {
            datesSummary = "Date impostate";
        }
    }

    // Country Theme Tokens: Bordeaux Red for CH vs Emerald Green for IT
    const themeBgGradient = isIt
        ? "bg-gradient-to-r from-emerald-700 via-green-800 to-emerald-900"
        : "bg-gradient-to-r from-red-800 via-rose-900 to-red-950";
    const themeBgBtn = isIt
        ? "bg-gradient-to-r from-emerald-700 to-green-800 hover:from-emerald-800 hover:to-green-900"
        : "bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-900 hover:to-rose-950";
    const themeBadgeClass = isIt
        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80"
        : "bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/80";
    const themeHighlightText = isIt ? "text-emerald-700 dark:text-emerald-400" : "text-red-800 dark:text-red-400";
    const themeHoverBg = isIt ? "hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-800 dark:hover:text-emerald-300 group-hover:border-emerald-200" : "hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-800 dark:hover:text-red-300 group-hover:border-red-200";

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

            {/* HERO HEADER */}
            <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div>
                    {/* Active country pill */}
                    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-3 border shadow-xs ${themeBadgeClass}`}>
                        <span>{isIt ? "🇮🇹" : "🇨🇭"}</span>
                        <span>{isIt ? "Partner Ufficiale: ESN Camerino (Italia)" : "Partner Ufficiale: ESN Olten (Svizzera)"}</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        {t('dashboard_welcome', 'Bentornato,')} <span className={themeHighlightText}>{firstName}</span>!
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1.5 flex items-center justify-center sm:justify-start gap-2">
                        <span>{t('profile_destination', 'Destinazione')}:</span>
                        <strong className="text-gray-900 dark:text-white font-bold inline-flex items-center gap-1">
                            <MapPin className={`w-4 h-4 ${themeHighlightText}`} />
                            {city} ({isIt ? t('country_italy', 'Italia') : t('country_switzerland', 'Svizzera')})
                        </strong>
                    </p>
                </div>

                <div className="flex items-center justify-center sm:justify-end gap-3">
                    <CulturalGuideLogo size="md" showText={false} />
                    {onSwitchCountry && (
                        <button
                            type="button"
                            onClick={onSwitchCountry}
                            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all shadow-xs ${themeBadgeClass}`}
                        >
                            {t('header_change', 'Cambia')} Paese
                        </button>
                    )}
                </div>
            </div>

            {/* THE 3 WORKFLOW CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ===================================================== */}
                {/* CARD 1: PROFILO & PREFERENZE (COMPATTO & MODIFICABILE)*/}
                {/* ===================================================== */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col justify-between overflow-hidden group">
                    {/* Top color accent header (Country themed: Bordeaux for CH, Green for IT) */}
                    <div className={`${themeBgGradient} p-6 text-white`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                                Card 1
                            </span>
                        </div>
                        <h2 className="text-xl font-black">{t('dashboard_card1_title', 'Profilo & Preferenze')}</h2>
                        <p className="text-white/80 text-xs mt-0.5">
                            {t('dashboard_card1_desc', 'Gestisci i tuoi dati personali, il periodo di soggiorno e i tuoi interessi culturali.')}
                        </p>
                    </div>

                    {/* Card Body with Summary */}
                    <div className="p-6 space-y-4 flex-1">
                        {/* Profile Info */}
                        <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/80 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400">Utente:</span>
                                <strong className="text-gray-900 dark:text-white">{fullName}</strong>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400">{t('profile_destination', 'Destinazione')}:</span>
                                <span className="font-bold text-gray-900 dark:text-white inline-flex items-center gap-1">
                                    <span>{isIt ? "🇮🇹" : "🇨🇭"}</span>
                                    <span>{city}</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400">Periodo:</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{datesSummary}</span>
                            </div>
                        </div>

                        {/* Selected Categories Tags */}
                        <div>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                {t('profile_categories_title', 'Interessi Selezionati')}:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map((catId) => (
                                    <span
                                        key={catId}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border shadow-2xs ${themeBadgeClass}`}
                                    >
                                        <CheckCircle2 className={`w-3 h-3 ${themeHighlightText}`} />
                                        {CATEGORY_NAMES[catId] || catId}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Button */}
                    <div className="p-6 pt-0">
                        <button
                            type="button"
                            onClick={() => onNavigate("profile-preferences")}
                            className={`w-full py-3.5 px-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-sm flex items-center justify-center gap-2 transition-all border border-transparent shadow-xs ${themeHoverBg}`}
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>{t('dashboard_card1_btn', 'Modifica Preferenze')}</span>
                        </button>
                    </div>
                </div>

                {/* ===================================================== */}
                {/* CARD 2: RECOMMENDATION (ACCESSO IMMEDIATO AL CAROSELLO)*/}
                {/* ===================================================== */}
                <div className={`rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group transform hover:-translate-y-1 border-2 bg-white dark:bg-gray-900 ${
                    isIt ? "border-emerald-600 dark:border-emerald-600" : "border-red-700 dark:border-red-700"
                }`}>
                    {/* Top image banner - Real authentic landmark photo */}
                    <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                            src={
                                isIt
                                    ? "https://commons.wikimedia.org/wiki/Special:FilePath/Camerino_veduta_04.jpg?width=800"
                                    : "https://commons.wikimedia.org/wiki/Special:FilePath/Alte%20Br%C3%BCcke%20in%20Olten-20140514.jpg?width=800"
                            }
                            alt="Recommendation Preview"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                        {/* Top Badge */}
                        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-gray-900 text-xs font-black shadow-md">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>{t('dashboard_card2_tag', 'Accesso Diretto')}</span>
                        </div>

                        <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                                Card 2
                            </span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h2 className="text-xl font-black">{t('dashboard_card2_title', 'Recommendation')}</h2>
                            <p className="text-white/80 text-xs mt-0.5">
                                {t('carousel_recs_for', 'Raccomandazioni per')} {city}
                            </p>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-3.5 flex-1 bg-white dark:bg-gray-900">
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {t('dashboard_card2_desc', 'Accedi subito al carosello dei punti di interesse e alla mappa interattiva, già configurati con le tue preferenze.')}
                        </p>

                        <div className={`p-3 rounded-xl border text-xs space-y-1 ${themeBadgeClass}`}>
                            <div className="font-bold flex items-center gap-1.5">
                                <Sparkles className={`w-3.5 h-3.5 ${themeHighlightText}`} />
                                <span>Zero Attese, Preferenze Già Impostate!</span>
                            </div>
                            <p className="opacity-80">
                                I contenuti sono già filtrati per i tuoi interessi.
                            </p>
                        </div>
                    </div>

                    {/* Action Button: Enters carousel directly! */}
                    <div className="p-6 pt-0">
                        <button
                            type="button"
                            onClick={() => onNavigate("swipecarousel")}
                            className={`w-full py-4 px-5 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform group-hover:scale-[1.02] ${themeBgBtn}`}
                        >
                            <span>{t('dashboard_card2_btn', 'Accedi Subito al Carosello')}</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>

                {/* ===================================================== */}
                {/* CARD 3: CHATBOT AI                                   */}
                {/* ===================================================== */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col justify-between overflow-hidden group">
                    {/* Top color accent header (Country themed: Bordeaux for CH, Green for IT) */}
                    <div className={`${themeBgGradient} p-6 text-white`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                                Card 3
                            </span>
                        </div>
                        <h2 className="text-xl font-black">{t('dashboard_card3_title', 'Assistente Chatbot')}</h2>
                        <p className="text-white/80 text-xs mt-0.5">
                            {t('dashboard_card3_tag', 'AI Assistant')} • {city}
                        </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-3.5 flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {t('dashboard_card3_desc', 'Interagisci con l\'assistente virtuale intelligente per ricevere consigli in tempo reale su cosa fare e vedere a')} <strong className="text-gray-900 dark:text-white">{city}</strong>.
                        </p>

                        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Esempi di domande rapide:</p>
                            <div className="p-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg text-gray-600 dark:text-gray-300 italic border border-gray-100 dark:border-gray-700/80">
                                "{isIt ? "Quali monumenti storici visitare a Camerino?" : "Cosa vedere vicino all'Alte Holzbrücke di Olten?"}"
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg text-gray-600 dark:text-gray-300 italic border border-gray-100 dark:border-gray-700/80">
                                "{isIt ? "Dove posso assaggiare i piatti tipici marchigiani?" : "Quali sono le specialità tipiche e i grotti del cantone?"}"
                            </div>
                        </div>
                    </div>

                    {/* Action Button: Enters Chatbot */}
                    <div className="p-6 pt-0">
                        <button
                            type="button"
                            onClick={() => onNavigate("chatbot")}
                            className={`w-full py-3.5 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all group-hover:scale-[1.01] ${themeBgBtn}`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>{t('dashboard_card3_btn', 'Apri Assistente Chatbot')}</span>
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default Dashboard;
