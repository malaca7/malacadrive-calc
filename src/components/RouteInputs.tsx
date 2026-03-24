import { MapPin, Navigation, Route, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RideMap } from "@/components/RideMap";
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
  const [selectingMode, setSelectingMode] = useState<'origem' | 'destino'>('origem');
  const [origemCoords, setOrigemCoords] = useState<[number, number] | null>(null);
  const [destinoCoords, setDestinoCoords] = useState<[number, number] | null>(null);

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

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={selectingMode === 'origem' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setSelectingMode('origem')}
          className="gap-1.5 text-xs"
        >
          <MapPin className="w-3.5 h-3.5" /> Selecionar Origem
        </Button>
        <Button
          variant={selectingMode === 'destino' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setSelectingMode('destino')}
          className="gap-1.5 text-xs"
        >
          <Navigation className="w-3.5 h-3.5" /> Selecionar Destino
        </Button>
      </div>

      {/* Map */}
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

      {/* Address displays */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-sm bg-secondary/50 rounded-lg p-2.5">
          <MapPin className="w-4 h-4 text-green-success flex-shrink-0 mt-0.5" />
          <span className={origem ? 'text-foreground' : 'text-muted-foreground/50'}>
            {origem || 'Clique no mapa para definir a origem'}
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm bg-secondary/50 rounded-lg p-2.5">
          <Navigation className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <span className={destino ? 'text-foreground' : 'text-muted-foreground/50'}>
            {destino || 'Clique no mapa para definir o destino'}
          </span>
        </div>
      </div>

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
