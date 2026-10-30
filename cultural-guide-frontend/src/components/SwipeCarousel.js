import React, { useEffect, useState } from "react";
import { SwipeCarouselDetail } from "./SwipeCarouselDetail";
import { MapView } from "./ui_components/MapView";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Clock,
    Edit3,
    Calendar,
    Sparkles,
    Filter,
    Tag,
    Globe,
    Compass
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { handleImageFallback } from '../services/imageResolver';
import { fetchEatAndDrinks } from "../services/EatAndDrinksService";
import { fetchArtAndCulture } from "../services/ArtAndCultureService";
import { fetchArticlesAndMagazines } from "../services/ArticlesAndMagazinesService";
import { fetchEconomicOperators } from "../services/EconomicOperatorsService";
import { fetchEvents } from "../services/EventsService";
import { fetchItineraries } from "../services/ItinerariesService";
import { fetchNature } from "../services/NatureService";
import { fetchPointsOfSale } from "../services/PointsOfSaleService";
import { fetchRecreationAndFun } from "../services/RecreationAndFunService";
import { fetchServices } from "../services/ServicesService";
import { fetchSleep } from "../services/SleepService";
import { fetchTypicalProducts } from "../services/TypicalProductsService";
import { LoadingSpinner } from "./ui_components/Loading";
import { formatDate } from "../utils/formatDate";
import { mapCategoriesToEndpoints } from "../services/PoiToEnpointMapper";
import { fetchEntertainmentLeisure } from "../services/EntertainmentLeisureService";
import { fetchOrganizations } from "../services/OrganizationService";
import { fetchRoutes } from "../services/RoutesService";
import { fetchShopping } from "../services/ShoppingService";
import { fetchMap } from "../services/MapService";

const NextArrow = ({ onClick, isItalian }) => (
    <button
        onClick={onClick}
        type="button"
        aria-label="Prossima card"
        className={`absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 ${
            isItalian ? "text-emerald-800 dark:text-emerald-300 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60" : "text-red-800 dark:text-red-300 hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/60"
        }`}
    >
        <ChevronRight className="w-6 h-6" />
    </button>
);

const PrevArrow = ({ onClick, isItalian }) => (
    <button
        onClick={onClick}
        type="button"
        aria-label="Card precedente"
        className={`absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 ${
            isItalian ? "text-emerald-800 dark:text-emerald-300 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60" : "text-red-800 dark:text-red-300 hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/60"
        }`}
    >
        <ChevronLeft className="w-6 h-6" />
    </button>
);

const ALL_CATEGORIES = [
    "eatanddrink",
    "entertainmentleisure",
    "artculture",
    "articles",
    "organizations",
    "routes",
    "shopping",
    "events",
    "nature",
    "services",
    "sleep",
    "typicalproducts"
];

const CATEGORY_META = {
    artculture: { label: "Arte & Cultura", icon: "🏛️" },
    eatanddrink: { label: "Enogastronomia", icon: "🍷" },
    nature: { label: "Natura & Parchi", icon: "🌲" },
    routes: { label: "Itinerari & Escursioni", icon: "🥾" },
    events: { label: "Eventi & Folklore", icon: "🎭" },
    typicalproducts: { label: "Prodotti Tipici", icon: "🧀" },
    shopping: { label: "Shopping & Botteghe", icon: "🛍️" },
    entertainmentleisure: { label: "Intrattenimento & Svago", icon: "🎡" },
    sleep: { label: "Ospitalità & Soggiorno", icon: "🏨" },
    articles: { label: "Guide & Articoli", icon: "📰" },
    organizations: { label: "Associazioni & Campus", icon: "🤝" },
    services: { label: "Servizi Utili", icon: "ℹ️" },
};

