import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const languages = [
    { code: "it", label: "Italiano", flag: "🇮🇹" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "en", label: "English", flag: "🇬🇧" },
];

export function LanguageSelector({ currentLanguage, onLanguageChange }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const normalizedLang = (currentLanguage || "").toLowerCase();
    const currentLang =
        languages.find((l) => l.code === normalizedLang || normalizedLang.startsWith(l.code)) ||
        languages[0];

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (code) => {
        if (onLanguageChange) {
            onLanguageChange(code);
        }
        localStorage.setItem("lang", code);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs transition-all duration-150 text-xs font-semibold text-gray-700 dark:text-gray-200"
            >
                <span className="text-base leading-none">{currentLang.flag}</span>
                <span className="hidden sm:inline font-medium">{currentLang.label}</span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 py-1.5 bg-white dark:bg-gray-850 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl min-w-[170px] z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 mb-1">
                        {t('select_language', 'Seleziona Lingua')}
                    </div>
                    {languages.map((language) => {
                        const isSelected =
                            currentLang.code === language.code ||
                            normalizedLang.startsWith(language.code);
                        return (
                            <button
                                key={language.code}
                                type="button"
                                onClick={() => handleSelect(language.code)}
                                className={`w-full px-3 py-2 flex items-center justify-between text-left text-xs font-medium transition-colors ${
                                    isSelected
                                        ? "bg-gray-100 dark:bg-gray-700/80 text-gray-900 dark:text-white font-semibold"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="text-base leading-none">{language.flag}</span>
                                    <span>{language.label}</span>
                                </div>
                                {isSelected && (
                                    <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
