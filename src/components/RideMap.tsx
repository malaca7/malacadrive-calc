import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadow,
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

interface MapClickHandlerProps {
  selectingMode: 'origem' | 'destino';
  onSelect: (lat: number, lng: number) => void;
}

function MapClickHandler({ selectingMode, onSelect }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface RideMapProps {
  selectingMode: 'origem' | 'destino';
  origemCoords: [number, number] | null;
  destinoCoords: [number, number] | null;
  onSelect: (lat: number, lng: number) => void;
  onOrigemAddress: (addr: string) => void;
  onDestinoAddress: (addr: string) => void;
  onDistanceChange: (km: number) => void;
  onTimeChange: (time: string) => void;
}

export function RideMap({
  selectingMode, origemCoords, destinoCoords, onSelect,
  onOrigemAddress, onDestinoAddress, onDistanceChange, onTimeChange,
}: RideMapProps) {
  const handleSelect = useCallback(async (lat: number, lng: number) => {
    onSelect(lat, lng);
    const address = await reverseGeocode(lat, lng);
    if (selectingMode === 'origem') {
      onOrigemAddress(address);
    } else {
      onDestinoAddress(address);
    }
  }, [selectingMode, onSelect, onOrigemAddress, onDestinoAddress]);

  // Calculate distance when both points exist
  useEffect(() => {
    if (origemCoords && destinoCoords) {
      const dist = haversineDistance(origemCoords[0], origemCoords[1], destinoCoords[0], destinoCoords[1]);
      // Multiply by 1.3 for road factor approximation
      const roadDist = Math.round(dist * 1.3 * 10) / 10;
      onDistanceChange(roadDist);
      onTimeChange(estimateTime(roadDist));
    }
  }, [origemCoords, destinoCoords, onDistanceChange, onTimeChange]);

  const center: [number, number] = origemCoords || [-23.55, -46.63]; // São Paulo default

  return (
    <div className="rounded-xl overflow-hidden border border-border/50 shadow-lg">
      <div className="h-[280px] sm:h-[320px] relative">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapClickHandler selectingMode={selectingMode} onSelect={handleSelect} />

          {origemCoords && (
            <Marker position={origemCoords} icon={greenIcon}>
              <Popup>Origem</Popup>
            </Marker>
          )}
          {destinoCoords && (
            <Marker position={destinoCoords} icon={redIcon}>
              <Popup>Destino</Popup>
            </Marker>
          )}
          {origemCoords && destinoCoords && (
            <Polyline
              positions={[origemCoords, destinoCoords]}
              pathOptions={{ color: "#3b82f6", weight: 3, dashArray: "8 8" }}
            />
          )}
        </MapContainer>

        {/* Mode indicator */}
        <div className="absolute top-3 left-3 z-[1000] bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium border border-border/50">
          Clique para selecionar: <span className={selectingMode === 'origem' ? 'text-green-success' : 'text-destructive'}>{selectingMode === 'origem' ? '📍 Origem' : '🏁 Destino'}</span>
        </div>
      </div>
    </div>
  );
}
