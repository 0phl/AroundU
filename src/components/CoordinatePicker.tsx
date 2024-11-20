    import React, { useEffect } from 'react';
    import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
    import L from 'leaflet';

    interface CoordinatePickerProps {
    value: { lat: number; lng: number };
    onChange: (coords: { lat: number; lng: number }) => void;
    }

    function formatCoordinate(coord: number): number {
    return Number(coord.toFixed(14));
    }

    function MapMarker({ position, onChange }: { 
    position: [number, number]; 
    onChange: (coords: { lat: number; lng: number }) => void;
    }) {
    useMapEvents({
        click(e) {
        onChange({ 
            lat: formatCoordinate(e.latlng.lat), 
            lng: formatCoordinate(e.latlng.lng) 
        });
        },
    });

    return <Marker position={position} />;
    }

    export default function CoordinatePicker({ value, onChange }: CoordinatePickerProps) {
    useEffect(() => {
        // Force map to update its size after mounting
        const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input
                type="number"
                step="any"
                value={value.lat}
                onChange={(e) => onChange({ ...value, lat: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input
                type="number"
                step="any"
                value={value.lng}
                onChange={(e) => onChange({ ...value, lng: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            </div>
        </div>
        <div className="h-[300px] rounded-lg overflow-hidden border border-gray-300 relative">
            <MapContainer
            center={[value.lat, value.lng]}
            zoom={15}
            className="h-full w-full"
            style={{ zIndex: 1 }}
            whenReady={(map) => {
                // Invalidate size when map is ready
                setTimeout(() => {
                map.target.invalidateSize();
                }, 0);
            }}
            >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapMarker 
                position={[value.lat, value.lng]}
                onChange={onChange}
            />
            </MapContainer>
        </div>
        </div>
    );
    } 