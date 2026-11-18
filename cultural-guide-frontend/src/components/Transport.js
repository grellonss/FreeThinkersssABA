import React from "react";
import { ArrowLeft, Bus, Check, ExternalLink, Info, MessageSquare, Ticket, TrainFront, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { countryTheme } from "../theme";
import { getTransportGuide } from "../data/transport";
import { cleanMunicipalityName } from "../services/apiUtils";

const SECTION_ICONS = { pass: Ticket, arrive: TrainFront, around: Bus, help: Info };

export function Transport({ city, activeCountry, onBack, onOpenChat }) {
    const { t, i18n } = useTranslation();
    const theme = countryTheme(activeCountry);
    const cityName = cleanMunicipalityName(city);
    const guide = getTransportGuide(cityName, i18n.language);

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
                {t("home_back", "Torna alla home")}
            </button>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("transport_title", "Come muoversi a {{city}}", { city: cityName })}
            </h1>

            {!guide ? (
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                    {t("home_transport_none", "Per {{city}} non abbiamo ancora una guida ai trasporti. Per ora copriamo Camerino e Olten.", { city: cityName })}
                </p>
            ) : (
                <>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {t("transport_verified", "Ultima verifica: {{date}}", { date: verified })}
                        {!guide.validated && <> · {t("arrival_not_validated")}</>}
                    </p>

                    {guide.draft && (
                        <p className="mt-4 flex gap-3 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-200">
                            <TriangleAlert className="w-5 h-5 flex-shrink-0" />
                            {t("transport_draft", "Bozza: informazioni generali, non ancora basate su interviste a studenti.")}
                        </p>
                    )}

                    <section className={`mt-6 rounded-2xl border p-5 ${theme.soft} ${theme.border}`}>
                        <h2 className="text-sm font-semibold uppercase tracking-wide">{t("transport_in_short", "In breve")}</h2>
                        <ul className="mt-3 space-y-2">
                            {guide.facts.map((fact) => (
                                <li key={fact} className="flex gap-2 text-base">
                                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>{fact}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {guide.sections.map((section) => {
                        const Icon = SECTION_ICONS[section.id] || Info;
                        return (
                            <section key={section.id} className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6">
                                <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
                                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.soft}`}>
                                        <Icon className="w-5 h-5" />
                                    </span>
                                    {section.title}
                                </h2>

                                {section.intro && <p className="mt-3 text-base text-gray-600 dark:text-gray-300">{section.intro}</p>}

                                {section.steps && (
                                    <ol className="mt-4 space-y-3">
                                        {section.steps.map((step, i) => (
                                            <li key={step} className="flex gap-3 text-base text-gray-800 dark:text-gray-200">
                                                <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${theme.solid}`}>
                                                    {i + 1}
                                                </span>
                                                <span className="pt-0.5">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                )}

                                {section.items && (
                                    <dl className="mt-4 space-y-4">
                                        {section.items.map((item) => (
                                            <div key={item.title}>
                                                <dt className="font-semibold text-gray-900 dark:text-white">{item.title}</dt>
                                                <dd className="mt-0.5 text-base text-gray-600 dark:text-gray-300">{item.text}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                )}

                                {section.warning && (
                                    <p className="mt-4 flex gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-200">
                                        <TriangleAlert className="w-5 h-5 flex-shrink-0" />
                                        {section.warning}
                                    </p>
                                )}

                                {section.links && (
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {section.links.map((link) => (
                                            <a
                                                key={link.url + link.label}
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
                            </section>
                        );
                    })}
                </>
            )}

            <button
                type="button"
                onClick={onOpenChat}
                className={`mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${theme.solid}`}
            >
                <MessageSquare className="w-4 h-4" />
                {t("transport_ask", "Non trovi quello che cerchi? Chiedi all'assistente")}
            </button>
        </div>
    );
}
