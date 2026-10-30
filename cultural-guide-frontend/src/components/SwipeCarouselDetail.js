import React, {useState, useEffect} from 'react';
import { X, MapPin, Clock, Phone, Globe, Mail, Calendar, Info, Euro, Facebook, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import defaultImage from '../images/ImageWithFallback.jpg';
import {toast} from "sonner";
import { LoadingSpinner } from './ui_components/Loading';
import { fetchEatAndDrinkDetail } from '../services/EatAndDrinksService';


export function SwipeCarouselDetail({ item, onClose }) {
    const { t, i18n } = useTranslation();

    const [extendedData, setExtendedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // -----------------------------------------------------------
    // 1. Lazy Loading
    // -----------------------------------------------------------
    useEffect(() => {
        if (!item.id) return;

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
    }, [item.id, i18n.language]);

    if (!item) return null;

    // -----------------------------------------------------------
    // 2. DATA UNION
    // -----------------------------------------------------------
    const displayItem = {
        ...item,            // Dati base (Titolo, Foto, Indirizzo)
        ...extendedData,    // Dati nuovi (Telefono, Sito, Descrizione Lunga)

        // Normalizzazione di sicurezza (mappa i nomi del DB ai nomi usati qui)
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

    // -----------------------------------------------------------
    // 3. SAFE RENDERER
    // -----------------------------------------------------------
    const renderSafe = (val) => {
        if (typeof val === 'string' || typeof val === 'number') return val;

        if (Array.isArray(val)) {
            return val.map(v => renderSafe(v)).join('\n');
        }

        if (typeof val === 'object' && val !== null) {
            if (val.opens || val.closes) {
                return `${val.day ? val.day + ': ' : ''}${val.opens || ''} - ${val.closes || ''}`;
            }
            return JSON.stringify(val);
        }

        return val;
    };
    // -----------------------------------------------------------
    // 4. VALUE BACK ONLY IF IT EXISTS
    // -----------------------------------------------------------
    const InfoRow = ({ icon: Icon, label, value, isLink, linkType }) => {
        if (!value || value === "N/A" || value === "") return null;

        const safeValue = renderSafe(value);
        if (!safeValue) return null;

        return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                {isLink ? (
                    <a
                        href={linkType === 'email' ? `mailto:${value}` : linkType === 'tel' ? `tel:${safeValue}` : safeValue}
                        target={linkType === 'url' ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-medium hover:underline truncate block"
                    >
                        {value}
                    </a>
                ) : (
                    <p className="text-gray-900 font-medium text-sm md:text-base break-words">{safeValue}</p>
                )}
            </div>
        </div>
    );
    };
    return (
        // Overlay Dark Background
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Blank */}
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">

                {/* X button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur text-gray-700 rounded-full hover:bg-white hover:text-red-600 transition-all shadow-lg"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Image left */}
                <div className="w-full md:w-5/12 h-64 md:h-auto relative bg-gray-100 min-h-[250px]">
                    <img
                        src={displayItem.image}
                        alt={renderSafe(displayItem.title)}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                    />

                    {/* Loading */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center">
                            <LoadingSpinner size="md" />
                        </div>
                    )}

                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                            {renderSafe(displayItem.type)}
                        </span>
                    </div>
                </div>

                {/* Information right */}
                <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col">

                    {/* Title */}
                    <div className="mb-6 border-b border-gray-100 pb-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                            {renderSafe(displayItem.title)}
                        </h2>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                {t('details_about') || "About"}
                            </h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                            {renderSafe(displayItem.description) || t('details_noDescription')}
                        </p>
                    </div>

                    {/* Details grip, is displayed only if they exists */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        <InfoRow icon={MapPin} label={t('details_address') || "Address"} value={displayItem.location} />
                        <InfoRow icon={Clock} label={t('details_hours') || "Hours"} value={displayItem.openingHours} />

                        <InfoRow icon={Phone} label={t('details_phone') || "Phone"} value={displayItem.phone} isLink linkType="tel" />
                        <InfoRow icon={Mail} label={t('details_email') || "Email"} value={displayItem.email} isLink linkType="email" />
                        <InfoRow icon={Globe} label={t('details_website') || "Website"} value={displayItem.website} isLink linkType="url" />

                        {/* Social Networks */}
                        <InfoRow icon={Facebook} label="Facebook" value={displayItem.facebook} isLink linkType="url" />
                        <InfoRow icon={Instagram} label="Instagram" value={displayItem.instagram} isLink linkType="url" />

                        <InfoRow icon={Euro} label={t('details_price') || "Price"} value={displayItem.price} />
                        <InfoRow icon={Calendar} label={t('details_dates') || "Dates"} value={displayItem.dates} />
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            {t('close') || "Chiudi"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}