import { MapPin, Navigation, Route, Clock, Search } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="glass-card p-5 space-y-4">
      <h2 className="text-base font-semibold flex items-center gap-2 font-['Space_Grotesk'] tracking-tight">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Route className="w-4 h-4 text-primary" />
        </div>
        Rota da Corrida
      </h2>

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

      {origemCoords && destinoCoords && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
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

          {distanciaKm > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4 text-sm bg-primary/8 border border-primary/15 rounded-xl p-3"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Route className="w-4 h-4 text-primary" /> {distanciaKm} km
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-primary" /> {tempoEstimado}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}

      {(!origemCoords || !destinoCoords) && (
        <p className="text-xs text-muted-foreground text-center py-5 opacity-60">
          <Search className="w-3 h-3 inline mr-1" />
          Pesquise origem e destino para ver a rota no mapa
        </p>
      )}
    </div>
  );
}
