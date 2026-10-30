import React, { useState, useEffect } from "react";
import {
    User,
    MapPin,
    Calendar,
    Clock,
    Sparkles,
    Check,
    Search,
    ArrowLeft,
    ArrowRight,
    Compass
} from "lucide-react";
import { toast } from "sonner";
import { CulturalGuideLogo } from "./CulturalGuideLogo";
import { useTranslation } from "react-i18next";

// Curated Category Definitions
const CATEGORY_ITEMS = [
    {
        id: "artculture",
        title: "Arte, Musei e Monumenti",
        desc: "Castelli, palazzi ducali, musei civici e patrimonio storico",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
        badge: "Cultura & Storia"
    },
    {
        id: "nature",
        title: "Natura, Laghi e Vette",
        desc: "Parchi naturali, vette panoramiche, fiumi e riserve",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",
        badge: "Parchi & Laghi"
    },
    {
        id: "eatanddrink",
        title: "Gastronomia & Ristorazione",
        desc: "Cucina tradizionale, grotti tipici, trattorie ed eccellenze",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
        badge: "Sapori Tipici"
    },
    {
        id: "typicalproducts",
        title: "Prodotti Tipici & Artigianato",
        desc: "Botteghe locali, formaggi AOP, salumi marchigiani e cioccolato",
        image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80",
        badge: "Eccellenze Locali"
    },
    {
        id: "routes",
        title: "Sentieri ed Itinerari",
        desc: "Percorsi escursionistici segnalati, cammini e viste panoramiche",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",
        badge: "Escursioni"
    },
    {
        id: "events",
        title: "Eventi, Festival e Sagre",
        desc: "Tradizioni popolari, concerti, mostre temporanee e festival",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
        badge: "Eventi dal Vivo"
    },
    {
        id: "sleep",
        title: "Ospitalità & Soggiorni",
        desc: "Chalet alpini, hotel storici, agriturismi e alloggi studenteschi",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
        badge: "Accoglienza"
    },
    {
        id: "shopping",
        title: "Shopping & Botteghe",
        desc: "Artigianato d'eccellenza, orologeria, ceramiche e boutique",
        image: "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=600&auto=format&fit=crop&q=80",
        badge: "Shopping Locale"
    },
    {
        id: "entertainmentleisure",
        title: "Svago e Tempo Libero",
        desc: "Terme, relax, parchi divertimento e treni panoramici",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
        badge: "Relax & Tempo Libero"
    }
];

