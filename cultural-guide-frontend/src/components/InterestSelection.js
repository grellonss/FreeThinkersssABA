import React, { useState, useEffect } from "react";
import defaultImage from '../images/ImageWithFallback.jpg';
import { formatDate } from '../utils/formatDate';
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "./ui_components/Loading";
import { ChevronLeft, MapPin, Search, ArrowRight } from "lucide-react";
import { toast } from 'sonner';

export function InterestSelection({ user, onBack }) {
    const { t, i18n } = useTranslation();

    // Step management
    const [currentStep, setCurrentStep] = useState(1); // 1: Time, 2: City, 3: Interests

    // Time availability state
    const [startSelection, setStartSelection] = useState({ date: null, hour: null });
    const [endSelection, setEndSelection] = useState({ date: null, hour: null });
    const [activeCalendar, setActiveCalendar] = useState('start');
    const [currentMonth] = useState(new Date());

    // City selection state
    const [searchTerm, setSearchTerm] = useState("");
    const [municipalities, setMunicipalities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Interest selection state
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingProfileVector, setLoadingProfileVector] = useState(false);
    const [error, setError] = useState("");

    // ========================================
    // STEP 1: TIME AVAILABILITY LOGIC
    // ========================================
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
        return days;
    };

    const selectDate = (date) => {
        activeCalendar === 'start'
            ? setStartSelection({ ...startSelection, date })
            : setEndSelection({ ...endSelection, date });
    };

    const selectHour = (hour) => {
        activeCalendar === 'start'
            ? setStartSelection({ ...startSelection, hour })
            : setEndSelection({ ...endSelection, hour });
    };

    const handleTimeComplete = () => {
        if (!startSelection.date || startSelection.hour === null ||
            !endSelection.date || endSelection.hour === null) {
            toast.error(t('timeAvailability_errorSelectBoth'));
            return;
        }

        const start = new Date(startSelection.date);
        start.setHours(startSelection.hour, 0, 0, 0);

        const end = new Date(endSelection.date);
        end.setHours(endSelection.hour, 0, 0, 0);

        if (end <= start) {
            toast.error(t('timeAvailability_errorEndBeforeStart'));
            return;
        }

        // Move to city selection
        setCurrentStep(2);
    };

    // ========================================
    // STEP 2: CITY SELECTION LOGIC
    // ========================================
    useEffect(() => {
        if (currentStep === 2) {
            const fetchMunicipalities = async () => {
                setLoading(true);
                setError("");

                try {
                    const response = await fetch("http://localhost:5203/api/eppoiapi/municipalities", {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    });

                    if (!response.ok) {
                        setError(`Error fetching municipalities: ${response.status}`);
                        return;
                    }

                    const data = await response.json().catch(() => []);
                    setMunicipalities(data);

                } catch (err) {
                    console.error(err);
                    setError("Network error while fetching municipalities");
                } finally {
                    setLoading(false);
                }
            };
            fetchMunicipalities();
        }
    }, [currentStep]);

    const filteredCities = municipalities.filter((m) =>
        (m.legalName ?? "").toLowerCase().includes((searchTerm ?? "").toLowerCase())
    );

    const handleMunicipalityClick = (municipalityName) => {
        setSelectedCity(municipalityName);
        setSearchTerm(municipalityName);
        setIsDropdownOpen(false);
    };

    const handleCityComplete = () => {
        if (!selectedCity) {
            toast.error(t('citySelection_pleaseSelectCity'));
            return;
        }
        // Move to interest selection
        setCurrentStep(3);
    };

    // ========================================
    // STEP 3: INTEREST SELECTION LOGIC
    // ========================================
    useEffect(() => {
        if (currentStep === 3 && selectedCity) {
            const fetchCategories = async () => {
                setLoading(true);
                setError("");

                try {
                    // ------------- Fetch categories based on selected city -------------
                    // Trim first 10 characters from selectedCity ("Commune di ")
                    let selectedCityTrim = selectedCity.substring(10, selectedCity.length);
                    const res = await fetch(
                        `http://localhost:5203/api/eppoiapi/categories?municipality=${encodeURIComponent(
                            selectedCityTrim
                        )}&language=${i18n.language}`
                    );
                    
                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status}`);
                    }

                    const data = await res.json();

                    setInterests(data.map(cat => ({
                        id: cat.category.toLowerCase(),
                        title: cat.label,
                        image: cat.imagePath
                            ? `http://localhost:5203/api/eppoiapi/proxy-image?imageUrl=${encodeURIComponent(cat.imagePath)}`
                            : defaultImage,
                        selected: false
                    })));
                } catch (err) {
                    console.error("Failed to load categories", err);
                    setError("Failed to load interests");
                } finally {
                    setLoading(false);
                }
            };

            fetchCategories();
        }
    }, [currentStep, selectedCity, i18n.language]);

    const toggleInterest = (id) => {
        setInterests((prev) =>
            prev.map((interest) =>
                interest.id === id ? { ...interest, selected: !interest.selected } : interest
            )
        );
    };

    // -------
    // SAVES THE PROFILE VECTOR
    // -------
    const handleInterestComplete = async () => {
        const selectedIds = interests.filter(i => i.selected).map(i => i.id);
        if (selectedIds.length === 0) {
            toast.error(t("interestSelection_selectAtLeastOne"));
            return;
        }

        // Prepare data for backend with hours 0 0 0
        const start = new Date(startSelection.date);
        start.setHours(startSelection.hour, 0, 0, 0);

        const end = new Date(endSelection.date);
        end.setHours(endSelection.hour, 0, 0, 0);

        const preferenceData = {
            userId: user.email,
            municipality: selectedCity,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            selectedCategories: selectedIds
        };

        console.log("Saving preferences from data retrieved:", preferenceData);

        try {
            setLoadingProfileVector(true);

            const response = await fetch("http://localhost:5203/api/eppoiapi/save-profile-vector", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(preferenceData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log("Preferences saved successfully:", result);

            toast.success(t("interestSelection_profileVectorSavedSuccessfully"));

            // Go back to start after successful save
            onBack();

        } catch (err) {
            console.error("Failed to save preferences:", err);
            toast.error(t("interestSelection_profileVectorError"));
        } finally {
            setLoading(false);
        }
    };
    
    const handleBack = () => {
        if (currentStep === 1) {
            onBack(); // Go back to Start component
        } else {
            setCurrentStep(currentStep - 1); // Go to previous step
        }
    };

    // ========================================
    // RENDER HELPERS
    // ========================================
    const days = getDaysInMonth(currentMonth);
    const currentSelection = activeCalendar === 'start' ? startSelection : endSelection;
    const isTimeComplete = startSelection.date && startSelection.hour !== null &&
        endSelection.date && endSelection.hour !== null;
    const selectedCount = interests.filter(i => i.selected).length;

 
    // Map i18n language to locale
    const localeMap = {
        de: 'de-DE',
        en: 'en-GB',
        it: 'it-IT',
    };


    // ========================================
    // STEP RENDERING
    // ========================================
    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                >
                    <ChevronLeft className="w-5 h-5" />
                    {t('interestSelection_goBack')}
                </button>

                {/* Progress Indicator */}
                <div className="mb-6 flex items-center justify-center gap-2">
                    {[1, 2, 3].map((step) => (
                        <div
                            key={step}
                            className={`h-2 rounded-full transition-all ${
                                step === currentStep
                                    ? 'w-12 bg-indigo-600'
                                    : step < currentStep
                                        ? 'w-8 bg-indigo-400'
                                        : 'w-8 bg-gray-300'
                            }`}
                        />
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    {/* STEP 1: TIME AVAILABILITY */}
                    {currentStep === 1 && (
                        <>
                            <h1 className="text-2xl font-bold mb-2">{t('timeAvailability_title')}</h1>
                            <p className="text-gray-600 mb-6">{t('timeAvailability_subtitle')}</p>

                            {/* Start / End Selector */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {['start', 'end'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setActiveCalendar(type)}
                                        className={`p-4 rounded-xl border-2 ${
                                            activeCalendar === type
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-gray-200'
                                        }`}
                                    >
                                        <p className="font-medium">
                                            {type === 'start'
                                                ? t('timeAvailability_from')
                                                : t('timeAvailability_to')}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {/* Calendar */}
                            <div className="grid grid-cols-7 gap-2 mb-6">
                                {t('timeAvailability_days', { returnObjects: true }).map(day => (
                                    <div key={day} className="text-center text-sm text-gray-500">{day}</div>
                                ))}
                                {days.map((day, i) =>
                                    day ? (
                                        <button
                                            key={i}
                                            onClick={() => selectDate(day)}
                                            className={`p-2 rounded-lg ${
                                                currentSelection.date?.toDateString() === day.toDateString()
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'hover:bg-gray-200'
                                            }`}
                                        >
                                            {day.getDate()}
                                        </button>
                                    ) : <div key={i} />
                                )}
                            </div>

                            {/* Hours */}
                            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 mb-6">
                                {hours.map(hour => (
                                    <button
                                        key={hour}
                                        onClick={() => selectHour(hour)}
                                        disabled={!currentSelection.date}
                                        className={`p-2 rounded-lg border text-[9px] sm:text-sm ${
                                            currentSelection.hour === hour
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-gray-200 disabled:opacity-50'
                                        }`}
                                    >
                                        {hour.toString().padStart(2, '0')}:00
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleTimeComplete}
                                disabled={!isTimeComplete}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
                            >
                                {t('timeAvailability_continue')}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* STEP 2: CITY SELECTION */}
                    {currentStep === 2 && (
                        <>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                                    <MapPin className="w-8 h-8 text-indigo-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("citySelection_chooseCity")}</h1>
                                <p className="text-gray-600">{t("citySelection_searchACitySubtitle")}</p>
                            </div>

                            {/* Search Bar */}
                            <div className="mb-6">
                                <label htmlFor="city-search" className="block text-gray-700 mb-2 font-medium">
                                    {t("citySelection_searchACityTitle")}
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="city-search"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setIsDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        placeholder={t("citySelection_Lens")}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Dropdown Results */}
                                {isDropdownOpen && searchTerm && (
                                    <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredCities.length > 0 ? (
                                            filteredCities.map((municipality) => (
                                                <button
                                                    key={municipality.legalName}
                                                    onClick={() => handleMunicipalityClick(municipality.legalName)}
                                                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center gap-3"
                                                >
                                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                                    <span className="text-gray-900">{municipality.legalName}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-gray-500">
                                                {t("citySelection_noCitiesFound")}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Menu */}
                            <div className="mb-8">
                                <label htmlFor="city-dropdown" className="block text-gray-700 mb-2 font-medium">
                                    {t("citySelection_selectFromList")}
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                                    <select
                                        id="city-dropdown"
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer text-gray-900"
                                    >
                                        <option value="" disabled hidden className="text-gray-400">
                                            {t("citySelection_dropDownMenu")}
                                        </option>
                                        {municipalities.map((m) => (
                                            <option key={m.legalName} value={m.legalName}>
                                                {m.legalName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Selected City Display */}
                            {selectedCity && (
                                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-6 h-6 text-indigo-600" />
                                        <div>
                                            <p className="text-gray-600">{t("citySelection_selectCity")}</p>
                                            <p className="font-semibold text-indigo-900">{selectedCity}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading && (
                                <div className="flex justify-center py-4">
                                    <LoadingSpinner size="lg" />
                                </div>
                            )}

                            <button
                                onClick={handleCityComplete}
                                disabled={!selectedCity}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                            >
                                {t("citySelection_Continue")}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* STEP 3: INTEREST SELECTION */}
                    {currentStep === 3 && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                    {t("interestSelection_greetings")}, {user.name}!
                                </h1>
                                <p className="text-gray-600 mb-4 text-lg">
                                    {t("interestSelection_subtitle")}
                                </p>
                                <div
                                    className="inline-flex items-center bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm mb-6">
                                    {
                                        t("interestSelection_timeAvailability", {
                                            startDate: formatDate(startSelection.date, formatDate.locale),
                                            startHour: `${startSelection.hour}:00`,
                                            endDate: formatDate(endSelection.date, formatDate.locale), 
                                            endHour: `${endSelection.hour}:00`
                                        })
                                    }
                                </div>
                                <br/>
                                <div className="inline-flex items-center bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm mb-6">
                                    {t("interestSelection_destination")} {selectedCity}
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                                    {t("interestSelection_selectionQuestion")}
                                </h2>
                            </div>

                            {loading && (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner size="lg" />
                                </div>
                            )}

                            {error && <p className="text-red-500 mb-4">{error}</p>}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {interests.map(interest => (
                                    <div
                                        key={interest.id}
                                        onClick={() => toggleInterest(interest.id)}
                                        className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                                            interest.selected
                                                ? "border-indigo-600 bg-indigo-50"
                                                : "border-gray-200 bg-white"
                                        }`}
                                    >
                                        <img
                                            src={interest.image}
                                            alt={interest.title}
                                            className="h-32 w-full object-contain mb-3"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = defaultImage;
                                            }}
                                        />
                                        <h3 className="text-lg font-semibold text-center">
                                            {interest.title}
                                        </h3>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                <p className={`font-medium ${selectedCount > 0 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    {selectedCount > 0
                                        ? `${selectedCount} ${t("interestSelection_selected")}`
                                        : t("interestSelection_selectAtLeastOne")}
                                </p>
                                <button
                                    onClick={handleInterestComplete}
                                    disabled={selectedCount === 0}
                                    className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {t("interestSelection_continue")}
                                    <ArrowRight className="w-5 h-5" />
                                    {loadingProfileVector && (
                                        <div className="flex justify-center py-4">
                                            <LoadingSpinner size="sm" />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}