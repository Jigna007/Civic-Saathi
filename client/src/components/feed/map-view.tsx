import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MaintenanceIssue, User } from "@shared/schema";
import { geocodeLocation } from "@/lib/geocode";

// Component to fit map bounds to all markers
function FitBounds({ markers }: { markers: { location: [number, number] }[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => m.location));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [markers, map]);

  return null;
}

// Severity-based marker colors
const createColoredIcon = (severity: string) => {
  const colors = {
    critical: "#dc2626", // red
    high: "#ea580c", // orange
    medium: "#f59e0b", // amber
    low: "#3b82f6", // blue
  };

  const color = colors[severity as keyof typeof colors] || "#6b7280"; // gray default

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 41" width="25" height="41">
      <path fill="${color}" stroke="#fff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle fill="#fff" cx="12" cy="9" r="3"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: "custom-marker",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Fix default marker icons for Leaflet when bundling
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon as any;

interface MapViewProps {
  issues: (MaintenanceIssue & { reporter: User })[] | undefined;
}

function parseLatLng(location?: string): [number, number] | null {
  if (!location) return null;

  // Handle new format: "lat, lng | address"
  // Extract coordinates before the pipe if present
  let coordPart = location;
  if (location.includes("|")) {
    coordPart = location.split("|")[0].trim();
  }

  // Expect formats like: "12.97, 77.59" or "lat:12.97 lng:77.59"
  const match = coordPart
    .replace(/lat\s*[:=]?\s*/i, "")
    .replace(/lng|lon\s*[:=]?\s*/i, "")
    .match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (isFinite(lat) && isFinite(lng)) return [lat, lng];
  }
  return null;
}

export function MapView({ issues }: MapViewProps) {
  const [, forceRerender] = useState(0);
  const geoCacheRef = useRef<Map<string, [number, number]>>(new Map());
  const [geocoding, setGeocoding] = useState(false);

  // Demo hotspots for Nizampet/Bachupally area - pre-geocoded coordinates for reliability
  // These show on the map even when no real issues exist
  const demoHotspots = [
    {
      id: "demo-1",
      title: "Pothole on Main Road",
      location: [17.5186, 78.3885] as [number, number],
      reporter: "Demo User",
      severity: "high",
      rawLocation: "Nizampet Main Road, Hyderabad",
    },
    {
      id: "demo-2",
      title: "Broken Street Light",
      location: [17.545, 78.37] as [number, number],
      reporter: "Demo User",
      severity: "medium",
      rawLocation: "Bachupally Cross Roads, Hyderabad",
    },
    {
      id: "demo-3",
      title: "Water Leakage",
      location: [17.521, 78.382] as [number, number],
      reporter: "Demo User",
      severity: "critical",
      rawLocation: "Nizampet X Roads, Hyderabad",
    },
    {
      id: "demo-4",
      title: "Damaged Sidewalk",
      location: [17.532, 78.375] as [number, number],
      reporter: "Demo User",
      severity: "low",
      rawLocation: "Bachupally Road, Hyderabad",
    },
    {
      id: "demo-5",
      title: "Overflowing Garbage Bin",
      location: [17.515, 78.395] as [number, number],
      reporter: "Demo User",
      severity: "medium",
      rawLocation: "Nizampet Colony, Hyderabad",
    },
    {
      id: "demo-6",
      title: "Traffic Signal Malfunction",
      location: [17.538, 78.368] as [number, number],
      reporter: "Demo User",
      severity: "high",
      rawLocation: "Near JNTU Bachupally, Hyderabad",
    },
  ];

  // Build markers using parsed lat/lng or cached geocoded values
  const markers = useMemo(() => {
    const realMarkers = (issues || [])
      .map((i) => {
        const parsed = parseLatLng(i.location || undefined);
        const cached = i.location ? geoCacheRef.current.get(i.location) : null;
        const loc: [number, number] | null = parsed || cached || null;
        return {
          id: i.id,
          title: i.title,
          reporter: i.reporter?.username ?? "Unknown",
          location: loc,
          rawLocation: i.location || undefined,
          severity: i.severity,
        };
      })
      .filter((m) => m.location !== null) as {
      id: string;
      title: string;
      reporter: string;
      location: [number, number];
      rawLocation?: string;
      severity: string;
    }[];

    // Combine real markers with demo hotspots
    return [...realMarkers, ...demoHotspots];
  }, [issues, geocoding]);

  // On issues change, geocode any locations that aren't numeric
  // Uses CORS proxy via geocodeLocation helper for demo reliability
  useEffect(() => {
    const run = async () => {
      if (!issues?.length) return;

      // Find locations that need geocoding
      const toGeocode: string[] = [];
      for (const issue of issues) {
        const loc = issue.location?.trim();
        if (!loc) continue;
        // Skip if already have coordinates cached
        if (geoCacheRef.current.has(loc)) continue;
        // Skip if already in coordinate format (plain coordinates)
        if (loc.match(/^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/)) continue;
        // Skip if in new format with coordinates before pipe: "lat, lng | address"
        if (
          loc.includes(" | ") &&
          loc.split(" | ")[0].match(/^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/)
        )
          continue;
        if (!toGeocode.includes(loc)) toGeocode.push(loc);
      }

      if (toGeocode.length === 0) return;

      setGeocoding(true);
      try {
        // Geocode each location using our CORS-proxy helper
        for (const loc of toGeocode) {
          console.log(`[Map] Geocoding location: "${loc}"`);
          const coords = await geocodeLocation(loc);
          if (coords) {
            console.log(`[Map] Geocoded "${loc}" to:`, coords);
            geoCacheRef.current.set(loc, coords);
            // Force rerender to show newly geocoded marker
            forceRerender((v) => v + 1);
          } else {
            console.warn(`[Map] Failed to geocode "${loc}"`);
          }
          // Small delay between requests to be polite to the API
          await new Promise((r) => setTimeout(r, 400));
        }
      } finally {
        setGeocoding(false);
      }
    };
    run();
  }, [issues]);

  // Center map on Nizampet/Bachupally area (where demo hotspots are located)
  const center: [number, number] = [17.528, 78.38]; // Nizampet/Bachupally center

  return (
    <div className="w-full h-full relative">
      {/* Legend - Bottom Left */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-[1000] text-xs">
        <div className="font-semibold mb-2">Severity Levels</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>Low</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={12}
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FitBounds markers={markers} />
        {markers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 pointer-events-none z-[1000]">
            {geocoding ? "Locating addresses..." : "No mappable locations yet"}
          </div>
        )}
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={m.location}
            icon={createColoredIcon(m.severity)}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">{m.title}</div>
                <div className="text-gray-600">Reporter: {m.reporter}</div>
                <div className="text-xs mt-1">
                  <span className="font-medium">Severity: </span>
                  <span
                    className={`capitalize font-semibold ${
                      m.severity === "critical"
                        ? "text-red-600"
                        : m.severity === "high"
                        ? "text-orange-600"
                        : m.severity === "medium"
                        ? "text-amber-600"
                        : "text-blue-600"
                    }`}
                  >
                    {m.severity}
                  </span>
                </div>
                {m.rawLocation && (
                  <div className="text-xs text-gray-400 mt-1">
                    📍 {m.rawLocation}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
