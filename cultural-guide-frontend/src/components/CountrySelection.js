import React from "react";
import { CulturalGuideLogo } from "./CulturalGuideLogo";
import { MapPin, Sparkles, GraduationCap, ArrowRight, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CountrySelection({ onSelectCountry }) {
    const { t } = useTranslation();

    return (
        <div className="min-h-[calc(100vh-68px)] py-3 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
            <div className="max-w-5xl xl:max-w-6xl w-full">

                {/* Hero section */}
                <div className="text-center mb-3 sm:mb-4 flex flex-col items-center">
                    {/* Logo */}
                    <div className="inline-flex justify-center mb-1">
                        <CulturalGuideLogo size="md" showText={true} showSubtitle={false} />
                    </div>

                    {/* Official Initiative Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-gradient-to-r from-red-50 via-white to-emerald-50 dark:from-red-950/40 dark:via-gray-900 dark:to-emerald-950/40 border border-gray-200 dark:border-gray-800 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-xs mb-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{t('country_official_subtitle', 'Iniziativa ufficiale in collaborazione con ESN Olten e ESN Camerino')}</span>
                    </div>

                    {/* Welcome Title */}
                    <h1 className="mt-3 sm:mt-3.5 text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                        {t('country_welcome_title', 'Benvenuto in Cultural Guide')}
                    </h1>

                    <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-normal">
                        {t('country_welcome_desc', 'Un ponte culturale e accademico tra ESN Olten (Svizzera) ed ESN Camerino (Italia). Scegli il territorio che desideri scoprire:')}
                    </p>
                </div>

                {/* Dual Country Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full items-stretch">

                    {/* SWITZERLAND CARD */}
                    <div
                        onClick={() => onSelectCountry("CH", "Olten")}
                        className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border-2 border-gray-200/80 dark:border-gray-800 hover:border-red-700 dark:hover:border-red-600 bg-white dark:bg-gray-900 shadow-md flex flex-col justify-between"
                    >
                        <div>
                            {/* Banner Immagine Allungato (h-52 sm:h-56 md:h-64) */}
                            <div className="relative h-52 sm:h-56 md:h-64 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img
                                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Alte%20Br%C3%BCcke%20in%20Olten-20140514.jpg?width=900"
                                    alt="Alte Holzbrücke ad Olten, Svizzera"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="eager"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                                {/* Badge */}
                                <div className="absolute top-2.5 left-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-800 text-white text-[10px] font-bold shadow-md">
                                    <span>🇨🇭</span>
                                    <span>ESN Olten Partner</span>
                                </div>

                                <div className="absolute bottom-2.5 left-3.5 right-3.5">
                                    <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 leading-tight">
                                        <span>{t('country_switzerland', 'Svizzera')}</span>
                                        <span className="text-red-300 text-[11px] font-semibold tracking-normal">{t('country_switzerland_tag', 'Elvezia')}</span>
                                    </h3>
                                    <p className="text-white/80 text-[10px] sm:text-[11px] font-medium leading-tight mt-0.5">
                                        {t('country_switzerland_hub', 'Hub Centrale: Olten (Canton Soletta) & Grandi Città')}
                                    </p>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-3.5 sm:p-4 bg-white dark:bg-gray-900">
                                <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-2.5 line-clamp-2">
                                    {t('country_switzerland_desc', 'Esplora il cuore della Svizzera tra lo storico ponte in legno coperto di Olten (Alte Holzbrücke), i percorsi lungo il fiume Aare, le vette alpine e le eccellenze elvetiche.')}
                                </p>

                                {/* Highlights */}
                                <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-red-800 dark:text-red-400 flex-shrink-0" />
                                        <span className="truncate"><strong>Destinazioni:</strong> Olten, Lugano, Zurigo, Berna, Lucerna</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-3.5 h-3.5 text-red-800 dark:text-red-400 flex-shrink-0" />
                                        <span className="truncate"><strong>Community:</strong> Studenti universitari FHNW & eventi ESN Olten</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-red-800 dark:text-red-400 flex-shrink-0" />
                                        <span className="truncate"><strong>Beni:</strong> KGS Kulturgüter, fondue & sentieri alpini</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="p-3.5 sm:p-4 pt-0 bg-white dark:bg-gray-900">
                            <button
                                type="button"
                                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-900 hover:to-rose-950 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md transition-all"
                            >
                                <span>{t('country_switzerland_btn', 'Esplora la Svizzera')}</span>
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>

                    {/* ITALY CARD */}
                    <div
                        onClick={() => onSelectCountry("IT", "Camerino")}
                        className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border-2 border-gray-200/80 dark:border-gray-800 hover:border-emerald-600 dark:hover:border-emerald-500 bg-white dark:bg-gray-900 shadow-md flex flex-col justify-between"
                    >
                        <div>
                            {/* Banner Immagine Allungato (h-52 sm:h-56 md:h-64) */}
                            <div className="relative h-52 sm:h-56 md:h-64 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img
                                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Camerino_veduta_04.jpg?width=900"
                                    alt="Panorama ducale di Camerino, Marche, Italia"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="eager"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                                {/* Badge */}
                                <div className="absolute top-2.5 left-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold shadow-md">
                                    <span>🇮🇹</span>
                                    <span>ESN Camerino Partner</span>
                                </div>

                                <div className="absolute bottom-2.5 left-3.5 right-3.5">
                                    <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 leading-tight">
                                        <span>{t('country_italy', 'Italia')}</span>
                                        <span className="text-emerald-300 text-[11px] font-semibold tracking-normal">{t('country_italy_tag', 'Marche & Territorio')}</span>
                                    </h3>
                                    <p className="text-white/80 text-[10px] sm:text-[11px] font-medium leading-tight mt-0.5">
                                        {t('country_italy_hub', 'Hub Centrale: Camerino (Città Ducale UNICAM) & Borghi')}
                                    </p>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-3.5 sm:p-4 bg-white dark:bg-gray-900">
                                <p className="text-gray-600 dark:text-gray-300 text-xs leading-snug mb-2.5 line-clamp-2">
                                    {t('country_italy_desc', 'Scopri il fascino senza tempo dell\'Italia centrale tra le mura rinascimentali della Rocca Borgesca di Camerino, l\'Università UNICAM (1336), l\'Appennino e la cucina marchigiana.')}
                                </p>

                                {/* Highlights */}
                                <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
                                        <span className="truncate"><strong>Destinazioni:</strong> Camerino, Urbino, Ascoli Piceno, Macerata, Jesi</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
                                        <span className="truncate"><strong>Community:</strong> UNICAM & Erasmus Student Network Camerino</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
                                        <span className="truncate"><strong>Beni:</strong> Rocca Borgesca, Monti Sibillini, borghi e cucina</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="p-3.5 sm:p-4 pt-0 bg-white dark:bg-gray-900">
                            <button
                                type="button"
                                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-green-800 hover:from-emerald-800 hover:to-green-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md transition-all"
                            >
                                <span>{t('country_italy_btn', 'Esplora l\'Italia')}</span>
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default CountrySelection;