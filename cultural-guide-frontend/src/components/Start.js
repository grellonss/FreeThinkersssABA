import React from "react";
import { useTranslation } from "react-i18next";
import { User, MessageSquare, Settings, MapPin, ArrowRight } from "lucide-react";

export function Start({ onNavigate }) {
    const { t } = useTranslation();

    const menuItems = [
        {
            id: "profile",
            title: t("menuItems_profile_title"),
            description: t("menuItems_profile_description"),
            icon: User,
            gradient: "from-blue-500 to-indigo-600",
        },
        {
            id: "chatbot",
            title: t("menuItems_chatbot_title"),
            description: t("menuItems_chatbot_description"),
            icon: MessageSquare,
            gradient: "from-purple-500 to-pink-600",
        },
        {
            id: "preferences",
            title: t("menuItems_preferences_title"),
            description: t("menuItems_preferences_description"),
            icon: Settings,
            gradient: "from-green-500 to-teal-600",
        },
        {
            id: "recommendations",
            title: t("menuItems_recommendations_title"),
            description: t("menuItems_recommendations_description"),
            icon: MapPin,
            gradient: "from-orange-500 to-red-600",
        },
    ];

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === "recommendations") {
                                        // Navigate to city selection first
                                        onNavigate("swipecarousel");
                                    } else if (item.id === "preferences") {
                                        // Navigate to time availability
                                        onNavigate("interests");
                                    } else if (item.id === "chatbot") {
                                        // Navigate to chatbot directly
                                        onNavigate("chatbot");
                                    }
                                    else {
                                        // Navigate to other views
                                        onNavigate(item.id);
                                    }
                                }}
                                className="group bg-white rounded-2xl shadow-xl p-8 text-left hover:shadow-2xl transition-all hover:scale-105"
                            >
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Title + Arrow */}
                                <div className="flex items-start justify-between mb-3">
                                    <h2 className="text-gray-900">{item.title}</h2>
                                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </div>

                                {/* Description */}
                                <p className="text-gray-600">{item.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}