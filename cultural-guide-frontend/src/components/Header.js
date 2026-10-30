import React, { useState, useEffect } from "react";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "react-i18next";
import { CulturalGuideLogo } from "./CulturalGuideLogo";
import { Globe, LogOut, Sun, Moon } from "lucide-react";

export function Header({
    navigateToStart,
    navigateToLogin,
    activeCountry,
    selectedCity,
    onSwitchCountry,
    user,
    onLogout,
    currentLanguage: propCurrentLang,
    onLanguageChange: propOnLanguageChange,
    theme = "light",
    onToggleTheme,
}) {
    const { t, i18n } = useTranslation();
    const [localLang, setLocalLang] = useState(() => propCurrentLang || localStorage.getItem("lang") || i18n.language || "it");

    useEffect(() => {
        if (propCurrentLang && propCurrentLang !== localLang) {
            setLocalLang(propCurrentLang);
        }
    }, [propCurrentLang, localLang]);

    const activeLang = propCurrentLang || localLang;

    const handleLanguageChange = (lang) => {
        setLocalLang(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang);
        if (propOnLanguageChange) {
            propOnLanguageChange(lang);
        }
    };

    const hasValidJWT = () => {
        const token = localStorage.getItem("jwt");
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const expires = payload.exp * 1000;
            return Date.now() < expires;
        } catch {
            return false;
        }
    };

    const onLogoClick = () => {
        if (hasValidJWT() || user) {
            navigateToStart();
        } else {
            navigateToLogin();
        }
    };

    return (
        <header className="fixed top-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 z-50 transition-colors duration-200">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 relative">

                {/* LEFT - DUAL LOGO */}
                <div className="flex items-center gap-3">
                    <CulturalGuideLogo
                        size="sm"
                        showText={true}
                        showSubtitle={true}
                        onClick={onLogoClick}
                    />
                </div>

                {/* CENTER - CONDITIONAL:
                    - If a country is active (all other pages): Center the current nation button!
                    - If no country is active (Country Selection page): Center ESN Olten 🇨🇭 & ESN Camerino 🇮🇹 Hub badge */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                    {activeCountry ? (
                        <button
                            onClick={onSwitchCountry}
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs border ${
                                activeCountry === "IT"
                                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                    : "bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/80 hover:bg-red-100 dark:hover:bg-red-900/40"
                            }`}
                            title="Clicca per cambiare destinazione"
                        >
                            <span className="text-sm">{activeCountry === "IT" ? "🇮🇹" : "🇨🇭"}</span>
                            <span>{activeCountry === "IT" ? "Italia • ESN Camerino" : "Svizzera • ESN Olten"}</span>
                            {selectedCity && (
                                <>
                                    <span className="opacity-40">|</span>
                                    <span className="font-medium opacity-90">{selectedCity}</span>
                                </>
                            )}
                            <span className="ml-1 text-[10px] font-semibold underline opacity-75">
                                {t('header_change', 'Cambia')}
                            </span>
                        </button>
                    ) : (
                        <div className="hidden md:inline-flex items-center gap-2 px-3.5 py-1 bg-gray-50/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-xs">
                            <Globe className="w-3.5 h-3.5 text-red-600 dark:text-emerald-400" />
                            <span>{t('header_partner_hub', 'ESN Olten 🇨🇭 & ESN Camerino 🇮🇹 Hub')}</span>
                        </div>
                    )}
                </div>

                {/* RIGHT - THEME TOGGLE, LANGUAGE & LOGOUT */}
                <div className="flex items-center gap-2 sm:gap-2.5">

                    {/* 1. Dark/Light mode toggle */}
                    <button
                        type="button"
                        onClick={onToggleTheme}
                        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-xs"
                        title={theme === "dark" ? t('theme_light', 'Modalità chiara') : t('theme_dark', 'Modalità scura')}
                        aria-label={theme === "dark" ? t('theme_light', 'Modalità chiara') : t('theme_dark', 'Modalità scura')}
                    >
                        {theme === "dark" ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                            <Moon className="w-4 h-4 text-gray-600" />
                        )}
                    </button>

                    {/* 2. Language selector */}
                    <LanguageSelector
                        currentLanguage={activeLang}
                        onLanguageChange={handleLanguageChange}
                    />

                    {/* 3. Logout (at the far right of brightness and language) */}
                    {user && (
                        <button
                            onClick={onLogout}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all shadow-xs"
                            title={t('header_logout', 'Esci')}
                        >
                            <LogOut className="w-3.5 h-3.5 text-red-500" />
                            <span>{t('header_logout', 'Esci')}</span>
                        </button>
                    )}
                </div>

            </div>
        </header>
    );
}
