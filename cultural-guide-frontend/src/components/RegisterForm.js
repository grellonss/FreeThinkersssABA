import { useState } from 'react';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useTranslation } from "react-i18next";
import {LoadingSpinner} from "./ui_components/Loading";


export function RegisterForm({ onRegister, onSwitchToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAndConditions, setTermsAndConditions] = useState(false);

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [termsAndConditionsError, setTermsAndCOnditionsError] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    
    const {t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // reset previous errors
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setTermsAndCOnditionsError('');

        let hasError = false;


        // NAME
        if (!name || name.trim().length < 5) {
            setNameError(t('register_error_validName'));
            hasError = true;
        }

        // EMAIL
        if (!email) {
            setEmailError(t('register_error_fillInEmailField'));
            hasError = true;
        } else if (!email.includes('@')) {
            setEmailError(t('register_error_validEmail'));
            hasError = true;
        }

        // PASSWORD
        if (!password) {
            setPasswordError(t('register_error_fillInPasswordField'));
            hasError = true;
        } else if (password.length < 8) {
            setPasswordError(t('register_passwordPlaceholder'));
            hasError = true;
        }

        // CONFIRM PASSWORD
        if (!confirmPassword) {
            setConfirmPasswordError(t('register_error_confirmPassword'));
            hasError = true;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError(t('register_error_confirmPassword'));
            hasError = true;
        }

        // TERMS AND CONDITIONS
        if (!termsAndConditions) {
            setTermsAndCOnditionsError(t('register_error_agreeTerms'));
            hasError = true;
        }
        
        if (hasError) return;
        
        
        // VALIDATION DONE - proceed with registration API call
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
                console.log(body?.message || "error while registering");
                return;
            }

            // SUCCESS
            console.log("registration successful");

            // store jwt
            if (body?.token) {
                localStorage.setItem("jwt", body.token);
            }

            // notify app
            onRegister(email, name);

        } catch (error) {
            console.error(error);
            console.log("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
        
        // Simulate API call
        setTimeout(() => {
            console.log('Registration successful! Please check your email to verify your account.');
            onRegister(email, name);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <UserPlus className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h1 className="text-gray-900 mb-2">
                            {t("register_submit")}
                        </h1>
                        <p className="text-gray-600">
                            {t("register_title")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-gray-700 mb-2">
                                {t("register_name")}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {setName(e.target.value); setNameError('');}}
                                    placeholder={t('register_namePlaceholder')}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            {nameError && (
                                <p className="text-red-600 text-sm mt-1">
                                    {nameError}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-gray-700 mb-2">
                                {t("register_email")}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    value={email}
                                    onChange={(e) => {setEmail(e.target.value); setEmailError('');}}
                                    placeholder={t('register_emailPlaceholder')}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                </div>
                            {emailError && (
                                <p className="text-red-600 text-sm mt-1">
                                    {emailError}
                                </p>
                            )}

                        </div>

                        <div>
                            <label htmlFor="password" className="block text-gray-700 mb-2">
                                {t("register_password")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => {setPassword(e.target.value); setPasswordError('');}}
                                    placeholder={t('register_passwordPlaceholder')}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                </div>
                            {passwordError && (
                                <p className="text-red-600 text-sm mt-1">
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                                {t("register_confirmPassword")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {setConfirmPassword(e.target.value); setPasswordError('');}}
                                    placeholder={t('register_passwordRepeatPlaceholder')}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                </div>
                            {confirmPasswordError && (
                                <p className="text-red-600 text-sm mt-1">
                                    {confirmPasswordError}
                                </p>
                            )}
                        </div>

                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={termsAndConditions}
                                onChange={(e) => {
                                    setTermsAndConditions(e.target.checked);
                                    setTermsAndCOnditionsError('');
                                }}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                            />
                            <label htmlFor="terms" className="ml-2 text-gray-600">
                                {t("register_error_agreeTerms")}
                            </label>
                        </div>

                        {termsAndConditionsError && (
                            <p className="text-red-600 text-sm mt-1">{termsAndConditionsError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <LoadingSpinner size="sm" className="mx-auto" /> : t("register_submit")}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            {t("register_alreadyHaveAccount")}{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                {t("register_loginNow")}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
