import { useState, useEffect, Suspense } from "react";
import { LoginForm } from "./components/LoginForm";
import { Start } from "./components/Start";
import { RegisterForm } from "./components/RegisterForm";
import { PasswordRecovery } from "./components/PasswordRecovery";
import { Dashboard } from "./components/Dashboard";
import { InterestSelection } from "./components/InterestSelection";
import { SwipeCarousel }  from "./components/SwipeCarousel";
import { Chatbot }  from "./components/Chatbot";
import { useTranslation } from "react-i18next";
import { Header } from "./components/Header";

const AuthView = {
    LOGIN: "login",
    REGISTER: "register",
    START: "start",
    RECOVERY: "recovery",
    DASHBOARD: "dashboard",
    INTERESTS: "interests",
    SWIPECAROUSEL: "swipecarousel",
    CITYSELECTION: "cityselection",
    TIMEAVAILABILITY: "timeavailability",
    CHATBOT: "chatbot",
};

function App() {
    const [currentView, setCurrentView] = useState(AuthView.LOGIN);
    const [user, setUser] = useState(null);
    const [selectedCity, setSelectedCity] = useState('');
    const { i18n } = useTranslation();

    // Restore saved language from localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem("lang");
        if (savedLang && i18n.language !== savedLang) {
            i18n.changeLanguage(savedLang).catch(() => {});
        }
    }, [i18n]);

    const handleLogin = (email) => {
        const mockUser = {
            email,
            name: email.split("@")[0],
            emailVerified: true,
        };
        setUser(mockUser);
        setCurrentView(AuthView.START);
    };

    const handleRegister = (email, name) => {
        const mockUser = {
            email,
            name,
            emailVerified: false,
        };
        setUser(mockUser);
        setCurrentView(AuthView.START);
    };

    const handleLogout = () => {
        setUser(null);
        setCurrentView(AuthView.LOGIN);
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Header
                navigateToStart={() => setCurrentView(AuthView.START)}
                navigateToLogin={() => setCurrentView(AuthView.LOGIN)}
            />
            <div style={{ paddingTop: 64 }} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

                {/* Views */}
                {currentView === AuthView.LOGIN && (
                    <LoginForm
                        onLogin={handleLogin}
                        onSwitchToRegister={() => setCurrentView(AuthView.REGISTER)}
                        onSwitchToRecovery={() => setCurrentView(AuthView.RECOVERY)}
                    />
                )}

                {currentView === AuthView.REGISTER && (
                    <RegisterForm
                        onRegister={handleRegister}
                        onSwitchToLogin={() => setCurrentView(AuthView.LOGIN)}
                    />
                )}

                {currentView === AuthView.START && user && (
                    <Start onNavigate={(view) => setCurrentView(view)} />
                )}

                {currentView === AuthView.RECOVERY && (
                    <PasswordRecovery
                        onBackToLogin={() => setCurrentView(AuthView.LOGIN)}
                    />
                )}

                {currentView === AuthView.DASHBOARD && user && (
                    <Dashboard user={user} onLogout={handleLogout} />
                )}

                {/* Swipe Carousel - Final step showing recommendations */}
                {currentView === AuthView.SWIPECAROUSEL && user && (
                    <SwipeCarousel
                        municipality={selectedCity}
                        user={user}
                        onBack={() => setCurrentView(AuthView.START)}
                        onNavigateToPreferences={() => setCurrentView(AuthView.INTERESTS)}
                    />
                )}

                {/* InterestSelection - Page with TIMEAVAILABILITY, CITYSELECTION & INTERESTSELECTION */}
                {currentView === AuthView.INTERESTS && user && (
                    <InterestSelection
                        user={user}
                        onBack={() => setCurrentView(AuthView.START)}
                    />
                )}

                {/* ChatBot - Chat window connected to online LLM */}
                {currentView === AuthView.CHATBOT && user && (
                    <Chatbot
                        user={user}
                        onBack={() => setCurrentView(AuthView.START)}
                    />
                )
                    
                }
            </div>
        </Suspense>
    );
}

export default App;