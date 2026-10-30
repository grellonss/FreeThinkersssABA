import React, { useState } from "react";
import { Mail, Lock, User, UserPlus, ArrowRight, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "./ui_components/Loading";
import { CulturalGuideLogo } from "./CulturalGuideLogo";

export function RegisterForm({ onRegister, onSwitchToLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [termsAndConditions, setTermsAndConditions] = useState(false);

    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [termsAndConditionsError, setTermsAndConditionsError] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setNameError("");
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");
        setTermsAndConditionsError("");

        let hasError = false;

        if (!name || name.trim().length < 2) {
            setNameError(t("register_error_validName", "Inserisci un nome valido"));
            hasError = true;
        }

        if (!email) {
            setEmailError(t("register_error_fillInEmailField", "Inserisci l'indirizzo email"));
            hasError = true;
        } else if (!email.includes("@")) {
            setEmailError(t("register_error_validEmail", "Formato email non valido"));
            hasError = true;
        }

        if (!password) {
            setPasswordError(t("register_error_fillInPasswordField", "Inserisci la password"));
            hasError = true;
        } else if (password.length < 6) {
            setPasswordError(t("register_passwordPlaceholder", "La password deve avere almeno 6 caratteri"));
            hasError = true;
        }

        if (!confirmPassword) {
            setConfirmPasswordError(t("register_error_fillInConfirmPasswordField", "Conferma la password"));
            hasError = true;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError(t("register_error_passwordsDoNotMatch", "Le password non coincidono"));
            hasError = true;
        }

        if (!termsAndConditions) {
            setTermsAndConditionsError(t("register_error_agreeTerms", "Accetta i termini e le condizioni"));
            hasError = true;
        }

        if (hasError) return;

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5203/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password, name })
            });

            const body = await response.json().catch(() => null);

            if (!response.ok) {
                setEmailError(body?.message || t("login_error_generalError", "Errore durante la registrazione"));
                return;
            }

            if (body?.token) {
                localStorage.setItem("jwt", body.token);
            }

            onRegister(email, name);

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

                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-7 sm:p-9 transition-all">

                    {/* Brand header */}
                    <div className="text-center mb-6 flex flex-col items-center">
                        <div className="mb-3">
                            <CulturalGuideLogo size="md" showText={true} showSubtitle={false} />
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-red-50 via-white to-emerald-50 dark:from-red-950/40 dark:via-gray-800 dark:to-emerald-950/40 border border-gray-200 dark:border-gray-700/80 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-xs mb-3">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>ESN Olten 🇨🇭 & ESN Camerino 🇮🇹</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {t("register_title", "Crea il tuo Account")}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t("register_subtitle", "Unisciti alla community Erasmus & Cultural Guide")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5">

                        {/* NAME */}
                        <div>
                            <label htmlFor="name" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                {t("register_name", "Nome e Cognome")}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setNameError("");
                                    }}
                                    placeholder={t("register_namePlaceholder", "Mario Rossi")}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-850 transition-all shadow-xs"
                                />
                            </div>
                            {nameError && <p className="text-red-500 text-xs font-semibold mt-1">{nameError}</p>}
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                {t("register_email", "Indirizzo Email")}
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
                                    placeholder={t("register_emailPlaceholder", "nome@esempio.com")}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-850 transition-all shadow-xs"
                                />
                            </div>
                            {emailError && <p className="text-red-500 text-xs font-semibold mt-1">{emailError}</p>}
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                {t("register_password", "Password")}
                            </label>
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
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-850 transition-all shadow-xs"
                                />
                            </div>
                            {passwordError && <p className="text-red-500 text-xs font-semibold mt-1">{passwordError}</p>}
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                {t("register_confirmPassword", "Conferma Password")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setConfirmPasswordError("");
                                    }}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-850 transition-all shadow-xs"
                                />
                            </div>
                            {confirmPasswordError && <p className="text-red-500 text-xs font-semibold mt-1">{confirmPasswordError}</p>}
                        </div>

                        {/* TERMS */}
                        <div className="pt-1">
                            <label className="flex items-start cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={termsAndConditions}
                                    onChange={(e) => {
                                        setTermsAndConditions(e.target.checked);
                                        setTermsAndConditionsError("");
                                    }}
                                    className="w-4 h-4 text-emerald-700 rounded border-gray-300 focus:ring-emerald-700 dark:border-gray-600 dark:bg-gray-700 mt-0.5"
                                />
                                <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {t("register_error_agreeTerms", "Accetto i termini di servizio e le informative sulla privacy")}
                                </span>
                            </label>
                            {termsAndConditionsError && <p className="text-red-500 text-xs font-semibold mt-1">{termsAndConditionsError}</p>}
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-emerald-700 via-green-800 to-emerald-900 hover:from-emerald-800 hover:to-green-900 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 group"
                            >
                                {isLoading ? (
                                    <LoadingSpinner size="sm" className="mx-auto" />
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        <span>{t("register_submit", "Registrati ed Esplora")}</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* LOGIN REDIRECT */}
                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("register_alreadyHaveAccount", "Hai già un account?")}{" "}
                            <button
                                type="button"
                                onClick={onSwitchToLogin}
                                className="font-bold text-red-700 dark:text-red-400 hover:underline transition-colors ml-1"
                            >
                                {t("register_loginNow", "Accedi qui")}
                            </button>
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default RegisterForm;
