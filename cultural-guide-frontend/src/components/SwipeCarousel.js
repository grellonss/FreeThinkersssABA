import React, { useEffect, useState } from "react";
import { SwipeCarouselDetail } from "./SwipeCarouselDetail";
import { MapView } from "./ui_components/MapView";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight, MapPin, Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import defaultImage from '../images/ImageWithFallback.jpg';
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

// ... (NextArrow and PrevArrow components stay the same)
const NextArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-110 border-2 border-gray-200 hover:border-indigo-600"
    >
        <ChevronRight className="w-6 h-6 text-gray-700" />
    </button>
);
const PrevArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-110 border-2 border-gray-200 hover:border-indigo-600"
    >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
    </button>
);


export function SwipeCarousel({ onViewDetails, onBack, municipality, user, onNavigateToPreferences }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const { t, i18n } = useTranslation();

    // Detail view state
    const [selectedItem, setSelectedItem] = useState(null);

    // City selection state
    const [selectedCity, setSelectedCity] = useState("");

    // Time availability state
    const [startSelection, setStartSelection] = useState({ date: null, hour: null });
    const [endSelection, setEndSelection] = useState({ date: null, hour: null });

    // Preference state
    const [hasProfileVector, setHasProfileVector] = useState(null);
    const [profileVector, setProfileVector] = useState(null);
    
    // Remove filter state
    const [showAllCategories, setShowAllCategories] = useState(false);

    // Locations for MapView
    const [centerLatitude, setCenterLatitude] = useState();
    const [centerLongitude, setCenterLongitude] = useState();
    
    const [markers, setMarkers] = useState([]);
    
    // Fetched data states after applying profile vector
    const [fetchedCardList, setFetchedCardList] = useState([]);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: '80px',
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        beforeChange: (_current, next) => setCurrentSlide(next),
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    centerPadding: '20px',
                    arrows: false,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    centerPadding: '10px',
                    arrows: false,
                },
            },
        ],
    };

    // -----------------------------
    // Check if user has preferences
    // -----------------------------
    useEffect(() => {
        if (!user) {
            setHasProfileVector(false);
            return;
        }

        const checkUserProfileVector = async () => {
            setLoading(true);
            setError("");

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
                    const profileVector = await response.json();
                    setProfileVector(profileVector);
                    setHasProfileVector(true);

                    console.log("User preferences found:", profileVector);
                } else if (response.status === 404) {
                    // No preferences found yet for this user
                    setHasProfileVector(false);
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (err) {
                toast.error("Error checking preferences:", err);
                setError("Failed to check user profile vector.");
                setHasProfileVector(false);
            } finally {
                setLoading(false);
            }
        };

        checkUserProfileVector();
    }, [user]);

    // All available categories constant (move outside component or define at top)
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

    // -----------------------------