export function ProfilePreferences({
    user,
    activeCountry = "CH",
    onSwitchCountry,
    onComplete,
    onBack,
    initialData = null
}) {
    const { t } = useTranslation();
    const isIt = activeCountry === "IT";

    // Country Theme Tokens: Bordeaux Red for CH vs Emerald Green for IT
    const themeBgBanner = isIt
        ? "bg-gradient-to-r from-emerald-700 via-green-800 to-emerald-900"
        : "bg-gradient-to-r from-red-800 via-rose-900 to-red-950";
    const themeBgBtn = isIt
        ? "bg-gradient-to-r from-emerald-700 to-green-800 hover:from-emerald-800 hover:to-green-900 shadow-emerald-500/20"
        : "bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-900 hover:to-rose-950 shadow-red-500/20";
    const themeBadgeClass = isIt
        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80"
        : "bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/80";
    const themeIconClass = isIt ? "text-emerald-700 dark:text-emerald-400" : "text-red-800 dark:text-red-400";
    const themeNumberBg = isIt ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300" : "bg-red-50 dark:bg-red-950/70 text-red-800 dark:text-red-300";
    const themeFocus = isIt ? "focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600" : "focus:ring-2 focus:ring-red-800 focus:border-red-800";
    const themeActiveCard = isIt
        ? "border-emerald-700 dark:border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/30"
        : "border-red-800 dark:border-red-500 ring-2 ring-red-200 dark:ring-red-900/60 bg-red-50/20 dark:bg-red-950/30";
    const themeCheckBg = isIt ? "bg-emerald-700 text-white" : "bg-red-800 text-white";
    const themePresetActive = isIt ? "bg-emerald-700 text-white border-emerald-700" : "bg-red-800 text-white border-red-800";
    const themeSummaryBadge = isIt ? "bg-emerald-700 text-white" : "bg-red-800 text-white";

    // 1. Profile State
    const [firstName, setFirstName] = useState(initialData?.firstName || "");
    const [lastName, setLastName] = useState(initialData?.lastName || "");

    // 2. City State
    const defaultCity = isIt ? "Camerino" : "Olten";
    const [selectedCity, setSelectedCity] = useState(initialData?.municipality || defaultCity);
    const [citySearch, setCitySearch] = useState("");
    const [cityOptions, setCityOptions] = useState([]);

    // 3. Date & Time Mechanics
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);
    const in3DaysStr = in3Days.toISOString().split("T")[0];

    const [startDate, setStartDate] = useState(
        initialData?.startTime ? initialData.startTime.split("T")[0] : todayStr
    );
    const [startHour, setStartHour] = useState(
        initialData?.startTime ? new Date(initialData.startTime).getHours() : 9
    );
    const [endDate, setEndDate] = useState(
        initialData?.endTime ? initialData.endTime.split("T")[0] : in3DaysStr
    );
    const [endHour, setEndHour] = useState(
        initialData?.endTime ? new Date(initialData.endTime).getHours() : 19
    );

    const [activePreset, setActivePreset] = useState("3days");

    // 4. Categories State
    const [selectedCategories, setSelectedCategories] = useState(
        initialData?.selectedCategories || ["artculture", "nature", "eatanddrink"]
    );

    const [saving, setSaving] = useState(false);

    // Calculate duration in days
    const durationDays = Math.max(
        1,
        Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    );

    // Apply quick date preset
    const applyPreset = (presetKey) => {
        setActivePreset(presetKey);
        const base = new Date();
        const baseStr = base.toISOString().split("T")[0];

        if (presetKey === "today") {
            setStartDate(baseStr);
            setEndDate(baseStr);
            setStartHour(9);
            setEndHour(20);
        } else if (presetKey === "weekend") {
            const nextFri = new Date(base);
            const dayOfWeek = nextFri.getDay();
            const daysUntilFri = (5 - dayOfWeek + 7) % 7 || 7;
            nextFri.setDate(nextFri.getDate() + daysUntilFri);
            const nextSun = new Date(nextFri);
            nextSun.setDate(nextSun.getDate() + 2);

            setStartDate(nextFri.toISOString().split("T")[0]);
            setEndDate(nextSun.toISOString().split("T")[0]);
            setStartHour(15);
            setEndHour(21);
        } else if (presetKey === "3days") {
            const end3 = new Date(base);
            end3.setDate(end3.getDate() + 3);
            setStartDate(baseStr);
            setEndDate(end3.toISOString().split("T")[0]);
            setStartHour(9);
            setEndHour(19);
        } else if (presetKey === "week") {
            const end7 = new Date(base);
            end7.setDate(end7.getDate() + 7);
            setStartDate(baseStr);
            setEndDate(end7.toISOString().split("T")[0]);
            setStartHour(8);
            setEndHour(20);
        }
    };

    // Load initial user data from DB if available
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            try {
                const userId = user.id || user.email;
                const res = await fetch(`http://localhost:5203/api/eppoiapi/profile-vector/${encodeURIComponent(userId)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        if (data.firstName) setFirstName(data.firstName);
                        if (data.lastName) setLastName(data.lastName);
                        if (data.municipality) setSelectedCity(data.municipality);
                        if (data.selectedCategories?.length) setSelectedCategories(data.selectedCategories);
                        if (data.startTime) {
                            setStartDate(data.startTime.split("T")[0]);
                            setStartHour(new Date(data.startTime).getHours());
                        }
                        if (data.endTime) {
                            setEndDate(data.endTime.split("T")[0]);
                            setEndHour(new Date(data.endTime).getHours());
                        }
                    }
                }
            } catch (err) {
                console.log("Existing profile vector check:", err);
            }
        };

        fetchUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Load municipalities list for active country
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const query = citySearch.trim() ? `&search=${encodeURIComponent(citySearch.trim())}` : "";
                const res = await fetch(`http://localhost:5203/api/EppoiApi/municipalities?country=${activeCountry}${query}`);
                if (res.ok) {
                    const data = await res.json();
                    setCityOptions(data);
                }
            } catch (err) {
                console.warn("Cities list fetch error:", err);
            }
        };

        fetchCities();
    }, [activeCountry, citySearch]);

    const toggleCategory = (categoryId) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const selectAllCategories = () => {
        if (selectedCategories.length === CATEGORY_ITEMS.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(CATEGORY_ITEMS.map((item) => item.id));
        }
    };

    // Handle Form Submit
    const handleSave = async (e) => {
        e.preventDefault();

        if (!firstName.trim()) {
            toast.error("Per favore inserisci il tuo nome per continuare.");
            return;
        }

        if (selectedCategories.length === 0) {
            toast.error("Seleziona almeno una categoria di interesse.");
            return;
        }

        const startDateTime = new Date(`${startDate}T${String(startHour).padStart(2, "0")}:00:00`);
        const endDateTime = new Date(`${endDate}T${String(endHour).padStart(2, "0")}:00:00`);

        if (endDateTime <= startDateTime) {
            toast.error("La data/ora di ritorno deve essere successiva alla partenza.");
            return;
        }

        setSaving(true);

        const profileVectorData = {
            userId: (user?.id || user?.email || "guest").toString(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            country: activeCountry,
            municipality: selectedCity,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            selectedCategories: selectedCategories,
        };

        try {
            const response = await fetch("http://localhost:5203/api/EppoiApi/save-profile-vector", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(profileVectorData),
            });

            if (response.ok) {
                toast.success(`Profilo e preferenze salvate con successo per ${selectedCity}!`);
                localStorage.setItem("cultural_guide_country", activeCountry);
                localStorage.setItem("cultural_guide_city", selectedCity);
                localStorage.setItem("cultural_guide_preferences", JSON.stringify(profileVectorData));

                if (onComplete) {
                    onComplete({
                        country: activeCountry,
                        municipality: selectedCity,
                        profileVector: profileVectorData,
                    });
                }
            } else {
                throw new Error("Salvataggio fallito sul server.");
            }
        } catch (err) {
            console.warn("Salvando localmente in fallback:", err);
            localStorage.setItem("cultural_guide_country", activeCountry);
            localStorage.setItem("cultural_guide_city", selectedCity);
            localStorage.setItem("cultural_guide_preferences", JSON.stringify(profileVectorData));
            toast.info("Preferenze salvate localmente.");

            if (onComplete) {
                onComplete({
                    country: activeCountry,
                    municipality: selectedCity,
                    profileVector: profileVectorData,
                });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">

            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-6">
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-xs transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('carousel_back_dashboard', 'Torna alla Dashboard')}</span>
                    </button>
                )}

                <div className={`inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-xs border ${themeBadgeClass}`}>
                    <span className="text-xs font-bold">
                        {isIt ? "🇮🇹 Destinazione: Italia (ESN Camerino)" : "🇨🇭 Destinazione: Svizzera (ESN Olten)"}
                    </span>
                    {onSwitchCountry && (
                        <button
                            type="button"
                            onClick={onSwitchCountry}
                            className={`text-xs font-bold underline ml-1 ${themeIconClass}`}
                        >
                            {t('header_change', 'Cambia')} Paese
                        </button>
                    )}
                </div>
            </div>

            {/* Main Container Card */}
            <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">

                {/* Card Banner Header */}
                <div className={`p-8 text-white relative ${themeBgBanner}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{t('profile_onboarding_title', 'Configurazione Profilo & Preferenze di Viaggio')}</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black">
                                Personalizza la tua Cultural Guide
                            </h2>
                            <p className="text-white/80 text-sm mt-1 max-w-xl">
                                {t('profile_onboarding_subtitle', 'Imposta il tuo profilo, la data del tuo soggiorno e seleziona le categorie di interesse.')}
                            </p>
                        </div>

                        <div className="hidden lg:block">
                            <CulturalGuideLogo size="md" showText={false} />
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-10 space-y-10">

                    {/* SECTION 1: PROFILO UTENTE (NOME E COGNOME) */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${themeNumberBg}`}>
                                1
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <User className={`w-5 h-5 ${themeIconClass}`} />
                                <span>I Tuoi Dati Personali</span>
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                    {t('profile_firstname', 'Nome')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Es. Fabio"
                                    className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white ${themeFocus} focus:outline-none transition-all shadow-xs`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                    {t('profile_lastname', 'Cognome')}
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Es. Grelloni"
                                    className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white ${themeFocus} focus:outline-none transition-all shadow-xs`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: DESTINAZIONE / COMUNE */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${themeNumberBg}`}>
                                2
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin className={`w-5 h-5 ${themeIconClass}`} />
                                <span>{t('profile_destination', 'Città di Destinazione')} ({isIt ? t('country_italy', 'Italia') : t('country_switzerland', 'Svizzera')})</span>
                            </h3>
                        </div>

                        <div className="bg-gray-50/70 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                            {/* Search input */}
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={isIt ? "Cerca comune (es. Camerino, Urbino, Ascoli Piceno)..." : "Cerca comune (es. Olten, Lugano, Zurigo)..."}
                                    value={citySearch}
                                    onChange={(e) => setCitySearch(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white ${themeFocus} focus:outline-none shadow-xs`}
                                />
                            </div>

                            {/* Popular / Searched City Chips */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2.5">
                                    {citySearch ? "Risultati della ricerca:" : "Città consigliate & partner ufficiali:"}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {cityOptions.slice(0, 10).map((city) => {
                                        const cleanName = city.legalName.replace(/\s*\(.*?\)\s*/g, "").trim();
                                        const isSelected = selectedCity.toLowerCase() === cleanName.toLowerCase();
                                        const isPartner = cleanName.toLowerCase() === "olten" || cleanName.toLowerCase() === "camerino";

                                        return (
                                            <button
                                                type="button"
                                                key={city.legalName}
                                                onClick={() => setSelectedCity(cleanName)}
                                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                                                    isSelected
                                                        ? `${themeBgBtn} text-white shadow-md scale-105`
                                                        : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                                }`}
                                            >
                                                <span>{cleanName}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                                    isSelected ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                                }`}>
                                                    {city.canton || activeCountry}
                                                </span>
                                                {isPartner && (
                                                    <span className="text-[10px] font-black text-amber-500">
                                                        ★ ESN Partner
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Selected City Confirm Pill */}
                            <div className="pt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200/60 dark:border-gray-800">
                                <span>{t('citySelection_selectCity', 'Destinazione selezionata:')}</span>
                                <span className={`font-bold px-3 py-1 rounded-lg border shadow-xs ${themeBadgeClass}`}>
                                    📍 {selectedCity} ({activeCountry})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: INSERIMENTO GIORNI & DATE */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${themeNumberBg}`}>
                                3
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar className={`w-5 h-5 ${themeIconClass}`} />
                                <span>{t('profile_dates_title', 'Periodo e Date di Viaggio')}</span>
                            </h3>
                        </div>

                        <div className="bg-gray-50/70 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-5">

                            {/* Quick Preset Chips */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                    Seleziona rapida durata:
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { key: "today", label: `⚡ ${t('profile_preset_today', 'Oggi')}` },
                                        { key: "weekend", label: `🎉 ${t('profile_preset_weekend', 'Questo weekend')}` },
                                        { key: "3days", label: `✨ ${t('profile_preset_3days', '3 giorni')}` },
                                        { key: "week", label: `🏖️ ${t('profile_preset_1week', '1 settimana')}` }
                                    ].map((preset) => (
                                        <button
                                            type="button"
                                            key={preset.key}
                                            onClick={() => applyPreset(preset.key)}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                                activePreset === preset.key
                                                    ? themePresetActive
                                                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Inputs Side-by-Side */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* Start Date & Hour */}
                                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                        <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>{t('profile_start_date', 'Data Inizio')} & {t('profile_start_hour', 'Ora')}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => {
                                                setStartDate(e.target.value);
                                                setActivePreset("custom");
                                            }}
                                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white ${themeFocus} focus:outline-none`}
                                        />
                                        <select
                                            value={startHour}
                                            onChange={(e) => {
                                                setStartHour(Number(e.target.value));
                                                setActivePreset("custom");
                                            }}
                                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white ${themeFocus} focus:outline-none`}
                                        >
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <option key={i} value={i}>
                                                    {String(i).padStart(2, "0")}:00
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* End Date & Hour */}
                                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                        <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                        <span>{t('profile_end_date', 'Data Fine')} & {t('profile_end_hour', 'Ora')}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={endDate}
                                            min={startDate}
                                            onChange={(e) => {
                                                setEndDate(e.target.value);
                                                setActivePreset("custom");
                                            }}
                                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white ${themeFocus} focus:outline-none`}
                                        />
                                        <select
                                            value={endHour}
                                            onChange={(e) => {
                                                setEndHour(Number(e.target.value));
                                                setActivePreset("custom");
                                            }}
                                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white ${themeFocus} focus:outline-none`}
                                        >
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <option key={i} value={i}>
                                                    {String(i).padStart(2, "0")}:00
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                            </div>

                            {/* Live Travel Summary Badge */}
                            <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${themeBadgeClass}`}>
                                <div className="flex items-center gap-2">
                                    <Calendar className={`w-4 h-4 ${themeIconClass}`} />
                                    <span>
                                        Dal <strong>{startDate}</strong> ({String(startHour).padStart(2, "0")}:00) al <strong>{endDate}</strong> ({String(endHour).padStart(2, "0")}:00)
                                    </span>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${themeSummaryBadge}`}>
                                    {durationDays} {durationDays === 1 ? "Giorno" : "Giorni"}
                                </span>
                            </div>

                        </div>
                    </div>

                    {/* SECTION 4: CATEGORIE DI INTERESSE */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${themeNumberBg}`}>
                                    4
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Compass className={`w-5 h-5 ${themeIconClass}`} />
                                    <span>{t('profile_categories_title', 'I Tuoi Interessi Culturali')}</span>
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={selectAllCategories}
                                className={`text-xs font-bold underline ${themeIconClass}`}
                            >
                                {selectedCategories.length === CATEGORY_ITEMS.length ? "Deseleziona tutte" : "Seleziona tutte"}
                            </button>
                        </div>

                        {/* Category Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {CATEGORY_ITEMS.map((item) => {
                                const isSelected = selectedCategories.includes(item.id);

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleCategory(item.id)}
                                        className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 flex flex-col justify-between ${
                                            isSelected
                                                ? `${themeActiveCard} shadow-md transform -translate-y-0.5`
                                                : "border-gray-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 opacity-80 hover:opacity-100"
                                        }`}
                                    >
                                        {/* Card Thumbnail */}
                                        <div className="relative h-28 overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                             {/* Badge */}
                                            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-white">
                                                {item.badge}
                                            </div>

                                            {/* Checkbox indicator */}
                                            <div className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                                isSelected
                                                    ? themeCheckBg
                                                    : "bg-white/80 dark:bg-gray-800/80 text-transparent border border-white dark:border-gray-600"
                                            }`}>
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            </div>

                                            <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                                                <h4 className="text-xs font-bold leading-snug line-clamp-1">
                                                    {item.title}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="p-3 bg-white dark:bg-gray-900">
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Selected counter */}
                        <div className="mt-3 text-right">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {selectedCategories.length} di {CATEGORY_ITEMS.length} categorie selezionate
                            </span>
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-4 px-6 rounded-2xl font-black text-base text-white flex items-center justify-center gap-3 shadow-lg transition-all duration-200 ${themeBgBtn} ${
                                saving ? "opacity-75 cursor-not-allowed" : "hover:shadow-xl hover:scale-[1.01]"
                            }`}
                        >
                            {saving ? (
                                <span>{t('profile_saving', 'Salvataggio in corso...')}</span>
                            ) : (
                                <>
                                    <span>{t('profile_save_btn', 'Salva Preferenze ed Entra nella Guida')}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>

                </div>

            </form>

        </div>
    );
}

export default ProfilePreferences;
