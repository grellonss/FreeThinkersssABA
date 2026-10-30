import { useState } from 'react';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";

export function PasswordRecovery({ onBackToLogin }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please fill in the email field');
            return;
        }

        if (!email.includes('@')) {
            toast.error('Please enter a valid email address');
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
                toast.error(body?.message || "Error, could not send recovery email");
                return;
            }

            setEmailSent(true);
            toast.success(t("passwordRecovery_emailSent"));

        } catch (error) {
            console.error(error);
            toast.error(t("passwordRecovery_networkError"));
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------
    // Success screen
    // -------------------------------
    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <Mail className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-gray-900 mb-2">
                                {t("passwordRecovery_emailSent")}
                            </h1>
                            <p className="text-gray-600 mb-6">
                                {t("passwordRecovery_sentEmailTo")}{" "}
                                <span className="text-gray-900">{email}</span>
                            </p>
                            <p className="text-gray-600 mb-8">
                                {t("passwordRecovery_checkSpam")}
                            </p>
                            <button
                                onClick={onBackToLogin}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {t("passwordRecovery_goBackToLogin")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------
    // Input form
    // -------------------------------
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <button
                        onClick={onBackToLogin}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {t("passwordRecovery_goBackToLogin")}
                    </button>

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <KeyRound className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h1 className="text-gray-900 mb-2">
                            {t("passwordRecovery_forgotPasswordQuestion")}
                        </h1>
                        <p className="text-gray-600">
                            {t("passwordRecovery_forgotPassword")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-gray-700 mb-2">
                                {t("passwordRecovery_email")}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("login_emailPlaceholder")}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? t("passwordRecovery_getsSend") : t("passwordRecovery_emailRecoverySend")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
