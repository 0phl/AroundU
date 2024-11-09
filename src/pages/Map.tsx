import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBusinessStore } from '../stores/businessStore';

// Fix for default marker icons in Leaflet with Vite
const defaultIcon = new Icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Map() {
  const { businesses } = useBusinessStore();
  const center = { lat: 14.3292, lng: 120.9378 }; // St. Dominic College of Asia coordinates

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold">Nearby Places</h1>
      </div>
      <div className="flex-1">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={15}
          className="w-full h-[calc(100vh-120px)]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* College Marker */}
          <Marker 
            position={[center.lat, center.lng]} 
            icon={defaultIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">St. Dominic College of Asia</h3>
                <p className="text-sm text-gray-600">Main Campus</p>
              </div>
            </Popup>
          </Marker>

          {/* Business Markers */}
          {businesses.map((business) => (
            <Marker
              key={business.id}
              position={[business.coordinates.lat, business.coordinates.lng]}
              icon={defaultIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold">{business.name}</h3>
                  <p className="text-sm text-gray-600">{business.category}</p>
                  <div className="mt-2">
                    <div className="text-yellow-400">
                      {'★'.repeat(Math.floor(business.rating))}
                      {'☆'.repeat(5 - Math.floor(business.rating))}
                    </div>
                    <p className="text-xs text-gray-500">({business.reviewCount} reviews)</p>
                  </div>
                  <a
                    href={`/businesses/${business.id}`}
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}