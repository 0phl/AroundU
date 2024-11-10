import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useBusinessStore } from '../stores/businessStore';

// University marker (larger, red color)
const universityIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Business marker (blue color)
const businessIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Routing Control Component
function RoutingControl({ start, end }: { start: L.LatLng; end: L.LatLng }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [start, end],
      routeWhileDragging: false,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#6366f1', weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      createMarker: () => null // Don't create default markers
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end]);

  return null;
}

// Add this helper function at the top level
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Add this helper function for precise coordinate formatting
function formatCoordinate(coord: number): number {
  return Number(coord.toFixed(14)); // Keep 14 decimal places for high precision
}

export default function Map() {
  const { businesses } = useBusinessStore();
  // Format center coordinates with high precision
  const center = { 
    lat: 14.458942866502959, 
    lng: 120.96075553643246 
  };
  const [selectedBusiness, setSelectedBusiness] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Calculate distances but don't filter by radius
  const businessesWithDistance = useMemo(() => {
    return businesses
      .map(business => ({
        ...business,
        coordinates: {
          lat: formatCoordinate(business.coordinates.lat),
          lng: formatCoordinate(business.coordinates.lng)
        },
        distance: calculateDistance(
          center.lat,
          center.lng,
          business.coordinates.lat,
          business.coordinates.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [businesses, center]);

  useEffect(() => {
    const resizeMap = () => {
      window.dispatchEvent(new Event('resize'));
    };
    setTimeout(resizeMap, 200);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold">All Places</h1>
        {selectedBusiness && (
          <button
            onClick={() => setSelectedBusiness(null)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Route
          </button>
        )}
      </div>
      <div className="flex-1">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={15}
          className="w-full h-[calc(100vh-120px)]"
          ref={mapRef => {
            if (mapRef) {
              setTimeout(() => {
                mapRef.invalidateSize();
              }, 0);
            }
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* University Marker */}
          <Marker 
            position={[
              formatCoordinate(center.lat), 
              formatCoordinate(center.lng)
            ]} 
            icon={universityIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">St. Dominic College of Asia</h3>
                <p className="text-sm text-gray-600">Main Campus</p>
              </div>
            </Popup>
          </Marker>

          {/* Business Markers */}
          {businessesWithDistance.map((business) => (
            <Marker
              key={business.id}
              position={[
                formatCoordinate(business.coordinates.lat),
                formatCoordinate(business.coordinates.lng)
              ]}
              icon={businessIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold">{business.name}</h3>
                  <p className="text-sm text-gray-600">{business.category}</p>
                  <p className="text-sm text-gray-600">{business.distance.toFixed(2)} km away</p>
                  <div className="mt-2">
                    <div className="text-yellow-400">
                      {'★'.repeat(Math.floor(business.rating))}
                      {'☆'.repeat(5 - Math.floor(business.rating))}
                    </div>
                    <p className="text-xs text-gray-500">({business.reviewCount} reviews)</p>
                  </div>
                  <div className="mt-2 space-y-2">
                    <a
                      href={`/businesses/${business.id}`}
                      className="inline-block text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </a>
                    <button
                      onClick={() => {
                        setSelectedBusiness(business.coordinates);
                      }}
                      className="block w-full text-sm text-blue-600 hover:text-blue-800"
                    >
                      Show Directions
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Routing Control */}
          {selectedBusiness && (
            <RoutingControl
              start={new L.LatLng(center.lat, center.lng)}
              end={new L.LatLng(selectedBusiness.lat, selectedBusiness.lng)}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}