// Fetch data according to profile vector
// -----------------------------
    useEffect(() => {
        // Don't fetch if we haven't checked profileVector yet or if user has no profileVector
        if (hasProfileVector === null || !hasProfileVector || !profileVector) return;

        const loadAllData = async () => {
            setLoading(true);
            setError("");

            try {
                const language = i18n.language;
                const municipalityToUse = profileVector.municipality.substring(10) || municipality.substring(10);

                // Determine which categories to use - prioritize showAllCategories flag
                let categoriesToFetch;
                if (showAllCategories) {
                    categoriesToFetch = ALL_CATEGORIES;
                } else {
                    categoriesToFetch = profileVector.selectedCategories || [];
                }

                // Call service to identify which endpoints to call
                const filteredEndpoints = mapCategoriesToEndpoints(categoriesToFetch);
                const filteredEndpointNames = filteredEndpoints.map(fn => fn.name);

                // All possible services
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

                // Fetch all selected endpoints in parallel
                const rawResults = await Promise.all(
                    servicesConfig.map(async (serviceEntry) => {
                        const fn = typeof serviceEntry === 'function' ? serviceEntry : serviceEntry?.fn;
                        const serviceName = fn?.name ?? 'unknown';

                        try {
                            if (!fn) throw new Error('No fetch function provided');

                            // Check if this service should be called
                            if (filteredEndpointNames.includes(serviceName)) {
                                const data = fn.length >= 2
                                    ? await fn(municipalityToUse, language)
                                    : await fn(municipalityToUse);

                                console.log(`  ✓ ${serviceName}: ${data?.length || 0} items`);
                                return { service: serviceName, data };
                            } else {
                                return { service: serviceName, data: [] };
                            }
                        } catch (err) {
                            console.error(`  ✗ ${serviceName}:`, err?.message ?? err);
                            return { service: serviceName, data: [] };
                        }
                    })
                );

                // Normalize items
                const normalizeItem = (item, source, index) => {
                    return {
                        id: item.id ?? item._id ?? item.uuid ?? `${source}_${index}`,
                        title: item.title ?? item.name ?? item.nome ?? item.label ?? "N/A",
                        description: item.description ?? item.descr ?? item.summary ?? null,
                        location: item.location ?? item.address ?? item.vicinity ?? item.place ?? null,
                        image: item.image ?? item.imageUrl ?? item.thumbnail ?? null,
                        type: item.type ?? item.category ?? source,
                        openingHours: item.openingHours ?? item.opening_hours ?? item.hours ?? null,
                        _raw: item,
                    };
                };

                // Flatten and normalize
                const combined = rawResults.flatMap(({ service, data }) => {
                    const arr = Array.isArray(data) ? data : (data?.items ?? data?.locations ?? []);
                    if (!Array.isArray(arr)) return [];
                    return arr.map((item, index) => normalizeItem(item, service, index));
                });

                console.log(`📊 Total items fetched: ${combined.length}`);
                setFetchedCardList(combined);

            } catch (err) {
                setError(err.message);
                toast.error(t('swipeCarousel_errorLoadingData'));
            } finally {
                setLoading(false);
            }
        };

        loadAllData();

        // IMPORTANT: Only depend on showAllCategories, NOT on profileVector
        // This prevents re-fetching when profileVector changes
    }, [showAllCategories, hasProfileVector, municipality, i18n.language, t]);

    // -----------------------------
    // Handle Remove/Restore Preferences Toggle
    // -----------------------------
    const onTogglePreferences = () => {
        setShowAllCategories((prev) => {
            const newValue = !prev;
            console.log(`🔄 Toggling filters: ${newValue ? 'SHOW ALL' : 'USE FILTERS'}`);

            if (newValue) {
                toast.info(t('loading_all_categories') || 'Loading all categories...');
            } else {
                toast.info(t('applying_filters') || 'Applying your preferences...');
            }

            return newValue;
        });
    };

    // -----------------
    // Extract city and time availability from profile vector
    // -----------------
    useEffect(() => {
        if (!profileVector) {
            return;
        }

        // City
        if (profileVector.municipality) {
            setSelectedCity(profileVector.municipality);
        }

        // Time Availability - Parse ISO strings to { date, hour } format
        if (profileVector.startTime) {
            const startDate = new Date(profileVector.startTime);
            setStartSelection({
                date: startDate,
                hour: startDate.getHours()
            });
        }

        if (profileVector.endTime) {
            const endDate = new Date(profileVector.endTime);
            setEndSelection({
                date: endDate,
                hour: endDate.getHours()
            });
        }

    }, [profileVector]); // Add profileVector as dependency

    // -----------------------------
    // Prepare locations for MapView
    // -----------------------------
    useEffect(() => {
        if (!selectedCity) return;

        const loadMarkersOnMap = async () => {
            try {
                setLoading(true);
                const data = await fetchMap(selectedCity);
                setMarkers(data.locations);
                if (data.length > 0) {
                    setCenterLatitude(data.center.latitude);
                    setCenterLongitude(data.center.longitude);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadMarkersOnMap();
    }, [selectedCity]);
    
    // -----------------------------
    // wait for timeAvailability from ProfileVector Database fetch is ready
    // -----------------------------
    const isTimeAvailabilityReady =
        startSelection?.date &&
        startSelection?.hour !== null &&
        startSelection?.hour !== undefined &&
        endSelection?.date &&
        endSelection?.hour !== null &&
        endSelection?.hour !== undefined;

    const handleViewDetails = (poi) => {
        if (onViewDetails) {
            onViewDetails(poi);
        } else {
            setSelectedItem(poi);
            toast.success(`${t('swipeCarousel_detailsClicked')} ${poi.title}`);
        }
    };

    // -----------------------------
    // Show loading while checking preferences
    // -----------------------------
    if (hasProfileVector === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">{t('swipeCarousel_checkingPreferences')}</p>
                </div>
            </div>
        );
    }

    // -----------------------------
    // Show "Set Preferences" page if no preferences found
    // -----------------------------
    if (hasProfileVector === false) {
        return (
            <div className="min-h-screen p-4 md:p-8">
                <div className="max-w-2xl mx-auto">
                    {/* Back Button */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            {t('swipeCarousel_goBack')}
                        </button>
                    )}

                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
                            <Settings className="w-10 h-10 text-indigo-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {t('swipeCarousel_setPreferences')}
                        </h1>

                        <p className="text-gray-600 mb-8 text-lg">
                            {t('swipeCarousel_setPreferencesSubtitle')}
                        </p>

                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
                            <h3 className="font-semibold text-indigo-900 mb-2">
                                {t('swipeCarousel_preferencesInclude')}
                            </h3>
                            <ul className="text-left text-gray-700 space-y-2">
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                    {t('swipeCarousel_timeAvailability')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                    {t('swipeCarousel_destination')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                    {t('swipeCarousel_interests')}
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={onNavigateToPreferences}
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                        >
                            {t('swipeCarousel_setPreferencesButton')}
                        </button>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // -----------------------------
    // Show carousel if preferences exist
    // -----------------------------
    return (
        //added relative to contain arrows
        <div className="w-full py-8 px-4 overflow-hidden relative">
            {selectedItem && (
                <SwipeCarouselDetail
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
            <div className={`max-w-2xl mx-auto transition-all duration-500 ${selectedItem ? 'blur-sm grayscale opacity-50 pointer-events-none' : ''}`}>                
                <div className="w-full max-w-4xl">
                    {/* Back Button */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            {t('swipeCarousel_goBack')}
                        </button>
                    )}

                    {/* Preferences Info Banner */}
                    {profileVector && (
                        <div className="bg-white mb-6 p-4 shadow-xl rounded-3xl">
                            <div className="items-center justify-between ">
                                <div className="flex flex-col w-full gap-3 mb-4">
                                    {!isTimeAvailabilityReady && <LoadingSpinner size="sm" />}

                                    <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm">
                                        {isTimeAvailabilityReady && t("interestSelection_timeAvailability", {
                                            startDate: formatDate(startSelection.date, formatDate.locale),
                                            startHour: `${startSelection.hour.toString().padStart(2, '0')}:00 → `,
                                            endDate: formatDate(endSelection, formatDate.locale),
                                            endHour: `${endSelection.hour.toString().padStart(2, '0')}:00`
                                        })}
                                    </div>

                                    <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm">
                                        {t("interestSelection_destination")} {selectedCity}
                                    </div>

                                    <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm">
                                        🖊️&nbsp;
                                        <button
                                            onClick={onNavigateToPreferences}
                                            className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                                        >
                                            {t('swipeCarousel_editPreferences')}
                                        </button>
                                    </div>

                                    <div className="flex flex-row items-center bg-indigo-50 px-3 py-1 mt-2 rounded-full text-indigo-700 font-medium text-sm w-full md:w-5/12">
                                        <p>
                                            ❌ &nbsp;
                                            <button
                                                onClick={onTogglePreferences}
                                                className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                                            >
                                                {(t('swipeCarousel_resetPreferences'))}
                                            </button>
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm">
                                        🧮 {t("swipeCarousel_fetchedCardListLength")} {fetchedCardList.length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center py-20">
                            <LoadingSpinner size="lg" />
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Carousel */}
                    {!loading && !error && fetchedCardList.length > 0 && (
                        <>
                            <style>
                                {`
              /* Desktop styles */
              @media (min-width: 768px) {
                .slick-slider {
                  margin: 0 -80px;
                }
              }
              
              /* Mobile styles */
              @media (max-width: 767px) {
                .slick-slider {
                  margin: 0 -20px;
                }
                .slick-slide > div {
                  padding: 0 10px;
                }
              }
              
              /* CSS */
              .slick-dots {
                --dot-size: 10px;
                --dot-gap: 6px;
                white-space: nowrap;                 /* keep dots on one line */
                overflow: hidden;                   /* hide overflow beyond max-width */
                padding: 0;
                margin: 0 auto;
                box-sizing: content-box;
              }
              
              .slick-dots li button:before {
                font-size: 10px;
                color: #6366f1;
                white-space: nowrap;                 /* keep dots on one line */
                overflow: hidden;                   /* hide overflow beyond max-width */
                max-width: calc(16 * (var(--dot-size) + (var(--dot-gap) * 2))); /* show up to 16 dots */
                box-sizing: content-box;
              }
              
              /* active dot */
              .slick-dots li.slick-active button:before {
                color: #6366f1;
                white-space: nowrap;                 /* keep dots on one line */
                overflow: hidden;                   /* hide overflow beyond max-width */
                max-width: calc(16 * (var(--dot-size) + (var(--dot-gap) * 2))); /* show up to 16 dots */
                box-sizing: content-box;
                opacity: 1;
              }
              /* ensure list items don't wrap to new line */
              .slick-dots li {
                display: inline-block;
                float: none;
                vertical-align: middle;
              }
              
              /* make the button a fixed box for the dot and remove default inline :before text rendering */
              .slick-dots li button {
                display: inline-block;
                background: transparent;
                border: none;
                cursor: pointer;
              }
              .slick-slide {
                padding: 0 10px;
              }
              .slick-list {
                overflow: visible;
              }
            `}
                            </style>

                            <div className="max-w-2xl mx-auto">
                                <Slider {...settings}>
                                    {fetchedCardList.map((fetchedCard) => (
                                        <div key={fetchedCard.id} className="px-2">
                                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all border-2 border-transparent hover:border-indigo-600 max-w-sm md:max-w-none mx-auto">                                                
                                                <div className="relative h-48 sm:h-56 md:h-64 lg:h-80 overflow-hidden">
                                                    <img
                                                        alt={fetchedCard.title}
                                                        src={fetchedCard.image}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = defaultImage;
                                                        }}
                                                    />
                                                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-xl">
                                                        <span className="text-indigo-600 capitalize text-xs md:text-sm">{fetchedCard.type}</span>
                                                    </div>
                                                </div>

                                                <div className="p-4 md:p-6">
                                                    <h2 className="text-lg md:text-xl text-gray-900 mb-3 md:mb-4">{fetchedCard.title}</h2>
                                                    <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 line-clamp-3">
                                                        {fetchedCard.description}
                                                    </p>

                                                    <div className="space-y-2 mb-4 md:mb-6">
                                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                            <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                                            <span className="truncate">{fetchedCard.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                            <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                                            <span>{fetchedCard.openingHours}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-700 transition text-sm md:text-base"
                                                        onClick={() => handleViewDetails(fetchedCard)}
                                                    >
                                                        {t('swipeCarousel_viewDetails')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        </>
                    )}

                    {/* MapView for interactions on OSM map */}
                    <div className="bg-white mt-10 mb-6 p-4 shadow-xl rounded-3xl">
                        <MapView
                            locations={markers}
                            center={{ latitude: centerLatitude, longitude: centerLongitude }}
                            zoom={13}
                            height="700px"
                            onLocationClick={() => {
                                console.log("Location clicked: " + markers);
                            }}
                        />
                    </div>
                
                    {/* Empty State */}
                    {!loading && !error && fetchedCardList.length === 0 && (
                        <div className="text-center py-20 text-gray-600">
                            <p>{t('no_results') || 'No results found for your preferences'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SwipeCarousel;