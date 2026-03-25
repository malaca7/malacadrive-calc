import { useCallback, useEffect, useRef, useState } from "react";
import L, { type LeafletMouseEvent, type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Navigation } from "lucide-react";

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
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: MARKER_SHADOW,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
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
}

export function RideMap({
  selectingMode, origemCoords, destinoCoords,
  onSelect, onOrigemAddress, onDestinoAddress, onDistanceChange, onTimeChange,
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

    L.control.zoom({ position: "bottomright" }).addTo(map);
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
        origemMarkerRef.current = L.marker(origemCoords, { icon: greenIcon }).bindPopup("Origem").addTo(map);
      } else {
        origemMarkerRef.current.setLatLng(origemCoords);
      }
    } else if (origemMarkerRef.current) {
      map.removeLayer(origemMarkerRef.current);
      origemMarkerRef.current = null;
    }

    if (destinoCoords) {
      if (!destinoMarkerRef.current) {
        destinoMarkerRef.current = L.marker(destinoCoords, { icon: redIcon }).bindPopup("Destino").addTo(map);
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
        routeLineRef.current = L.polyline(routeCoords, {
          color: "hsl(217, 91%, 60%)",
          weight: 5,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(mapRef.current);

        // Add animated dash effect
        const decoratorLine = L.polyline(routeCoords, {
          color: "hsl(210, 100%, 70%)",
          weight: 2,
          opacity: 0.4,
          dashArray: "8, 16",
          lineCap: "round",
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [40, 40] });

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
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden border border-border/40 shadow-2xl shadow-black/30 glow-border relative"
    >
      <div className="h-[300px] sm:h-[360px] relative">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Mode indicator */}
        <motion.div
          key={selectingMode}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute top-3 left-3 z-[1000] bg-card/80 backdrop-blur-xl rounded-xl px-3 py-2 text-xs font-medium border border-border/40 flex items-center gap-2"
        >
          <span className={`w-2 h-2 rounded-full ${selectingMode === "origem" ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-red-500 shadow-lg shadow-red-500/50"} animate-pulse`} />
          {selectingMode === "origem" ? "📍 Selecionando Origem" : "🏁 Selecionando Destino"}
        </motion.div>

        {/* Loading route indicator */}
        <AnimatePresence>
          {loadingRoute && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-3 right-3 z-[1000] bg-primary/90 backdrop-blur-xl rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-2 text-primary-foreground"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Traçando rota...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/60 to-transparent pointer-events-none z-[500]" />
      </div>
    </motion.div>
  );
}
