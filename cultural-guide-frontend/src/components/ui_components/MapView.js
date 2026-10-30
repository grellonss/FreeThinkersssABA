import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { handleImageFallback } from '../../services/imageResolver';

// 1. Import Leaflet components and CSS
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in Webpack/Vite environments
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle center changes programmatically
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
}

export function MapView({
    locations = [],
    center,
    zoom = 13,
    height = '500px',
    activeCountry: propCountry,
    onLocationClick
}) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const activeCountry = propCountry || localStorage.getItem("cultural_guide_country") || "CH";
    const isItalian = activeCountry === "IT";

    const defaultCenter = isItalian ? [43.1364, 13.0683] : [47.3522, 7.9077];
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const { t } = useTranslation();

    // Primary country colors
    const themeColor = isItalian ? '#047857' : '#991b1b'; // emerald-700 vs red-800
    const themeBgClass = isItalian ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-800 hover:bg-red-900';

    // Initialize center logic
    useEffect(() => {
        if (center && center.latitude != null && center.longitude != null) {
            setMapCenter([center.latitude, center.longitude]);
            return;
        }
        if (Array.isArray(locations) && locations.length > 0) {
            const first = locations[0];
            if (first && first.latitude != null && first.longitude != null) {
                setMapCenter([first.latitude, first.longitude]);
            }
        }
    }, [center, locations]);

    const handleMarkerClick = (location) => {
        if (!location) return;
        setSelectedLocation(location);
        if (onLocationClick) {
            onLocationClick(location);
        }
    };

    const closeBanner = () => {
        setSelectedLocation(null);
    };

    // Custom marker icon using country color
    const createCustomIcon = (title, isSelected) => {
        const pinBg = isItalian
            ? (isSelected ? '#065f46' : '#047857')
            : (isSelected ? '#7f1d1d' : '#991b1b');

        return new L.DivIcon({
            className: 'custom-marker-icon',
            html: `
                <div class="relative ${isSelected ? 'animate-bounce' : ''} transform -translate-x-1/2 -translate-y-full cursor-pointer">
                    <div style="background-color: ${pinBg}; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" class="w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isSelected ? 'ring-4 ring-white' : ''
                    }">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div style="border-top-color: ${pinBg};" class="absolute left-1/2 top-full w-0 h-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[7px] border-l-transparent border-r-transparent"></div>
                    <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap pointer-events-none">
                        <div class="bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-md text-[11px] text-gray-900 font-bold border border-gray-100">
                            ${(title || 'POI').length > 25 ? (title || 'POI').substring(0, 25) + '…' : (title || 'POI')}
                        </div>
                    </div>
                </div>
            `,
            iconSize: [36, 46],
            iconAnchor: [18, 46],
        });
    };

    return (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-md" style={{ height, zIndex: 0 }}>
            {/* The Real Map Container */}
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <ChangeView center={mapCenter} zoom={zoom} />

                {/* OpenStreetMap Tile Layer */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render Markers */}
                {Array.isArray(locations) &&
                    locations.map((location) => {
                        if (location.latitude == null || location.longitude == null) return null;
                        const isSelected = selectedLocation?.id === location.id;
                        const labelText = location.title || location.type || location.entityName;

                        return (
                            <Marker
                                key={location.id || `${location.latitude}-${location.longitude}`}
                                position={[location.latitude, location.longitude]}
                                icon={createCustomIcon(labelText, isSelected)}
                                eventHandlers={{
                                    click: () => handleMarkerClick(location),
                                }}
                            />
                        );
                    })}
            </MapContainer>

            {/* Modal Detail Overlay for Clicked Location (Never cut off, easy to close, country styled) */}
            {selectedLocation && (
                <div
                    className="absolute inset-0 z-[1500] bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeBanner();
                    }}
                >
                    <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full max-h-[92%] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                        {/* Guaranteed visible Close Button */}
                        <button
                            type="button"
                            onClick={closeBanner}
                            className="absolute top-3 right-3 z-30 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                            aria-label="Chiudi dettaglio"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Image Header */}
                        {selectedLocation.image && (
                            <div className="relative h-44 sm:h-48 bg-slate-100 dark:bg-gray-800 flex-shrink-0">
                                <img
                                    src={selectedLocation.image}
                                    alt={selectedLocation.title || selectedLocation.type}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        handleImageFallback(e, selectedLocation.title, selectedLocation.location, localStorage.getItem('cultural_guide_country') || 'CH');
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-4">
                                    <span className="inline-block px-3 py-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full text-xs font-bold shadow-sm capitalize text-gray-800 dark:text-gray-200">
                                        {selectedLocation.type || 'Punto Culturale'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Scrollable Content */}
                        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                            {!selectedLocation.image && (
                                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 shadow-2xs" style={{ borderColor: themeColor, color: themeColor }}>
                                    {selectedLocation.type || 'Punto Culturale'}
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-snug">
                                    {selectedLocation.title || selectedLocation.type}
                                </h3>
                                {selectedLocation.description && (
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed line-clamp-3">
                                        {selectedLocation.description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2.5 pt-2 text-xs border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                                {selectedLocation.location && (
                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: themeColor }} />
                                        <span className="leading-snug">{selectedLocation.location}</span>
                                    </div>
                                )}

                                {selectedLocation.openingHours && (
                                    <div className="flex items-start gap-2.5">
                                        <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: themeColor }} />
                                        <span>{selectedLocation.openingHours}</span>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="pt-2 grid grid-cols-2 gap-2.5">
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                        `${selectedLocation.title || ''} ${selectedLocation.location || ''}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-full py-2.5 px-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all ${themeBgClass}`}
                                >
                                    <Navigation className="w-3.5 h-3.5" />
                                    <span>{t('carousel_directions', 'Indicazioni')}</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={closeBanner}
                                    className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-1.5"
                                >
                                    <span>{t('carousel_close', 'Chiudi')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MapView;