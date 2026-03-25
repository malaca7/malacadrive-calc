import { MapPin, Navigation, Route, Clock, Search } from "lucide-react";
import { RideMap } from "@/components/RideMap";
import { AddressSearch } from "@/components/AddressSearch";
import { useState, useCallback } from "react";

interface RouteInputsProps {
  origem: string;
  destino: string;
  distanciaKm: number;
  tempoEstimado: string;
  onOrigemChange: (v: string) => void;
  onDestinoChange: (v: string) => void;
  onDistanciaChange: (v: number) => void;
  onTempoChange: (v: string) => void;
}

export function RouteInputs({
  origem, destino, distanciaKm, tempoEstimado,
  onOrigemChange, onDestinoChange, onDistanciaChange, onTempoChange,
}: RouteInputsProps) {
  const [origemCoords, setOrigemCoords] = useState<[number, number] | null>(null);
  const [destinoCoords, setDestinoCoords] = useState<[number, number] | null>(null);
  const [selectingMode, setSelectingMode] = useState<'origem' | 'destino'>('origem');

  const handleOrigemSearch = useCallback((lat: number, lng: number, address: string) => {
    setOrigemCoords([lat, lng]);
    onOrigemChange(address);
    if (!destinoCoords) setSelectingMode('destino');
  }, [onOrigemChange, destinoCoords]);

  const handleDestinoSearch = useCallback((lat: number, lng: number, address: string) => {
    setDestinoCoords([lat, lng]);
    onDestinoChange(address);
  }, [onDestinoChange]);

  const handleMapSelect = useCallback((lat: number, lng: number) => {
    if (selectingMode === 'origem') {
      setOrigemCoords([lat, lng]);
      setSelectingMode('destino');
    } else {
      setDestinoCoords([lat, lng]);
      setSelectingMode('origem');
    }
  }, [selectingMode]);

  return (
    <div className="glass-card p-5 space-y-4 animate-fade-in">
      <h2 className="text-lg font-semibold flex items-center gap-2 font-['Space_Grotesk']">
        <Route className="w-5 h-5 text-blue-accent" />
        Rota da Corrida
      </h2>

      {/* Search inputs */}
      <div className="space-y-2">
        <AddressSearch
          placeholder="Pesquisar origem..."
          value={origem}
          icon={<MapPin className="w-4 h-4 text-green-success" />}
          onSelect={handleOrigemSearch}
        />
        <AddressSearch
          placeholder="Pesquisar destino..."
          value={destino}
          icon={<Navigation className="w-4 h-4 text-destructive" />}
          onSelect={handleDestinoSearch}
        />
      </div>

      {/* Map - only show after both are selected */}
      {origemCoords && destinoCoords && (
        <>
          <RideMap
            selectingMode={selectingMode}
            origemCoords={origemCoords}
            destinoCoords={destinoCoords}
            onSelect={handleMapSelect}
            onOrigemAddress={onOrigemChange}
            onDestinoAddress={onDestinoChange}
            onDistanceChange={onDistanciaChange}
            onTimeChange={onTempoChange}
          />

          {/* Distance and time */}
          {distanciaKm > 0 && (
            <div className="flex items-center gap-4 text-sm bg-primary/10 border border-primary/20 rounded-lg p-3 animate-fade-in">
              <span className="flex items-center gap-1.5 font-medium">
                <Route className="w-4 h-4 text-blue-accent" /> {distanciaKm} km
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-blue-accent" /> {tempoEstimado}
              </span>
            </div>
          )}
        </>
      )}

      {(!origemCoords || !destinoCoords) && (
        <p className="text-xs text-muted-foreground text-center py-4">
          <Search className="w-3 h-3 inline mr-1" />
          Pesquise origem e destino para ver a rota no mapa
        </p>
      )}

      {/* Distance and time */}
      {distanciaKm > 0 && (
        <div className="flex items-center gap-4 text-sm bg-primary/10 border border-primary/20 rounded-lg p-3 animate-fade-in">
          <span className="flex items-center gap-1.5 font-medium">
            <Route className="w-4 h-4 text-blue-accent" /> {distanciaKm} km
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-blue-accent" /> {tempoEstimado}
          </span>
        </div>
      )}
    </div>
  );
}
