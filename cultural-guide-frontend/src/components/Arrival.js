import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ExternalLink, Info, MessageSquare, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { countryTheme } from "../theme";
import { getArrivalGuide, loadDone, saveDone } from "../data/arrival";
import { cleanMunicipalityName } from "../services/apiUtils";

const PHASES = ["before", "first", "later"];

export function Arrival({ city, activeCountry, onBack, onOpenTransport, onOpenChat }) {
    const { t, i18n } = useTranslation();
    const theme = countryTheme(activeCountry);
    const cityName = cleanMunicipalityName(city);
    const guide = getArrivalGuide(cityName, i18n.language);
    const [done, setDone] = useState(() => loadDone(cityName));

    const toggle = (id) => {
        const next = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
        setDone(next);
        saveDone(cityName, next);
    };

    const titleOf = (id) => guide.steps.find((s) => s.id === id)?.title || id;
    const verified = guide
        ? new Date(`${guide.verified}-01`).toLocaleDateString(i18n.language, { month: "long", year: "numeric" })
        : "";

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
                <ArrowLeft className="w-4 h-4" />
                {t("home_back")}
            </button>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("arrival_title", { city: cityName })}
            </h1>

            {!guide ? (
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">{t("arrival_none", { city: cityName })}</p>
            ) : (
                <>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {t("transport_verified", { date: verified })}
                        {!guide.validated && <> · {t("arrival_not_validated")}</>}
                    </p>
                    <p className="mt-4 text-base text-gray-600 dark:text-gray-300">{t("arrival_intro")}</p>

                    {guide.draft && (
                        <p className="mt-4 flex gap-3 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-200">
                            <TriangleAlert className="w-5 h-5 flex-shrink-0" />
                            {t("arrival_draft")}
                        </p>
                    )}

                    {PHASES.map((phase) => {
                        const steps = guide.steps.filter((s) => s.phase === phase);
                        if (!steps.length) return null;
                        return (
                            <section key={phase} className="mt-8">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    {t(`arrival_phase_${phase}`)}
                                </h2>
                                <ul className="mt-3 space-y-3">
                                    {steps.map((step) => {
                                        const isDone = done.includes(step.id);
                                        const missing = step.needs.filter((n) => !done.includes(n));
                                        return (
                                            <li
                                                key={step.id}
                                                className={`rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 ${isDone ? "opacity-70" : ""}`}
                                            >
                                                <label className="flex cursor-pointer items-start gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isDone}
                                                        onChange={() => toggle(step.id)}
                                                        className="peer sr-only"
                                                    />
                                                    <span
                                                        aria-hidden="true"
                                                        className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition peer-focus-visible:ring-2 ${theme.ring} ${
                                                            isDone ? `${theme.solid} border-transparent` : "border-gray-300 dark:border-gray-600"
                                                        }`}
                                                    >
                                                        {isDone && <Check className="h-4 w-4" />}
                                                    </span>
                                                    <span className="flex-1">
                                                        <span className={`block text-lg font-semibold text-gray-900 dark:text-white ${isDone ? "line-through" : ""}`}>
                                                            {step.title}
                                                        </span>
                                                        {!isDone && missing.length > 0 && (
                                                            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-900 dark:text-amber-200">
                                                                <Info className="h-3.5 w-3.5" />
                                                                {t("arrival_needs", { steps: missing.map(titleOf).join(", ") })}
                                                            </span>
                                                        )}
                                                    </span>
                                                </label>

                                                {!isDone && (
                                                    <div className="mt-3 pl-11">
                                                        <p className="text-base text-gray-600 dark:text-gray-300">{step.text}</p>

                                                        {step.bring && (
                                                            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                                                                <strong>{t("arrival_bring")}:</strong> {step.bring.join(" · ")}
                                                            </p>
                                                        )}

                                                        {(step.links.length > 0 || step.action) && (
                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                {step.action === "transport" && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={onOpenTransport}
                                                                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${theme.solid}`}
                                                                    >
                                                                        {t("home_transport_btn")}
                                                                        <ArrowRight className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                {step.links.map((link) => (
                                                                    <a
                                                                        key={link.url}
                                                                        href={link.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors ${theme.hoverBorder}`}
                                                                    >
                                                                        {link.label}
                                                                        <ExternalLink className="w-4 h-4" />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        );
                    })}

                    <section className={`mt-8 rounded-2xl border p-5 ${theme.soft} ${theme.border}`}>
                        <h2 className="text-sm font-semibold uppercase tracking-wide">{t("arrival_tips")}</h2>
                        <ul className="mt-3 space-y-2">
                            {guide.tips.map((tip) => (
                                <li key={tip} className="flex gap-2 text-base">
                                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">{t("arrival_saved_here")}</p>
                </>
            )}

            <button
                type="button"
                onClick={onOpenChat}
                className={`mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${theme.solid}`}
            >
                <MessageSquare className="w-4 h-4" />
                {t("transport_ask")}
            </button>
        </div>
    );
}
