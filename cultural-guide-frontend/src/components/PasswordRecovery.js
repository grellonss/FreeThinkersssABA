import React, { useState } from "react";
import { Mail, ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { CulturalGuideLogo } from "./CulturalGuideLogo";

export function PasswordRecovery({ onBackToLogin }) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error(t("login_fillInEmailField", "Inserisci l'indirizzo email"));
            return;
        }

        if (!email.includes("@")) {
            toast.error(t("login_error_invalidEmail", "Formato email non valido"));
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5203/api/auth/password-recovery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email })
            });

            const body = await response.json().catch(() => null);

            if (!response.ok) {
                toast.error(body?.message || t("passwordRecovery_networkError", "Errore nell'invio dell'email di recupero"));
                return;
            }

            setEmailSent(true);
            toast.success(t("passwordRecovery_emailSent", "Email di recupero inviata!"));

        } catch (error) {
            console.error(error);
            toast.error(t("passwordRecovery_networkError", "Errore di connessione"));
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------
    // Success screen
    // -------------------------------
    if (emailSent) {
        return (
            <div className="min-h-[calc(100vh-68px)] flex items-center justify-center py-8 px-4 sm:px-6">
                <div className="w-full max-w-md">
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 text-center transition-all">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full mb-4">
                            <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                            {t("passwordRecovery_emailSent", "Email inviata!")}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {t("passwordRecovery_sentEmailTo", "Abbiamo inviato un link di recupero a:")}{" "}
                            <span className="font-bold text-gray-900 dark:text-white">{email}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                            {t("passwordRecovery_checkSpam", "Controlla anche nella cartella spam se non la trovi.")}
                        </p>
                        <button
                            type="button"
                            onClick={onBackToLogin}
                            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-900 hover:to-rose-950 shadow-md transition-all"
                        >
                            {t("passwordRecovery_goBackToLogin", "Torna al login")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------
    // Input form
    // -------------------------------
    return (
        <div className="min-h-[calc(100vh-68px)] flex items-center justify-center py-8 px-4 sm:px-6">
            <div className="w-full max-w-md">
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-7 sm:p-9 transition-all">
                    
                    <button
                        type="button"
                        onClick={onBackToLogin}
                        className="inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-5"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        <span>{t("passwordRecovery_goBackToLogin", "Torna al login")}</span>
                    </button>

                    <div className="text-center mb-6 flex flex-col items-center">
                        <div className="mb-2">
                            <CulturalGuideLogo size="sm" showText={false} />
                        </div>
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-950/60 rounded-full mb-3">
                            <KeyRound className="w-6 h-6 text-red-800 dark:text-red-400" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {t("passwordRecovery_forgotPasswordQuestion", "Hai dimenticato la password?")}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                            {t("passwordRecovery_forgotPassword", "Inserisci la tua email per ricevere le istruzioni di recupero")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                {t("passwordRecovery_email", "Email")}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("login_emailPlaceholder", "nome@esempio.com")}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-800 dark:focus:ring-red-600 focus:bg-white dark:focus:bg-gray-850 transition-all shadow-xs"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-red-800 via-rose-900 to-emerald-800 hover:from-red-900 hover:to-emerald-900 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 animate-spin" />
                                        <span>{t("passwordRecovery_getsSend", "Invio in corso...")}</span>
                                    </span>
                                ) : (
                                    <span>{t("passwordRecovery_emailRecoverySend", "Invia Link di Recupero")}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PasswordRecovery;
