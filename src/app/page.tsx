'use client';

import { useState } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';

interface Location {
  id: number;
  address: string;
  coordinates?: { lat: number; lng: number };
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 0,
  lng: 0,
};

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([{ id: 1, address: '' }]);
  const [optimizedRoute, setOptimizedRoute] = useState<Location[]>([]);
  const [totalDistance, setTotalDistance] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const addLocation = () => {
    setLocations([...locations, { id: locations.length + 1, address: '' }]);
  };

  const removeLocation = (id: number) => {
    if (locations.length > 1) {
      setLocations(locations.filter(loc => loc.id !== id));
    }
  };

  const updateLocation = (id: number, address: string) => {
    setLocations(locations.map(loc => 
      loc.id === id ? { ...loc, address } : loc
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/optimize-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locations }),
      });

      const data = await response.json();
      setOptimizedRoute(data.optimizedRoute);
      setTotalDistance(data.totalDistance);

      if (data.optimizedRoute[0]?.coordinates) {
        setMapCenter(data.optimizedRoute[0].coordinates);
      }
    } catch (error) {
      console.error('Error optimizing route:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMap = () => {
    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading maps...</div>;

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={mapCenter}
        options={{
          styles: [
            {
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#242f3e"
                }
              ]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [
                {
                  "color": "#242f3e"
                }
              ]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#746855"
                }
              ]
            },
            {
              "featureType": "administrative.locality",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#d59563"
                }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#d59563"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#263c3f"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#6b9a76"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#38414e"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "geometry.stroke",
              "stylers": [
                {
                  "color": "#212a37"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#9ca5b3"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#746855"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry.stroke",
              "stylers": [
                {
                  "color": "#1f2835"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#f3d19c"
                }
              ]
            },
            {
              "featureType": "transit",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#2f3948"
                }
              ]
            },
            {
              "featureType": "transit.station",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#d59563"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#17263c"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#515c6d"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.stroke",
              "stylers": [
                {
                  "color": "#17263c"
                }
              ]
            }
          ]
        }}
      >
        {optimizedRoute.map((location, index) => (
          location.coordinates && (
            <Marker
              key={index}
              position={location.coordinates}
              label={(index + 1).toString()}
            />
          )
        ))}
        {optimizedRoute.length > 1 && (
          <Polyline
            path={optimizedRoute
              .filter(loc => loc.coordinates)
              .map(loc => loc.coordinates!)}
            options={{
              strokeColor: '#00ff00',
              strokeOpacity: 0.8,
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">Road Trip Planner</h1>
        
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {locations.map((location) => (
              <div key={location.id} className="flex gap-2">
                <input
                  type="text"
                  value={location.address}
                  onChange={(e) => updateLocation(location.id, e.target.value)}
                  placeholder="Enter location address"
                  className="flex-1 p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeLocation(location.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  disabled={locations.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={addLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Add Location
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Optimizing...' : 'Find Optimal Route'}
              </button>
            </div>
          </form>
        </div>

        {optimizedRoute.length > 0 && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
              {renderMap()}
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">Optimized Route</h2>
              <p className="text-lg mb-4 text-gray-300">Total Distance: {totalDistance} km</p>
              <ol className="list-decimal list-inside space-y-2">
                {optimizedRoute.map((location, index) => (
                  <li key={index} className="text-lg text-gray-300">
                    {location.address}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
