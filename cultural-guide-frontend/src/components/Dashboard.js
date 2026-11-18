import React from "react";
import { ArrowRight, Bus, CalendarDays, Check, ClipboardList, Compass, MapPin, MessageSquare, Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { countryTheme } from "../theme";
import { getTransportGuide } from "../data/transport";
import { getArrivalGuide, loadDone } from "../data/arrival";
import { cleanMunicipalityName } from "../services/apiUtils";

export function Dashboard({ user, preferences, onNavigate, onSwitchCountry }) {
    const { t, i18n } = useTranslation();

    const country = preferences?.country || localStorage.getItem("cultural_guide_country") || "CH";
    const theme = countryTheme(country);
    const city = cleanMunicipalityName(
        preferences?.municipality || localStorage.getItem("cultural_guide_city") || (country === "IT" ? "Camerino" : "Olten")
    );
    const firstName = preferences?.firstName || user?.name || "";
    const categories = preferences?.selectedCategories || ["artculture", "nature", "eatanddrink"];
    const transport = getTransportGuide(city, i18n.language);
    const arrival = getArrivalGuide(city, i18n.language);
    const done = loadDone(city);
    const doneCount = arrival ? arrival.steps.filter((s) => done.includes(s.id)).length : 0;
    const nextStep = arrival?.steps.find((s) => !done.includes(s.id));

    let dates = t("home_flexible_dates");
    if (preferences?.startTime && preferences?.endTime) {
        const fmt = (d) => new Date(d).toLocaleDateString(i18n.language, { day: "numeric", month: "short" });
        dates = `${fmt(preferences.startTime)} – ${fmt(preferences.endTime)}`;
    }

    const card = `group flex flex-col rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-left shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 ${theme.hoverBorder} ${theme.ring}`;
    const cardCta = `mt-6 inline-flex items-center gap-2 self-start rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${theme.solid}`;
    const iconBox = `flex h-12 w-12 items-center justify-center rounded-2xl ${theme.soft}`;
    const none = (text) => <p className="mt-4 flex-1 text-sm text-gray-500 dark:text-gray-400">{text}</p>;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

            {/* HERO: dove sei e per quanto */}
            <header className="relative overflow-hidden rounded-3xl bg-gray-900">
                <img src={theme.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
                <div className="relative flex min-h-[15rem] flex-col justify-end p-6 sm:p-8 text-white">
                    <p className="text-sm font-medium text-white/85">{theme.flag} {theme.label}</p>
                    <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
                        {t("home_hello", { name: firstName, city })}
                    </h1>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{city}</span>
                        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{dates}</span>
                        <button type="button" onClick={() => onNavigate("profile-preferences")} className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:no-underline">
                            <Settings2 className="h-4 w-4" />{t("home_edit")}
                        </button>
                        {onSwitchCountry && (
                            <button type="button" onClick={onSwitchCountry} className="underline underline-offset-4 hover:no-underline">
                                {t("home_change_destination")}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* TRE LIVELLI (interview International Office): obblighi, vita pratica, tempo libero */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <button type="button" onClick={() => onNavigate("arrival")} className={card}>
                    <span className={iconBox}><ClipboardList className="h-6 w-6" /></span>
                    <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">{t("home_first_title")}</h2>
                    <p className="mt-1 text-base text-gray-600 dark:text-gray-300">{t("home_first_desc")}</p>
                    {arrival ? (
                        <div className="mt-4 flex-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("home_first_progress", { done: doneCount, total: arrival.steps.length })}
                            </p>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800" aria-hidden="true">
                                <div className={`h-full rounded-full ${theme.solid}`} style={{ width: `${(doneCount / arrival.steps.length) * 100}%` }} />
                            </div>
                            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                                {nextStep ? t("home_first_next", { step: nextStep.title }) : t("home_first_all_done")}
                            </p>
                        </div>
                    ) : none(t("arrival_none", { city }))}
                    <span className={cardCta}>
                        {t("home_first_btn")}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </button>

                <button type="button" onClick={() => onNavigate("transport")} className={card}>
                    <span className={iconBox}><Bus className="h-6 w-6" /></span>
                    <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">{t("home_transport_title")}</h2>
                    <p className="mt-1 text-base text-gray-600 dark:text-gray-300">{t("home_transport_desc")}</p>
                    {transport ? (
                        <ul className="mt-4 flex-1 space-y-2">
                            {transport.facts.map((fact) => (
                                <li key={fact} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${theme.text}`} />
                                    <span>{fact}</span>
                                </li>
                            ))}
                        </ul>
                    ) : none(t("home_transport_none", { city }))}
                    <span className={cardCta}>
                        {t("home_transport_btn")}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </button>

                <button type="button" onClick={() => onNavigate("swipecarousel")} className={card}>
                    <span className={iconBox}><Compass className="h-6 w-6" /></span>
                    <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">{t("home_todo_title")}</h2>
                    <p className="mt-1 text-base text-gray-600 dark:text-gray-300">{t("home_todo_desc")}</p>
                    <div className="mt-4 flex flex-1 flex-wrap content-start gap-2">
                        {categories.map((id) => (
                            <span key={id} className={`rounded-full px-3 py-1 text-sm font-medium ${theme.soft}`}>
                                {t(`cat_${id}`, id)}
                            </span>
                        ))}
                    </div>
                    <span className={cardCta}>
                        {t("home_todo_btn")}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </button>
            </div>

            {/* ASSISTENTE */}
            <button
                type="button"
                onClick={() => onNavigate("chatbot")}
                className={`group mt-6 flex w-full items-center gap-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 text-left shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 ${theme.hoverBorder} ${theme.ring}`}
            >
                <span className={iconBox}><MessageSquare className="h-6 w-6" /></span>
                <span className="flex-1">
                    <span className="block text-lg font-semibold text-gray-900 dark:text-white">{t("home_chat_title")}</span>
                    <span className="block text-base text-gray-600 dark:text-gray-300">{t("home_chat_desc")}</span>
                </span>
                <ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${theme.text}`} />
            </button>
        </div>
    );
}

export default Dashboard;
