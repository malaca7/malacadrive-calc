import { useCallback, useEffect, useRef } from "react";
import L, { type LeafletMouseEvent, type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

const MARKER_ICON = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const MARKER_ICON_2X = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const MARKER_SHADOW = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: MARKER_ICON_2X,
  iconUrl: MARKER_ICON,
  shadowUrl: MARKER_SHADOW,
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: MARKER_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: MARKER_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateTime(distanceKm: number): string {
  const avgSpeedKmh = 30;
  const totalMinutes = Math.round((distanceKm / avgSpeedKmh) * 60);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}min`;
}

async function fetchCarRoute(origin: [number, number], dest: [number, number]): Promise<{ coords: [number, number][]; distanceKm: number; durationMin: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return null;
    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
    return {
      coords,
      distanceKm: Math.round(route.distance / 100) / 10,
      durationMin: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "pt-BR" } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}

interface RideMapProps {
  selectingMode: "origem" | "destino";
  origemCoords: [number, number] | null;
  destinoCoords: [number, number] | null;
  onSelect: (lat: number, lng: number) => void;
  onOrigemAddress: (addr: string) => void;
  onDestinoAddress: (addr: string) => void;
  onDistanceChange: (km: number) => void;
  onTimeChange: (time: string) => void;
}

export function RideMap({
  selectingMode,
  origemCoords,
  destinoCoords,
  onSelect,
  onOrigemAddress,
  onDestinoAddress,
  onDistanceChange,
  onTimeChange,
}: RideMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const origemMarkerRef = useRef<L.Marker | null>(null);
  const destinoMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const handleSelect = useCallback(async (lat: number, lng: number) => {
    onSelect(lat, lng);
    const address = await reverseGeocode(lat, lng);
    if (selectingMode === "origem") {
      onOrigemAddress(address);
      return;
    }
    onDestinoAddress(address);
  }, [selectingMode, onSelect, onOrigemAddress, onDestinoAddress]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([-8.2835, -35.0253], 14); // Cabo de Santo Agostinho, PE

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png").addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      origemMarkerRef.current = null;
      destinoMarkerRef.current = null;
      routeLineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onMapClick = async (e: LeafletMouseEvent) => {
      await handleSelect(e.latlng.lat, e.latlng.lng);
    };

    map.on("click", onMapClick);
    return () => {
      map.off("click", onMapClick);
    };
  }, [handleSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (origemCoords) {
      if (!origemMarkerRef.current) {
        origemMarkerRef.current = L.marker(origemCoords, { icon: greenIcon })
          .bindPopup("Origem")
          .addTo(map);
      } else {
        origemMarkerRef.current.setLatLng(origemCoords);
      }
    } else if (origemMarkerRef.current) {
      map.removeLayer(origemMarkerRef.current);
      origemMarkerRef.current = null;
    }

    if (destinoCoords) {
      if (!destinoMarkerRef.current) {
        destinoMarkerRef.current = L.marker(destinoCoords, { icon: redIcon })
          .bindPopup("Destino")
          .addTo(map);
      } else {
        destinoMarkerRef.current.setLatLng(destinoCoords);
      }
    } else if (destinoMarkerRef.current) {
      map.removeLayer(destinoMarkerRef.current);
      destinoMarkerRef.current = null;
    }

    if (origemCoords && destinoCoords) {
      fetchCarRoute(origemCoords, destinoCoords).then((result) => {
        if (!mapRef.current) return;
        if (routeLineRef.current) {
          mapRef.current.removeLayer(routeLineRef.current);
          routeLineRef.current = null;
        }
        const routeCoords = result ? result.coords : [origemCoords, destinoCoords];
        routeLineRef.current = L.polyline(routeCoords, {
          color: "#3b82f6",
          weight: 4,
          opacity: 0.8,
        }).addTo(mapRef.current);
        mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [30, 30] });

        if (result) {
          onDistanceChange(result.distanceKm);
          const mins = result.durationMin;
          onTimeChange(mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}min`);
        }
      });
    } else if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
  }, [origemCoords, destinoCoords, onDistanceChange, onTimeChange]);

  // Distance/time now calculated from OSRM route in the effect above

  return (
    <div className="rounded-xl overflow-hidden border border-border/50 shadow-lg">
      <div className="h-[280px] sm:h-[320px] relative">
        <div ref={mapContainerRef} className="h-full w-full" />
        <div className="absolute top-3 left-3 z-[1000] bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium border border-border/50">
          Clique para selecionar: <span className={selectingMode === "origem" ? "text-green-success" : "text-destructive"}>{selectingMode === "origem" ? "📍 Origem" : "🏁 Destino"}</span>
        </div>
      </div>
    </div>
  );
}
