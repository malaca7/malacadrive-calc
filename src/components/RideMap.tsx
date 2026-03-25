import { useCallback, useEffect, useRef, useState } from "react";
import L, { type LeafletMouseEvent, type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const MARKER_SHADOW = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const originIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#fff;border:3px solid #000;box-shadow:0 0 0 3px rgba(0,0,0,0.1)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const destIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:2px;background:#000;border:2px solid #fff;box-shadow:0 0 0 3px rgba(0,0,0,0.1)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

async function fetchCarRoute(origin: [number, number], dest: [number, number]) {
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
  fullscreen?: boolean;
}

export function RideMap({
  selectingMode, origemCoords, destinoCoords,
  onSelect, onOrigemAddress, onDestinoAddress, onDistanceChange, onTimeChange,
  fullscreen,
}: RideMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const origemMarkerRef = useRef<L.Marker | null>(null);
  const destinoMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const handleSelect = useCallback(async (lat: number, lng: number) => {
    onSelect(lat, lng);
    const address = await reverseGeocode(lat, lng);
    if (selectingMode === "origem") {
      onOrigemAddress(address);
    } else {
      onDestinoAddress(address);
    }
  }, [selectingMode, onSelect, onOrigemAddress, onDestinoAddress]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([-8.2835, -35.0253], 14);

    // Uber uses a clean dark map style
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
    return () => { map.off("click", onMapClick); };
  }, [handleSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (origemCoords) {
      if (!origemMarkerRef.current) {
        origemMarkerRef.current = L.marker(origemCoords, { icon: originIcon }).addTo(map);
      } else {
        origemMarkerRef.current.setLatLng(origemCoords);
      }
    } else if (origemMarkerRef.current) {
      map.removeLayer(origemMarkerRef.current);
      origemMarkerRef.current = null;
    }

    if (destinoCoords) {
      if (!destinoMarkerRef.current) {
        destinoMarkerRef.current = L.marker(destinoCoords, { icon: destIcon }).addTo(map);
      } else {
        destinoMarkerRef.current.setLatLng(destinoCoords);
      }
    } else if (destinoMarkerRef.current) {
      map.removeLayer(destinoMarkerRef.current);
      destinoMarkerRef.current = null;
    }

    if (origemCoords && destinoCoords) {
      setLoadingRoute(true);
      fetchCarRoute(origemCoords, destinoCoords).then((result) => {
        if (!mapRef.current) return;
        if (routeLineRef.current) {
          mapRef.current.removeLayer(routeLineRef.current);
          routeLineRef.current = null;
        }
        const routeCoords = result ? result.coords : [origemCoords, destinoCoords];
        
        // Shadow line
        L.polyline(routeCoords, {
          color: "#000",
          weight: 8,
          opacity: 0.15,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(mapRef.current!);

        // Main route line
        routeLineRef.current = L.polyline(routeCoords, {
          color: "#ffffff",
          weight: 4,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(mapRef.current!);

        mapRef.current!.fitBounds(routeLineRef.current.getBounds(), { padding: [60, 60] });

        if (result) {
          onDistanceChange(result.distanceKm);
          const mins = result.durationMin;
          onTimeChange(mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}min`);
        }
        setLoadingRoute(false);
      });
    } else if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
  }, [origemCoords, destinoCoords, onDistanceChange, onTimeChange]);

  return (
    <div className={`relative ${fullscreen ? 'h-full w-full' : 'h-[280px] rounded-2xl overflow-hidden'}`}>
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Mode indicator - minimal */}
      <motion.div
        key={selectingMode}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 z-[1000] bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-2"
      >
        <span className={`w-2 h-2 ${selectingMode === "origem" ? "rounded-full bg-foreground" : "rounded-sm bg-foreground"}`} />
        {selectingMode === "origem" ? "Toque para origem" : "Toque para destino"}
      </motion.div>

      {/* Loading */}
      <AnimatePresence>
        {loadingRoute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 z-[1000] bg-foreground text-background rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-2"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            Traçando rota
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient */}
      {fullscreen && (
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-[500]" />
      )}
    </div>
  );
}
