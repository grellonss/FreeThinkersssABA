import { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import {useTranslation} from "react-i18next";


export function LoginForm({ onLogin, onSwitchToRegister, onSwitchToRecovery }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // error states for inputs
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setEmailError('');
        setPasswordError('');

        if (!email) setEmailError(t('login_fillInEmailField'));
        if (!password) setPasswordError(t('login_fillInPasswordField'));
        if (!email || !password) return;

        if (!email.includes('@')) {
            setEmailError(t('login_error_invalidEmail'));
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

            // Read body only once
            const body = await response.json().catch(() => null);

            if (!response.ok) {
                if (response.status === 401) {
                    // Email or password wrong
                    setEmailError(' ');
                    setPasswordError(t("login_error_invalidCredentials"));
                } else {
                    setEmailError(t("login_error_generalError"));
                }
                return;
            }

            // Success
            onLogin(body?.email || email);
            localStorage.setItem("jwt", body.token);

        } catch (error) {
            console.error(error);
            setEmailError(t('login_network_error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <LogIn className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h1 className="text-gray-900 mb-2">
                            {t("login_title")}
                        </h1>
                        <p className="text-gray-600">
                            {t("login_subtitle")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-gray-700 mb-2">
                                {t("login_email")}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("login_emailPlaceholder")}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            {emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-gray-700 mb-2">
                                {t("login_password")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-gray-600">
                                    {t("login_stayLoggedIn")}
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={onSwitchToRecovery}
                                className="text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                {t("login_forgotPassword")}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "..." : t("login_submit")}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            {t("login_noAccount")}{" "}
                            <button
                                onClick={onSwitchToRegister}
                                className="text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                {t("login_registerNow")}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
