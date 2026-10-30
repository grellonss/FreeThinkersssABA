import React, { useState } from "react";
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CulturalGuideLogo } from "./CulturalGuideLogo";

export function LoginForm({ onLogin, onSwitchToRegister, onSwitchToRecovery }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [stayLoggedIn, setStayLoggedIn] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setEmailError("");
        setPasswordError("");

        if (!email) setEmailError(t("login_fillInEmailField", "Inserisci l'indirizzo email"));
        if (!password) setPasswordError(t("login_fillInPasswordField", "Inserisci la password"));
        if (!email || !password) return;

        if (!email.includes("@")) {
            setEmailError(t("login_error_invalidEmail", "Formato email non valido"));
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5203/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password })
            });

            const body = await response.json().catch(() => null);

            if (!response.ok) {
                if (response.status === 401) {
                    setPasswordError(t("login_error_invalidCredentials", "Credenziali non valide"));
                } else {
                    setEmailError(t("login_error_generalError", "Errore durante l'accesso"));
                }
                return;
            }

            if (body?.token) {
                localStorage.setItem("jwt", body.token);
            }
            if (stayLoggedIn) {
                localStorage.setItem("user_email", body?.email || email);
            }

            onLogin(body?.email || email);

        } catch (error) {
            console.error(error);
            setEmailError(t("login_network_error", "Errore di connessione al server"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-68px)] flex items-center justify-center py-8 px-4 sm:px-6">
            <div className="w-full max-w-md">

                {/* Main Glassmorphic Card */}
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-7 sm:p-9 transition-all">

                    {/* Brand & Partner Badge */}
                    <div className="text-center mb-6 flex flex-col items-center">
                        <div className="mb-3">
                            <CulturalGuideLogo size="md" showText={true} showSubtitle={false} />
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-red-50 via-white to-emerald-50 dark:from-red-950/40 dark:via-gray-800 dark:to-emerald-950/40 border border-gray-200 dark:border-gray-700/80 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-xs mb-3">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>ESN Olten 🇨🇭 & ESN Camerino 🇮🇹</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {t("login_title", "Bentornato")}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t("login_subtitle", "Accedi al tuo account per continuare")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* EMAIL FIELD */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                {t("login_email", "Indirizzo Email")}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailError("");
                                    }}
                                    placeholder={t("login_emailPlaceholder", "nome@esempio.com")}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-800 dark:focus:ring-red-600 focus:bg-white dark:focus:bg-gray-850 transition-all shadow-xs"
                                />
                            </div>
                            {emailError && <p className="text-red-500 text-xs font-semibold mt-1">{emailError}</p>}
                        </div>

                        {/* PASSWORD FIELD */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    {t("login_password", "Password")}
                                </label>
                                <button
                                    type="button"
                                    onClick={onSwitchToRecovery}
                                    className="text-xs font-semibold text-red-700 dark:text-red-400 hover:underline transition-colors"
                                >
                                    {t("login_forgotPassword", "Password dimenticata?")}
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError("");
                                    }}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-800 dark:focus:ring-red-600 focus:bg-white dark:focus:bg-gray-850 transition-all shadow-xs"
                                />
                            </div>
                            {passwordError && <p className="text-red-500 text-xs font-semibold mt-1">{passwordError}</p>}
                        </div>

                        {/* REMEMBER ME */}
                        <div className="flex items-center pt-1">
                            <label className="flex items-center cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={stayLoggedIn}
                                    onChange={(e) => setStayLoggedIn(e.target.checked)}
                                    className="w-4 h-4 text-red-800 rounded border-gray-300 focus:ring-red-800 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {t("login_stayLoggedIn", "Resta collegato")}
                                </span>
                            </label>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-red-800 via-rose-900 to-emerald-800 hover:from-red-900 hover:to-emerald-900 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 animate-spin" />
                                        <span>Caricamento...</span>
                                    </span>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4" />
                                        <span>{t("login_submit", "Accedi alla Guida")}</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* REGISTER REDIRECT */}
                    <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("login_noAccount", "Non hai ancora un account?")}{" "}
                            <button
                                type="button"
                                onClick={onSwitchToRegister}
                                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline transition-colors ml-1"
                            >
                                {t("login_registerNow", "Registrati ora")}
                            </button>
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default LoginForm;