export function SwipeCarousel({
    onViewDetails,
    onBack,
    municipality,
    user,
    preferences,
    activeCountry: propCountry,
    currentLanguage,
    onNavigateToPreferences
}) {
    const { t, i18n } = useTranslation();
    const effectiveLang = currentLanguage || i18n.language || "it";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);

    // Detail view state
    const [selectedItem, setSelectedItem] = useState(null);

    // Initial preference state from props or storage
    const [profileVector, setProfileVector] = useState(() => {
        if (preferences) return preferences;
        try {
            const raw = localStorage.getItem("cultural_guide_preferences");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const [hasProfileVector, setHasProfileVector] = useState(() => {
        if (preferences) return true;
        return !!localStorage.getItem("cultural_guide_preferences");
    });

    // Toggle filter state
    const [showAllCategories, setShowAllCategories] = useState(false);

    // Active destination and country
    const activeCountry =
        propCountry ||
        (profileVector && profileVector.country) ||
        localStorage.getItem("cultural_guide_country") ||
        "CH";

    const isItalian = activeCountry === "IT";

    // Country Theme styles: Bordeaux Red for CH vs Emerald Green for IT
    const themeBgBtn = isItalian
        ? "bg-gradient-to-r from-emerald-700 to-green-800 hover:from-emerald-800 hover:to-green-900"
        : "bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-900 hover:to-rose-950";
    const themeBadgeClass = isItalian
        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80"
        : "bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/80";
    const themeHighlightText = isItalian ? "text-emerald-700 dark:text-emerald-400" : "text-red-800 dark:text-red-400";

    const displayCity =
        (profileVector && profileVector.municipality) ||
        municipality ||
        localStorage.getItem("cultural_guide_city") ||
        (isItalian ? "Camerino" : "Olten");

    // Coordinates for MapView
    const defaultLat = isItalian ? 43.1364 : 47.3522;
    const defaultLng = isItalian ? 13.0683 : 7.9077;
    const [centerLatitude, setCenterLatitude] = useState(defaultLat);
    const [centerLongitude, setCenterLongitude] = useState(defaultLng);
    const [markers, setMarkers] = useState([]);

    // Fetched POIs
    const [fetchedCardList, setFetchedCardList] = useState([]);

    // Multi-card horizontal slider settings with centerMode and overlapping arrows
    const settings = {
        dots: true,
        infinite: fetchedCardList.length > 2,
        speed: 400,
        slidesToShow: 3,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: '0px',
        nextArrow: <NextArrow isItalian={isItalian} />,
        prevArrow: <PrevArrow isItalian={isItalian} />,
        beforeChange: (_current, next) => setCurrentSlide(next),
        responsive: [
            {
                breakpoint: 1100,
                settings: {
                    slidesToShow: 2,
                    centerMode: true,
                    centerPadding: '0px',
                },
            },
            {
                breakpoint: 700,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                    centerPadding: '20px',
                },
            },
        ],
    };

    // Refresh profile vector from backend if needed
    useEffect(() => {
        if (!user) return;
        const checkUserProfileVector = async () => {
            try {
                const userId = user.id || user.email;
                const response = await fetch(
                    `http://localhost:5203/api/eppoiapi/profile-vector/${encodeURIComponent(userId)}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data && (data.selectedCategories || data.municipality)) {
                        setProfileVector(data);
                        setHasProfileVector(true);
                        localStorage.setItem("cultural_guide_preferences", JSON.stringify(data));
                    }
                }
            } catch (err) {
                console.warn("Preferences sync check note:", err);
            }
        };
        checkUserProfileVector();
    }, [user]);

    // Fetch POIs
    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            setError("");

            try {
                const municipalityToUse = displayCity
                    .replace(/^Com[m]?une\s+(di|de)\s+/i, '')
                    .replace(/^Gemeinde\s+/i, '')
                    .replace(/\s*\([A-Z]{2}\)$/, '')
                    .trim() || displayCity;

                let categoriesToFetch;
                if (showAllCategories) {
                    categoriesToFetch = ALL_CATEGORIES;
                } else if (profileVector && profileVector.selectedCategories && profileVector.selectedCategories.length > 0) {
                    categoriesToFetch = profileVector.selectedCategories;
                } else {
                    categoriesToFetch = ["artculture", "nature", "eatanddrink", "typicalproducts"];
                }

                const filteredEndpoints = mapCategoriesToEndpoints(categoriesToFetch);
                const filteredEndpointNames = filteredEndpoints.map(fn => fn.name);

                const servicesConfig = [
                    { fn: fetchEatAndDrinks },
                    { fn: fetchEntertainmentLeisure },
                    { fn: fetchArtAndCulture },
                    { fn: fetchArticlesAndMagazines },
                    { fn: fetchOrganizations },
                    { fn: fetchRoutes },
                    { fn: fetchShopping },
                    { fn: fetchEconomicOperators },
                    { fn: fetchEvents },
                    { fn: fetchItineraries },
                    { fn: fetchNature },
                    { fn: fetchPointsOfSale },
                    { fn: fetchRecreationAndFun },
                    { fn: fetchServices },
                    { fn: fetchSleep },
                    { fn: fetchTypicalProducts },
                ];

                const rawResults = await Promise.all(
                    servicesConfig.map(async (serviceEntry) => {
                        const fn = serviceEntry.fn;
                        const serviceName = fn?.name ?? 'unknown';

                        try {
                            if (!fn) return { service: serviceName, data: [] };

                            if (filteredEndpointNames.includes(serviceName)) {
                                const data = fn.length >= 2
                                    ? await fn(municipalityToUse, effectiveLang)
                                    : await fn(municipalityToUse);
                                return { service: serviceName, data: data || [] };
                            }
                            return { service: serviceName, data: [] };
                        } catch (err) {
                            console.error(`Error in ${serviceName}:`, err);
                            return { service: serviceName, data: [] };
                        }
                    })
                );

                const normalizeItem = (item, source, index) => ({
                    id: item.id ?? item.entityId ?? item._id ?? `${source}_${index}`,
                    title: item.title ?? item.entityName ?? item.name ?? item.nome ?? "Punto Culturale",
                    description: item.description ?? item.descr ?? item.badgeText ?? null,
                    location: item.location ?? item.address ?? item.vicinity ?? displayCity,
                    image: item.image ?? item.imagePath ?? item.imageUrl ?? null,
                    type: item.type ?? item.category ?? source.replace(/^fetch/, '').toLowerCase(),
                    openingHours: item.openingHours ?? item.hours ?? (isItalian ? "Aperto tutti i giorni" : "Täglich geöffnet"),
                    _raw: item,
                });

                const combined = rawResults.flatMap(({ service, data }) => {
                    const arr = Array.isArray(data) ? data : (data?.items ?? data?.locations ?? []);
                    if (!Array.isArray(arr)) return [];
                    return arr.map((item, index) => normalizeItem(item, service, index));
                });

                setFetchedCardList(combined);

            } catch (err) {
                console.error("Error loading POI data:", err);
                setError(err.message || "Errore nel caricamento delle raccomandazioni");
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [showAllCategories, displayCity, effectiveLang, profileVector, isItalian]);

    // Fetch Map markers
    useEffect(() => {
        if (!displayCity) return;
        const loadMarkersOnMap = async () => {
            try {
                const data = await fetchMap(displayCity);
                if (data?.locations && data.locations.length > 0) {
                    setMarkers(data.locations);
                }
                if (data?.center?.latitude != null && data?.center?.longitude != null) {
                    setCenterLatitude(data.center.latitude);
                    setCenterLongitude(data.center.longitude);
                }
            } catch (err) {
                console.warn("Map marker fetch note:", err);
            }
        };
        loadMarkersOnMap();
    }, [displayCity]);

    const onTogglePreferences = () => {
        setShowAllCategories((prev) => !prev);
    };

    const handleViewDetails = (poi) => {
        if (onViewDetails) {
            onViewDetails(poi);
        } else {
            setSelectedItem(poi);
        }
    };

    // Dates summary
    let datesSummary = null;
    if (profileVector && profileVector.startTime && profileVector.endTime) {
        try {
            const s = new Date(profileVector.startTime);
            const e = new Date(profileVector.endTime);
            const sFormatted = formatDate(s, formatDate.locale);
            const eFormatted = formatDate(e, formatDate.locale);
            datesSummary = `${sFormatted} (${s.getHours()}:00) → ${eFormatted} (${e.getHours()}:00)`;
        } catch {
            datesSummary = null;
        }
    }

    const selectedCatKeys = (profileVector && profileVector.selectedCategories) || [];
    const categoriesList = selectedCatKeys.map(key => ({
        id: key,
        label: CATEGORY_META[key]?.label || key,
        icon: CATEGORY_META[key]?.icon || "🏷️"
    }));

    // If user has no preferences yet
    if (hasProfileVector === false && !preferences) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs ${themeBadgeClass}`}>
                        <Compass className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('profile_onboarding_title', 'Imposta il tuo Profilo')}</h2>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        {t('profile_onboarding_subtitle', 'Definisci i tuoi interessi e le date del soggiorno per scoprire le migliori raccomandazioni.')}
                    </p>
                    <button
                        onClick={onNavigateToPreferences}
                        className={`w-full py-3.5 px-6 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${themeBgBtn}`}
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>{t('dashboard_card1_btn', 'Compila Profilo & Preferenze')}</span>
                    </button>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mt-4 text-xs font-semibold text-gray-500 hover:text-gray-700 underline"
                        >
                            {t('carousel_back_dashboard', 'Torna alla Dashboard')}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-6 overflow-x-hidden">
            {/* Detail View Modal */}
            {selectedItem && (
                <SwipeCarouselDetail
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            <div className={`transition-all duration-300 ${selectedItem ? 'blur-sm grayscale opacity-50 pointer-events-none' : ''}`}>

                {/* TOP BAR: Back button & Status Pill */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 mb-6">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-gray-900/95 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl border border-gray-200/90 dark:border-gray-700 shadow-xs hover:shadow-sm transition-all"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span>{t('carousel_back_dashboard', 'Torna alla Dashboard')}</span>
                        </button>
                    )}

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                        <Sparkles className={`w-3.5 h-3.5 ${themeHighlightText}`} />
                        <span>
                            {fetchedCardList.length > 0
                                ? `${fetchedCardList.length} ${t('carousel_recs_count', 'Punti di Interesse Consigliati')}`
                                : t('loadingSpinner_loading', 'Ricerca punti di interesse...')}
                        </span>
                    </div>
                </div>

                {/* PANORAMICA DELLE PREFERENZE (Clean, Elegant, Country-Themed) */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
                    <div className="relative overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-3 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs border ${themeBadgeClass}`}>
                                        <span>{isItalian ? "🇮🇹 Italia • Partner ESN Camerino" : "🇨🇭 Svizzera • Partner ESN Olten"}</span>
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-400 font-medium">• {t('carousel_active_prefs', 'Le tue preferenze attive')}</span>
                                </div>

                                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {t('carousel_recs_for', 'Raccomandazioni per')} <span className={themeHighlightText}>{displayCity}</span>
                                </h1>

                                {/* Summary Chips */}
                                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                    <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700 px-3 py-1.5 rounded-xl text-gray-700 dark:text-gray-300 font-medium">
                                        <MapPin className={`w-3.5 h-3.5 ${themeHighlightText} flex-shrink-0`} />
                                        <span className="font-semibold text-gray-900 dark:text-white">{displayCity}</span>
                                    </div>

                                    {datesSummary && (
                                        <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700 px-3 py-1.5 rounded-xl text-gray-700 dark:text-gray-300 font-medium">
                                            <Calendar className={`w-3.5 h-3.5 ${themeHighlightText} flex-shrink-0`} />
                                            <span>{datesSummary}</span>
                                        </div>
                                    )}

                                    <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700 px-3 py-1.5 rounded-xl text-gray-700 dark:text-gray-300 font-medium">
                                        <Globe className={`w-3.5 h-3.5 ${themeHighlightText} flex-shrink-0`} />
                                        <span>Lingua: <strong className="uppercase">{effectiveLang}</strong></span>
                                    </div>
                                </div>

                                {/* Category Tags */}
                                {categoriesList.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        <span className="text-xs font-semibold text-gray-400 mr-1">{t('profile_categories_title', 'Interessi')}:</span>
                                        {categoriesList.map(cat => (
                                            <span
                                                key={cat.id}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border shadow-2xs ${themeBadgeClass}`}
                                            >
                                                <span>{cat.icon}</span>
                                                <span>{cat.label}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions: Modifica Preferenze & Category Filter Toggle */}
                            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={onNavigateToPreferences}
                                    className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-white font-bold text-xs rounded-2xl shadow-md transition-all duration-200 active:scale-95 ${themeBgBtn}`}
                                    title="Modifica il tuo profilo, date e categorie"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    <span>{t('carousel_edit_prefs', 'Modifica Preferenze')}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={onTogglePreferences}
                                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                                        showAllCategories
                                            ? "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                    }`}
                                >
                                    <Filter className="w-3.5 h-3.5 text-gray-500" />
                                    <span>{showAllCategories ? t('carousel_filter_all', 'Tutte le Categorie (Attivo)') : t('carousel_filter_mine', 'Solo i Miei Interessi')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LOADING STATE */}
                {loading && (
                    <div className="py-24 text-center">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-sm font-semibold text-gray-600">
                            {t('loadingSpinner_loading', 'Caricamento raccomandazioni culturali...')}
                        </p>
                    </div>
                )}

                {/* ERROR STATE */}
                {error && !loading && (
                    <div className="max-w-3xl mx-auto px-4 my-6">
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                            <p className="text-red-700 text-sm font-semibold">{error}</p>
                        </div>
                    </div>
                )}

                {/* ============================================================== */}
                {/* 🎠 MULTI-CARD CAROUSEL (FULL HORIZONTAL WIDTH & OPACITY EFFECT) */}
                {/* ============================================================== */}
                {!loading && !error && fetchedCardList.length > 0 && (
                    <div className="w-full relative mb-14">
                        {/* Section Header */}
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between mb-2">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">
                                    {t('carousel_cards_title', 'Card Consigliate')}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {t('carousel_cards_subtitle', 'Scorri le card o usa le frecce per esplorare i dettagli')}
                                </p>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${themeBadgeClass}`}>
                                {currentSlide + 1} / {fetchedCardList.length}
                            </span>
                        </div>

                        {/* Slider CSS with Multi-Card Opacity and Scale Effect */}
                        <style>
                            {`
                                .carousel-full-width .slick-list {
                                    overflow: hidden;
                                    padding: 24px 0 !important;
                                }
                                .carousel-full-width .slick-track {
                                    display: flex !important;
                                    align-items: center !important;
                                }
                                .carousel-full-width .slick-slide {
                                    padding: 0 14px;
                                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                                    opacity: 0.35;
                                    transform: scale(0.88);
                                    filter: blur(0.3px);
                                }
                                .carousel-full-width .slick-slide.slick-center,
                                .carousel-full-width .slick-slide.slick-current {
                                    opacity: 1 !important;
                                    transform: scale(1.02) !important;
                                    filter: none !important;
                                    z-index: 20;
                                }
                                .carousel-full-width .slick-slide > div {
                                    width: 100% !important;
                                    display: flex !important;
                                    justify-content: center !important;
                                    height: 100% !important;
                                }
                                .carousel-full-width .slick-dots {
                                    bottom: -28px;
                                }
                                .carousel-full-width .slick-dots li button:before {
                                    font-size: 8px;
                                    color: ${isItalian ? '#047857' : '#991b1b'};
                                    opacity: 0.3;
                                }
                                .carousel-full-width .slick-dots li.slick-active button:before {
                                    color: ${isItalian ? '#065f46' : '#7f1d1d'};
                                    opacity: 1;
                                }
                            `}
                        </style>

                        {/* Full Width Slider Container */}
                        <div className="w-full relative px-2 sm:px-4 md:px-8 carousel-full-width">
                            <Slider {...settings}>
                                {fetchedCardList.map((fetchedCard) => (
                                    <div key={fetchedCard.id} className="p-2 w-full flex justify-center outline-none">
                                        <div
                                            className={`bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col justify-between group ${
                                                isItalian ? "hover:border-emerald-500 dark:hover:border-emerald-500" : "hover:border-red-600 dark:hover:border-red-600"
                                            }`}
                                            style={{ width: '100%', maxWidth: '420px', minHeight: '520px' }}
                                        >
                                            <div>
                                                {/* Card Image Header */}
                                                <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-100 dark:bg-gray-800">
                                                    <img
                                                        alt={fetchedCard.title}
                                                        src={fetchedCard.image}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        onError={(e) => {
                                                             handleImageFallback(e, fetchedCard.title, displayCity, isItalian ? "IT" : "CH");
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                                                    <div className="absolute top-3.5 right-3.5 bg-white/95 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-white/60 dark:border-gray-700">
                                                        <span className={`font-bold capitalize text-xs tracking-wide ${themeHighlightText}`}>
                                                            {CATEGORY_META[fetchedCard.type]?.label || fetchedCard.type}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Card Body */}
                                                <div className="p-6">
                                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug">
                                                        {fetchedCard.title}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                                                        {fetchedCard.description || "Nessuna descrizione disponibile per questo punto di interesse."}
                                                    </p>

                                                    <div className="space-y-2 pt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
                                                        {fetchedCard.location && (
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className={`w-4 h-4 flex-shrink-0 ${themeHighlightText}`} />
                                                                <span className="truncate">{fetchedCard.location}</span>
                                                            </div>
                                                        )}
                                                        {fetchedCard.openingHours && (
                                                            <div className="flex items-center gap-2">
                                                                <Clock className={`w-4 h-4 flex-shrink-0 ${themeHighlightText}`} />
                                                                <span>{fetchedCard.openingHours}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="p-6 pt-0">
                                                <button
                                                    type="button"
                                                    className={`w-full text-white py-3 px-4 rounded-2xl transition-all font-bold text-sm shadow-md active:scale-98 flex items-center justify-center gap-2 ${themeBgBtn}`}
                                                    onClick={() => handleViewDetails(fetchedCard)}
                                                >
                                                    <span>{t('carousel_view_details', 'Scopri Dettagli')}</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && !error && fetchedCardList.length === 0 && (
                    <div className="max-w-2xl mx-auto text-center py-20 bg-white/70 rounded-3xl border border-dashed border-gray-200 my-8 px-4">
                        <Tag className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-800">Nessuna raccomandazione trovata</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                            Non abbiamo trovato card per i criteri attuali a {displayCity}. Prova ad ampliare le categorie.
                        </p>
                        <button
                            type="button"
                            onClick={onTogglePreferences}
                            className={`px-4 py-2 font-bold text-xs rounded-xl transition ${themeBadgeClass}`}
                        >
                            {t('carousel_filter_all', 'Mostra tutte le categorie')}
                        </button>
                    </div>
                )}

                {/* ============================================================== */}
                {/* 🗺️ MAPPA INTERATTIVA (CON CARD NON TAGLIATA E CHIUDIBILE) */}
                {/* ============================================================== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-6 md:p-8 shadow-xl rounded-3xl border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>🗺️ {t('carousel_interactive_map', 'Mappa Interattiva')}</span>
                                    <span className="text-gray-400 dark:text-gray-400 font-normal text-sm">• {displayCity}</span>
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('carousel_map_subtitle', 'Esplora visivamente i beni culturali e i punti di interesse sul territorio')}
                                </p>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${themeBadgeClass}`}>
                                {markers.length > 0 ? `${markers.length} POI mappati` : 'Caricamento punti mappa...'}
                            </span>
                        </div>

                        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                            <MapView
                                locations={markers}
                                center={{ latitude: centerLatitude, longitude: centerLongitude }}
                                zoom={13}
                                height="520px"
                                activeCountry={activeCountry}
                                onLocationClick={(loc) => {
                                    console.log("Location clicked on map:", loc);
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default SwipeCarousel;