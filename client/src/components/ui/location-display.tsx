import { useState, useEffect } from "react";
import {
  isCoordinateString,
  parseCoordinates,
  reverseGeocodeLocation,
} from "@/lib/geocode";

interface LocationDisplayProps {
  location: string;
  className?: string;
}

// Cache to avoid repeated API calls across component instances
const locationCache = new Map<string, string>();

/**
 * Displays a location string, automatically converting coordinates to addresses.
 * Handles formats:
 * - "lat, lng | address" - displays the address part
 * - "lat, lng" - attempts reverse geocoding
 * - "text address" - displays as-is
 */
export function LocationDisplay({
  location,
  className = "",
}: LocationDisplayProps) {
  const [displayLocation, setDisplayLocation] = useState<string>(location);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for new format: "coordinates | address"
    if (location.includes(" | ")) {
      const parts = location.split(" | ");
      // Display the address part (after the pipe)
      setDisplayLocation(parts.slice(1).join(" | ").trim());
      return;
    }

    // Check if location looks like coordinates
    if (isCoordinateString(location)) {
      // Check cache first
      if (locationCache.has(location)) {
        setDisplayLocation(locationCache.get(location)!);
        return;
      }

      const coords = parseCoordinates(location);
      if (coords) {
        setIsLoading(true);
        reverseGeocodeLocation(coords[0], coords[1])
          .then((address) => {
            if (address) {
              locationCache.set(location, address);
              setDisplayLocation(address);
            } else {
              // Keep original coordinates if reverse geocoding fails
              setDisplayLocation(location);
            }
          })
          .catch(() => {
            setDisplayLocation(location);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } else {
      setDisplayLocation(location);
    }
  }, [location]);

  if (isLoading) {
    return <span className={`${className} animate-pulse`}>Loading...</span>;
  }

  return <span className={className}>{displayLocation}</span>;
}
