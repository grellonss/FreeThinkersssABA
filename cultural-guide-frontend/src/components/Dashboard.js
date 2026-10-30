import { LogOut, Mail, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";


export function Dashboard({ user, onLogout }) {
    const handleResendVerification = () => {
        toast.success('Verifizierungs-E-Mail wurde erneut gesendet!');
    };

    const { t, i18n } = useTranslation();

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-gray-900 mb-2">
                                {t("dashboard_welcomeBack")}, {user.name}!</h1>
                            <p className="text-gray-600">
                                {t("dashboard_manageAccount")}
                            </p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            {t("dashboard_logout")}
                        </button>
                    </div>
                </div>

                {/* Email Verification Alert */}
                {!user.emailVerified && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <XCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h3 className="text-amber-900 mb-2">
                                    {t("dashboard_verification_pending")}
                                </h3>
                                <p className="text-amber-700 mb-4">
                                    {t("dashboard_verify")}
                                </p>
                                <button
                                    onClick={handleResendVerification}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                >
                                    {t("dashboard_resend_verification")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Info Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <h2 className="text-gray-900 mb-6">
                        {t("dashboard_account_information")}
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            <UserIcon className="w-5 h-5 text-indigo-600 mt-1" />
                            <div className="flex-1">
                                <p className="text-gray-600 mb-1">Name</p>
                                <p className="text-gray-900">{user.name}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            <Mail className="w-5 h-5 text-indigo-600 mt-1" />
                            <div className="flex-1">
                                <p className="text-gray-600 mb-1">E-Mail-Adresse</p>
                                <p className="text-gray-900">{user.email}</p>
                            </div>
                            {user.emailVerified && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span>
                                        {t("dashboard_email_verified")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600">
                                {t("dashboard_account_balance")}
                            </p>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600">€</span>
                            </div>
                        </div>
                        <p className="text-gray-900">0,00 €</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600">
                                {t("dashboard_transactions")}
                            </p>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600">📊</span>
                            </div>
                        </div>
                        <p className="text-gray-900">0</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600">
                                {t("dashboard_memberSince")}
                            </p>
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-purple-600">📅</span> 
                            </div>
                        </div>
                        <p className="text-gray-900">
                            {new Date().toLocaleDateString(i18n.language, {
                                year: 'numeric',
                                month: 'long'
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
