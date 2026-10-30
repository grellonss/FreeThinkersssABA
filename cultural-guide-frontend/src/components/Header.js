import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "react-i18next";

export function Header({ navigateToStart, navigateToLogin }) {
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang);
    };

    const onLogoClick = () => {
        if (hasValidJWT()) {
            navigateToStart();
        } else {
            navigateToLogin();
        }
    };

    // Helper to check JWT
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

    return (
        <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
            <div className="max-w-6xl mx-auto grid grid-cols-3 items-center p-4">

                {/* LEFT COLUMN - LOGO */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onLogoClick}
                        className="text-xl font-extrabold text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
                    >
                        <span className="w-7 h-7 bg-red-600 text-white rounded-lg flex items-center justify-center text-sm shadow-sm font-black">
                            +
                        </span>
                        <span>{t("header_title")}</span>
                    </button>
                </div>

                {/* CENTER COLUMN */}
                <div className="text-center font-semibold text-gray-600 hidden sm:block">
                    <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        🇨🇭 Swiss Heritage & Tourism
                    </span>
                </div>


                {/* RIGHT COLUMN - LANGUAGE SELECTOR */}
                <div className="flex justify-end">
                    <LanguageSelector
                        currentLanguage={i18n.language}
                        onLanguageChange={handleLanguageChange}
                    />
                </div>

            </div>
        </header>
    );
}
