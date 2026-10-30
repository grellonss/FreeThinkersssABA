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
                <div className="flex items-center">
                    <button
                        onClick={onLogoClick}
                        className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        {t("header_title")}
                    </button>
                </div>

                {/* CENTER COLUMN (EMPTY OR YOU CAN ADD CONTENT) */}
                <div className="text-center font-medium text-gray-500">
                    {t("header_welcome")}
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
