import { useState, useEffect, Suspense } from "react";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { PasswordRecovery } from "./components/PasswordRecovery";
import { CountrySelection } from "./components/CountrySelection";
import { ProfilePreferences } from "./components/ProfilePreferences";
import { Dashboard } from "./components/Dashboard";
import { SwipeCarousel } from "./components/SwipeCarousel";
import { Chatbot } from "./components/Chatbot";
import { useTranslation } from "react-i18next";
import { Header } from "./components/Header";

export const AuthView = {
    LOGIN: "login",
    REGISTER: "register",
    RECOVERY: "recovery",
    COUNTRY_SELECT: "country_select",
    PROFILE_PREFERENCES: "profile_preferences",
    DASHBOARD: "dashboard",
    SWIPECAROUSEL: "swipecarousel",
    CHATBOT: "chatbot",
};

function App() {
    const [currentView, setCurrentView] = useState(AuthView.LOGIN);
    const [user, setUser] = useState(null);
    const [activeCountry, setActiveCountry] = useState(() => localStorage.getItem("cultural_guide_country") || "CH");
    const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem("cultural_guide_city") || "Olten");
    const [preferences, setPreferences] = useState(() => {
        try {
            const raw = localStorage.getItem("cultural_guide_preferences");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) return savedTheme;
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem("lang") || "it");
    const { i18n } = useTranslation();

    const handleLanguageChange = (lang) => {
        setCurrentLanguage(lang);
        i18n.changeLanguage(lang).catch(() => {});
        localStorage.setItem("lang", lang);
    };

    // Restore saved language from localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem("lang") || "it";
        if (i18n.language !== savedLang) {
            i18n.changeLanguage(savedLang).catch(() => {});
        }
        if (currentLanguage !== savedLang) {
            setCurrentLanguage(savedLang);
        }
    }, [i18n, currentLanguage]);

    // Check if user is already logged in via token
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        const savedEmail = localStorage.getItem("user_email");
        if (token && savedEmail) {
            const restoredUser = {
                email: savedEmail,
                name: savedEmail.split("@")[0],
                emailVerified: true,
            };
            setUser(restoredUser);

            // If user already has preferences and country configured, go directly to Dashboard
            const savedCountry = localStorage.getItem("cultural_guide_country");
            const savedPrefs = localStorage.getItem("cultural_guide_preferences");
            if (savedCountry && savedPrefs) {
                setCurrentView(AuthView.DASHBOARD);
            } else if (savedCountry) {
                setCurrentView(AuthView.PROFILE_PREFERENCES);
            } else {
                setCurrentView(AuthView.COUNTRY_SELECT);
            }
        }
    }, []);

    const handleLogin = (email) => {
        const loggedUser = {
            email,
            name: email.split("@")[0],
            emailVerified: true,
        };
        setUser(loggedUser);
        localStorage.setItem("user_email", email);

        // Always navigate to Country Selection screen upon login as requested by user
        setCurrentView(AuthView.COUNTRY_SELECT);
    };

    const handleRegister = (email, name) => {
        const registeredUser = {
            email,
            name: name || email.split("@")[0],
            emailVerified: false,
        };
        setUser(registeredUser);
        localStorage.setItem("user_email", email);
        // Start onboarding with country choice
        setCurrentView(AuthView.COUNTRY_SELECT);
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem("jwt");
        localStorage.removeItem("user_email");
        setCurrentView(AuthView.LOGIN);
    };

    const handleSelectCountry = (countryCode, defaultCity) => {
        setActiveCountry(countryCode);
        setSelectedCity(defaultCity);
        localStorage.setItem("cultural_guide_country", countryCode);
        localStorage.setItem("cultural_guide_city", defaultCity);

        // Proceed to complete profile and preferences
        setCurrentView(AuthView.PROFILE_PREFERENCES);
    };

    const handlePreferencesComplete = ({ country, municipality, profileVector }) => {
        if (country) {
            setActiveCountry(country);
            localStorage.setItem("cultural_guide_country", country);
        }
        if (municipality) {
            setSelectedCity(municipality);
            localStorage.setItem("cultural_guide_city", municipality);
        }
        if (profileVector) {
            setPreferences(profileVector);
            localStorage.setItem("cultural_guide_preferences", JSON.stringify(profileVector));
        }

        // Proceed directly to the 3-Card Dashboard!
        setCurrentView(AuthView.DASHBOARD);
    };

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Caricamento Cultural Guide...</div>}>
            <Header
                activeCountry={user && currentView !== AuthView.COUNTRY_SELECT ? activeCountry : null}
                selectedCity={user && currentView !== AuthView.COUNTRY_SELECT ? selectedCity : null}
                onSwitchCountry={() => setCurrentView(AuthView.COUNTRY_SELECT)}
                user={user}
                onLogout={handleLogout}
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
                theme={theme}
                onToggleTheme={toggleTheme}
                navigateToStart={() => {
                    if (preferences && activeCountry) {
                        setCurrentView(AuthView.DASHBOARD);
                    } else if (activeCountry) {
                        setCurrentView(AuthView.PROFILE_PREFERENCES);
                    } else {
                        setCurrentView(AuthView.COUNTRY_SELECT);
                    }
                }}
                navigateToLogin={() => setCurrentView(AuthView.LOGIN)}
            />

            <div style={{ paddingTop: 68 }} className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">

                {/* 1. LOGIN */}
                {currentView === AuthView.LOGIN && (
                    <LoginForm
                        onLogin={handleLogin}
                        onSwitchToRegister={() => setCurrentView(AuthView.REGISTER)}
                        onSwitchToRecovery={() => setCurrentView(AuthView.RECOVERY)}
                    />
                )}

                {/* 2. REGISTER */}
                {currentView === AuthView.REGISTER && (
                    <RegisterForm
                        onRegister={handleRegister}
                        onSwitchToLogin={() => setCurrentView(AuthView.LOGIN)}
                    />
                )}

                {/* 3. RECOVERY */}
                {currentView === AuthView.RECOVERY && (
                    <PasswordRecovery
                        onBackToLogin={() => setCurrentView(AuthView.LOGIN)}
                    />
                )}

                {/* 4. COUNTRY SELECTION (SWITZERLAND OR ITALY) */}
                {currentView === AuthView.COUNTRY_SELECT && user && (
                    <CountrySelection
                        onSelectCountry={handleSelectCountry}
                    />
                )}

                {/* 5. COMPACT PROFILE & PREFERENCES (PROFILE + DATES + DESTINATION + CATEGORIES) */}
                {currentView === AuthView.PROFILE_PREFERENCES && user && (
                    <ProfilePreferences
                        user={user}
                        activeCountry={activeCountry}
                        initialData={preferences}
                        onSwitchCountry={() => setCurrentView(AuthView.COUNTRY_SELECT)}
                        onComplete={handlePreferencesComplete}
                        onBack={() => {
                            if (preferences) {
                                setCurrentView(AuthView.DASHBOARD);
                            } else {
                                setCurrentView(AuthView.COUNTRY_SELECT);
                            }
                        }}
                    />
                )}

                {/* 6. MAIN 3-CARD DASHBOARD */}
                {currentView === AuthView.DASHBOARD && user && (
                    <Dashboard
                        user={user}
                        preferences={preferences}
                        onSwitchCountry={() => setCurrentView(AuthView.COUNTRY_SELECT)}
                        onNavigate={(target) => {
                            if (target === "swipecarousel") {
                                setCurrentView(AuthView.SWIPECAROUSEL);
                            } else if (target === "chatbot") {
                                setCurrentView(AuthView.CHATBOT);
                            } else if (target === "profile-preferences") {
                                setCurrentView(AuthView.PROFILE_PREFERENCES);
                            }
                        }}
                    />
                )}

                {/* 7. SWIPE CAROUSEL (DIRECT ACCESS FROM RECOMMENDATION CARD) */}
                {currentView === AuthView.SWIPECAROUSEL && user && (
                    <SwipeCarousel
                        key={`${activeCountry}-${selectedCity}-${currentLanguage}`}
                        municipality={selectedCity}
                        user={user}
                        preferences={preferences}
                        activeCountry={activeCountry}
                        currentLanguage={currentLanguage}
                        onBack={() => setCurrentView(AuthView.DASHBOARD)}
                        onNavigateToPreferences={() => setCurrentView(AuthView.PROFILE_PREFERENCES)}
                    />
                )}

                {/* 8. CHATBOT (DIRECT ACCESS FROM CHATBOT CARD) */}
                {currentView === AuthView.CHATBOT && user && (
                    <Chatbot
                        user={user}
                        onBack={() => setCurrentView(AuthView.DASHBOARD)}
                    />
                )}

            </div>
        </Suspense>
    );
}

export default App;