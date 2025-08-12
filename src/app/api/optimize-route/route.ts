import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

interface Location {
  id: number;
  address: string;
  coordinates?: { lat: number; lng: number };
  geocodingError?: string;
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Dynamic Programming solution for TSP (Held-Karp algorithm)
function solveTSP(locations: Location[]): Location[] {
  if (locations.length < 2) return locations;

  // Filter out locations without coordinates
  const validLocations = locations.filter(loc => loc.coordinates);
  
  if (validLocations.length < 2) {
    return locations; // Return original order if not enough valid locations
  }

  // Create distance matrix
  const n = validLocations.length;
  const distMatrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && validLocations[i].coordinates && validLocations[j].coordinates) {
        distMatrix[i][j] = calculateDistance(
          validLocations[i].coordinates!.lat,
          validLocations[i].coordinates!.lng,
          validLocations[j].coordinates!.lat,
          validLocations[j].coordinates!.lng
        );
      }
    }
  }

  // Initialize DP table
  const size = 1 << n;
  const dp: number[][] = Array(n).fill(0).map(() => Array(size).fill(Infinity));
  const parent: number[][] = Array(n).fill(0).map(() => Array(size).fill(-1));

  // Base case: starting from node 0
  dp[0][1] = 0;

  // Fill DP table
  for (let mask = 1; mask < size; mask++) {
    for (let last = 0; last < n; last++) {
      if (!(mask & (1 << last))) continue;

      const prevMask = mask ^ (1 << last);
      for (let prev = 0; prev < n; prev++) {
        if (!(prevMask & (1 << prev))) continue;

        const newDist = dp[prev][prevMask] + distMatrix[prev][last];
        if (newDist < dp[last][mask]) {
          dp[last][mask] = newDist;
          parent[last][mask] = prev;
        }
      }
    }
  }

  // Find the minimum cost path
  let minCost = Infinity;
  let lastNode = -1;
  const finalMask = (1 << n) - 1;

  for (let i = 1; i < n; i++) {
    const cost = dp[i][finalMask] + distMatrix[i][0];
    if (cost < minCost) {
      minCost = cost;
      lastNode = i;
    }
  }

  // Reconstruct the path
  const path: number[] = [];
  let currentMask = finalMask;
  let currentNode = lastNode;

  while (currentNode !== -1) {
    path.push(currentNode);
    const prevNode = parent[currentNode][currentMask];
    currentMask ^= (1 << currentNode);
    currentNode = prevNode;
  }

  path.reverse();
  path.push(0); // Return to start

  // Convert indices to valid locations
  const optimizedValidLocations = path.map(index => validLocations[index]);
  
  // Add invalid locations at the end
  const invalidLocations = locations.filter(loc => !loc.coordinates);
  
  return [...optimizedValidLocations, ...invalidLocations];
}

export async function POST(request: Request) {
  try {
    const { locations } = await request.json();

    // Geocode all locations
    const geocodedLocations = await Promise.all(
      locations.map(async (location: Location) => {
        try {
          const response = await client.geocode({
            params: {
              address: location.address,
              key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
            },
          });

          if (response.data.results && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            return {
              ...location,
              coordinates: { lat, lng },
            };
          } else {
            // No results found
            return {
              ...location,
              geocodingError: `Could not find coordinates for "${location.address}". Please check the spelling or try a more specific address.`
            };
          }
        } catch (error) {
          console.error(`Error geocoding ${location.address}:`, error);
          return {
            ...location,
            geocodingError: `Failed to geocode "${location.address}". Please check your internet connection and try again.`
          };
        }
      })
    );

    // Check if we have enough valid locations
    const validLocations = geocodedLocations.filter(loc => loc.coordinates);
    const invalidLocations = geocodedLocations.filter(loc => !loc.coordinates);

    if (validLocations.length < 2) {
      return NextResponse.json({
        error: 'Need at least 2 valid locations to calculate a route.',
        invalidLocations: invalidLocations.map(loc => ({
          address: loc.address,
          error: loc.geocodingError
        }))
      }, { status: 400 });
    }

    // Solve TSP using dynamic programming
    const optimizedRoute = solveTSP(geocodedLocations);

    // Calculate total distance (only for valid locations)
    let totalDistance = 0;
    for (let i = 0; i < optimizedRoute.length - 1; i++) {
      const current = optimizedRoute[i];
      const next = optimizedRoute[i + 1];
      if (current.coordinates && next.coordinates) {
        totalDistance += calculateDistance(
          current.coordinates.lat,
          current.coordinates.lng,
          next.coordinates.lat,
          next.coordinates.lng
        );
      }
    }

    return NextResponse.json({ 
      optimizedRoute,
      totalDistance: totalDistance.toFixed(2),
      warnings: invalidLocations.length > 0 ? {
        message: `${invalidLocations.length} location(s) could not be geocoded and were excluded from the route.`,
        invalidLocations: invalidLocations.map(loc => ({
          address: loc.address,
          error: loc.geocodingError
        }))
      } : undefined
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 