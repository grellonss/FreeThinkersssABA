import { useState, useEffect } from 'react';
import { X, MapPin, Clock, Navigation } from 'lucide-react'; // Removed unused icons
import { useTranslation } from 'react-i18next';

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

// 2. Helper component to handle center changes programmatically
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
                            height = '600px',
                            onLocationClick
                        }) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([41.9028, 12.4964]); // Default to Rome or generic
    const { t } = useTranslation();

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
        // Optional: Center map on click
        // setMapCenter([location.latitude, location.longitude]);

        if (onLocationClick) {
            onLocationClick(location);
        }
    };

    const closeBanner = () => {
        setSelectedLocation(null);
    };

    // 3. Create a custom Indigo Icon to match your previous design
    // We use L.divIcon to render HTML as a marker
    const createCustomIcon = (title, isSelected) => {
        return new L.DivIcon({
            className: 'custom-marker-icon',
            html: `
                <div class="relative ${isSelected ? 'animate-bounce' : ''} transform -translate-x-1/2 -translate-y-full">
                    
                    <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isSelected ? 'bg-indigo-600 ring-4 ring-indigo-200' : 'bg-indigo-600 hover:bg-indigo-700'
            }">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    
                    <div class="absolute left-1/2 top-full w-0 h-0 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-indigo-600"></div>
                    
                    <div class="absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap">
                        <div class="bg-white px-2 py-1 rounded-lg shadow-md text-xs text-gray-900 font-semibold border border-gray-100">
                            ${title || 'N/A'}
                        </div>
                    </div>
                </div>
            `,
            iconSize: [40, 50],
            iconAnchor: [20, 50],
        });
    };

    return (
        <div className="relative w-full rounded-xl overflow-hidden shadow-xl" style={{ height, zIndex: 0 }}>
            {/* 4. The Real Map Container */}
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <ChangeView center={mapCenter} zoom={zoom} />

                {/* The visual map tiles (OpenStreetMap) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 5. Render Markers tied to the map coordinates */}
                {Array.isArray(locations) &&
                    locations.map((location) => {
                        if (location.latitude == null || location.longitude == null) return null;

                        const isSelected = selectedLocation?.id === location.id;

                        // Determina il testo da mostrare (Titolo o Tipo)
                        const labelText = location.title || location.type;

                        return (
                            <Marker
                                key={location.id}
                                position={[location.latitude, location.longitude]}
                                // PASSA labelText QUI SOTTO:
                                icon={createCustomIcon(labelText, isSelected)}
                                eventHandlers={{
                                    click: () => handleMarkerClick(location),
                                }}
                            />
                        );
                    })}
            </MapContainer>

            {/* 6. Information Banner (Overlay on top of map) */}
            {selectedLocation && (
                <div className="absolute bottom-4 left-4 right-4 z-[1000] animate-slide-up pointer-events-none">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto pointer-events-auto">
                        {selectedLocation.image && (
                            <div className="relative h-48 bg-gray-200">
                                <img
                                    src={selectedLocation.image}
                                    alt={selectedLocation.title || selectedLocation.type}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <button
                                    onClick={closeBanner}
                                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        )}

                        <div className="p-6">
                            {!selectedLocation.image && (
                                <button
                                    onClick={closeBanner}
                                    className="absolute top-3 right-3 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            )}

                            <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm mb-3">
                                {selectedLocation.type}
                            </div>

                            <h2 className="text-gray-900 mb-3">
                                {selectedLocation.title || selectedLocation.type}
                            </h2>

                            {selectedLocation.description && (
                                <p className="text-gray-600 mb-4 line-clamp-2">{selectedLocation.description}</p>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-900 text-sm">{t('swipeCarousel_location')}</p>
                                        <p className="text-gray-600 text-sm truncate">{selectedLocation.location}</p>
                                    </div>
                                </div>

                                {selectedLocation.openingHours && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 text-sm">{t('swipeCarousel_hours')}</p>
                                            <p className="text-gray-600 text-sm">{selectedLocation.openingHours}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                    <Navigation className="w-4 h-4" />
                                    Directions
                                </button>
                                <button className="px-4 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                                    More Info
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}