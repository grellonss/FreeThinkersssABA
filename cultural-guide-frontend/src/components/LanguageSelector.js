import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const languages = [
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export function LanguageSelector({ currentLanguage, onLanguageChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLang =
        languages.find((l) => l.code === currentLanguage) || languages[0];

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-xl hover:shadow-2xl transition-shadow"
            >
                <span className="text-2xl">{currentLang.flag}</span>
                <span className="hidden sm:inline text-gray-700">{currentLang.label}</span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 py-2 bg-white rounded-lg shadow-xl min-w-[200px] z-50">
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            onClick={() => {
                                onLanguageChange(language.code);
                                localStorage.setItem("lang", language.code);
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full shadow-xl bg-white flex items-center justify-center text-2xl">
                                {language.flag}
                            </div>
                            <span className="text-gray-700">{language.label}</span>
                            {currentLanguage === language.code && (
                                <span className="ml-auto text-indigo-600">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
