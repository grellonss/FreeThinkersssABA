import React from "react";
import { useTranslation } from "react-i18next";


export function LoadingSpinner({
                                   size = "md",
                                   className = "",
                               }) {
    const { t } = useTranslation();

    const sizeClasses = {
        sm: "w-6 h-6 border-2",
        md: "w-10 h-10 border-3",
        lg: "w-16 h-16 border-4",
        xl: "w-24 h-24 border-4",
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
                role="status"
                aria-label={t("loadingSpinner_ariaLabel")}
            >
        <span className="sr-only">
          {t("loadingSpinner_loading")}
        </span>
            </div>
        </div>
    );
}

// =============================
// Full page variant
// =============================
export function FullPageLoadingSpinner() {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="xl" />
                <p className="text-indigo-600">
                    {t("loadingSpinner_loading")}
                </p>
            </div>
        </div>
    );
}

// =============================
// Inline variant
// =============================
export function InlineLoading({
                                  text,
                                  size = "sm",
                              }) {
    const { t } = useTranslation();

    const resolvedText = text ?? t("loadingSpinner_loading");

    const sizeClasses = {
        sm: "w-6 h-6 border-2",
        md: "w-10 h-10 border-3",
        lg: "w-16 h-16 border-4",
        xl: "w-24 h-24 border-4",
    };
    
    return (
        <div className="flex items-center gap-2">
            <div
                className={`${sizeClasses} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
                role="status"
                aria-label={t("loadingSpinner_ariaLabel")}
            />
            <span className="text-indigo-600">
        {resolvedText}
      </span>
        </div>
    );
}
