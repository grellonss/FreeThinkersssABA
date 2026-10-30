import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Phone, Globe, Mail, Calendar, Info, Euro, Facebook, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { handleImageFallback } from '../services/imageResolver';
import { LoadingSpinner } from './ui_components/Loading';
import { fetchEatAndDrinkDetail } from '../services/EatAndDrinksService';

export function SwipeCarouselDetail({ item, onClose }) {
    const { t, i18n } = useTranslation();

    const [extendedData, setExtendedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const activeCountry = localStorage.getItem("cultural_guide_country") || "CH";
    const isIt = activeCountry === "IT";
    const themeBgClass = isIt ? 'bg-emerald-700' : 'bg-red-800';
    const themeTextClass = isIt ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-800 dark:text-red-400';

    // -----------------------------------------------------------
    // 1. Lazy Loading
    // -----------------------------------------------------------
    useEffect(() => {
        if (!item?.id) return;

        const loadDetails = async () => {
            setIsLoading(true);
            try {
                const data = await fetchEatAndDrinkDetail(item.id, i18n.language);
                if (data) {
                    setExtendedData(data);
                }
            } catch (error) {
                console.warn(`No extra info for ${item.title} (ID: ${item.id})`);
            } finally {
                setIsLoading(false);
            }
        };

        loadDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item?.id, i18n.language]);

    if (!item) return null;

    // -----------------------------------------------------------
    // 2. DATA UNION
    // -----------------------------------------------------------
    const displayItem = {
        ...item,
        ...extendedData,
        title: extendedData?.officialName || item.title,
        description: extendedData?.description || item.description,
        location: extendedData?.address || item.location,
        phone: extendedData?.telephone || item.phone,
        email: extendedData?.email || item.email,
        website: extendedData?.website || item.website,
        facebook: extendedData?.facebook,
        instagram: extendedData?.instagram,
        openingHours: extendedData?.openingHours || item.openingHours,
        price: extendedData?.price || item.price,
    };

    const renderSafe = (val) => {
        if (!val) return null;
        if (typeof val === 'object') {
            return val.it || val.en || val.de || Object.values(val)[0] || '';
        }
        return val;
    };

    const InfoRow = ({ icon: Icon, label, value, isLink, linkType }) => {
        if (!value || value === "N/A" || value === "") return null;

        const safeValue = renderSafe(value);
        if (!safeValue) return null;

        return (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100/80 dark:border-gray-700/60">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-xs text-gray-700 dark:text-gray-200">
                    <Icon className={`w-4 h-4 ${themeTextClass}`} />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                    {isLink ? (
                        <a
                            href={linkType === 'email' ? `mailto:${value}` : linkType === 'tel' ? `tel:${safeValue}` : safeValue}
                            target={linkType === 'url' ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className={`font-semibold text-xs md:text-sm hover:underline truncate block ${themeTextClass}`}
                        >
                            {value}
                        </a>
                    ) : (
                        <p className="text-gray-800 dark:text-gray-200 font-medium text-xs md:text-sm break-words">{safeValue}</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="relative bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col md:flex-row border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">

                {/* X button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all shadow-lg backdrop-blur-md"
                    title={t('carousel_close', 'Chiudi')}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Image left */}
                <div className="w-full md:w-5/12 h-64 md:h-auto relative bg-gray-100 dark:bg-gray-800 min-h-[250px]">
                    <img
                        src={displayItem.image}
                        alt={renderSafe(displayItem.title)}
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageFallback(e, displayItem.title, displayItem.location, activeCountry)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Loading */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-xs flex items-center justify-center">
                            <LoadingSpinner size="md" />
                        </div>
                    )}

                    <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg ${themeBgClass}`}>
                            {renderSafe(displayItem.type)}
                        </span>
                    </div>
                </div>

                {/* Information right */}
                <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col">

                    {/* Title */}
                    <div className="mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                            {renderSafe(displayItem.title)}
                        </h2>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className={`w-4 h-4 ${themeTextClass}`} />
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {t('details_about', 'Informazioni')}
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                            {renderSafe(displayItem.description) || t('details_noDescription', 'Nessuna descrizione disponibile.')}
                        </p>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        <InfoRow icon={MapPin} label={t('details_address', 'Indirizzo')} value={displayItem.location} />
                        <InfoRow icon={Clock} label={t('details_hours', 'Orari')} value={displayItem.openingHours} />
                        <InfoRow icon={Phone} label={t('details_phone', 'Telefono')} value={displayItem.phone} isLink linkType="tel" />
                        <InfoRow icon={Mail} label={t('details_email', 'Email')} value={displayItem.email} isLink linkType="email" />
                        <InfoRow icon={Globe} label={t('details_website', 'Sito Web')} value={displayItem.website} isLink linkType="url" />
                        <InfoRow icon={Facebook} label="Facebook" value={displayItem.facebook} isLink linkType="url" />
                        <InfoRow icon={Instagram} label="Instagram" value={displayItem.instagram} isLink linkType="url" />
                        <InfoRow icon={Euro} label={t('details_price', 'Prezzo')} value={displayItem.price} />
                        <InfoRow icon={Calendar} label={t('details_dates', 'Date')} value={displayItem.dates} />
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-colors text-sm"
                        >
                            {t('carousel_close', 'Chiudi')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}