/**
 * Demo-safe geocoding helper
 *
 * WHY CORS ERRORS HAPPEN:
 * Nominatim (OpenStreetMap's geocoding API) doesn't allow direct browser requests
 * because their server doesn't send the `Access-Control-Allow-Origin` header.
 * Browsers block these "cross-origin" requests for security.
 *
 * SOLUTION FOR DEMO:
 * We proxy geocoding requests through our backend API at /api/geocode.
 * The backend can make server-to-server requests without CORS restrictions.
 * This is reliable and doesn't depend on third-party CORS proxies.
 *
 * ALTERNATIVE APPROACHES:
 * - Use a paid geocoding API with CORS support (Google Maps, Mapbox)
 * - Pre-geocode locations and store coordinates in the database
 */

// Cache geocoded results to avoid repeated API calls
const geocodeCache = new Map<string, [number, number]>();

/**
 * Geocode a location string to coordinates using our backend proxy.
 * Returns [lat, lng] or null if geocoding fails.
 *
 * @param location Human-readable location string (e.g., "HITEC City, Hyderabad")
 * @returns Promise<[number, number] | null>
 */
export async function geocodeLocation(
  location: string
): Promise<[number, number] | null> {
  const trimmed = location.trim();
  if (!trimmed) return null;

  // Check cache first
  if (geocodeCache.has(trimmed)) {
    return geocodeCache.get(trimmed)!;
  }

  // Check if already coordinates (lat, lng format)
  const coordMatch = trimmed.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (isFinite(lat) && isFinite(lng)) {
      geocodeCache.set(trimmed, [lat, lng]);
      return [lat, lng];
    }
  }

  try {
    // Use our backend API to proxy geocoding requests
    // This avoids CORS issues since the backend makes server-to-server requests
    const API_BASE_URL = import.meta.env.VITE_API_URL || "";
    const url = API_BASE_URL
      ? `${API_BASE_URL}/api/geocode?q=${encodeURIComponent(trimmed)}`
      : `/api/geocode?q=${encodeURIComponent(trimmed)}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`[Geocode] HTTP error for "${trimmed}":`, response.status);
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      if (isFinite(lat) && isFinite(lng)) {
        geocodeCache.set(trimmed, [lat, lng]);
        return [lat, lng];
      }
    }

    console.warn(`[Geocode] No results for "${trimmed}"`);
    return null;
  } catch (error) {
    // Graceful failure - log and return null
    console.warn(`[Geocode] Failed for "${trimmed}":`, error);
    return null;
  }
}

/**
 * Batch geocode multiple locations with rate limiting.
 * Returns a Map of location string -> coordinates.
 *
 * @param locations Array of location strings
 * @param delayMs Delay between requests (default 400ms to be polite to APIs)
 */
export async function batchGeocode(
  locations: string[],
  delayMs = 400
): Promise<Map<string, [number, number]>> {
  const results = new Map<string, [number, number]>();

  for (const loc of locations) {
    const coords = await geocodeLocation(loc);
    if (coords) {
      results.set(loc, coords);
    }
    // Small delay between requests to avoid overwhelming the API
    if (locations.indexOf(loc) < locations.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Clear the geocode cache (useful for testing)
 */
export function clearGeocodeCache(): void {
  geocodeCache.clear();
}

// Cache for reverse geocoding results
const reverseGeocodeCache = new Map<string, string>();

/**
 * Reverse geocode coordinates to a human-readable address using our backend proxy.
 * Returns a formatted address string or null if reverse geocoding fails.
 *
 * @param lat Latitude
 * @param lon Longitude
 * @returns Promise<string | null>
 */
export async function reverseGeocodeLocation(
  lat: number,
  lon: number
): Promise<string | null> {
  const cacheKey = `${lat.toFixed(6)},${lon.toFixed(6)}`;

  // Check cache first
  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey)!;
  }

  try {
    // Use API_BASE_URL from environment for production
    const API_BASE_URL = import.meta.env.VITE_API_URL || "";
    const url = API_BASE_URL 
      ? `${API_BASE_URL}/api/reverse-geocode?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
      : `/api/reverse-geocode?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    
    const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(`[ReverseGeocode] HTTP error:`, response.status);
      return null;
    }

    const data = await response.json();

    if (data && data.address) {
      // Build a concise, readable address
      const addr = data.address;
      const parts: string[] = [];

      // Prioritize locality/neighborhood/suburb for shorter addresses
      if (addr.neighbourhood) parts.push(addr.neighbourhood);
      else if (addr.suburb) parts.push(addr.suburb);
      else if (addr.locality) parts.push(addr.locality);
      else if (addr.road) parts.push(addr.road);

      // Add city/town
      if (addr.city) parts.push(addr.city);
      else if (addr.town) parts.push(addr.town);
      else if (addr.village) parts.push(addr.village);
      else if (addr.state_district) parts.push(addr.state_district);

      const formattedAddress =
        parts.length > 0
          ? parts.join(", ")
          : data.display_name?.split(",").slice(0, 2).join(",") || null;

      if (formattedAddress) {
        reverseGeocodeCache.set(cacheKey, formattedAddress);
        return formattedAddress;
      }
    }

    console.warn(`[ReverseGeocode] No address found for coordinates`);
    return null;
  } catch (error) {
    console.warn(`[ReverseGeocode] Failed:`, error);
    return null;
  }
}

/**
 * Check if a string looks like coordinates (lat, lng format)
 */
export function isCoordinateString(location: string): boolean {
  const trimmed = location.trim();
  return /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(trimmed);
}

/**
 * Parse coordinate string to [lat, lng] or null
 */
export function parseCoordinates(location: string): [number, number] | null {
  const trimmed = location.trim();
  const match = trimmed.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (isFinite(lat) && isFinite(lng)) {
      return [lat, lng];
    }
  }
  return null;
}
