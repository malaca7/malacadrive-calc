import { MapPin, Navigation, Route, Clock, ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  mapOnly?: boolean;
  inputsOnly?: boolean;
}

export function RouteInputs({
  origem, destino, distanciaKm, tempoEstimado,
  onOrigemChange, onDestinoChange, onDistanciaChange, onTempoChange,
  mapOnly, inputsOnly,
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

  const handleSwapRoute = () => {
    setOrigemCoords(destinoCoords);
    setDestinoCoords(origemCoords);
    const tmpOrigem = origem;
    onOrigemChange(destino);
    onDestinoChange(tmpOrigem);
  };

  const handleClearOrigem = () => {
    setOrigemCoords(null);
    onOrigemChange("");
    onDistanciaChange(0);
    onTempoChange("");
    setSelectingMode('origem');
  };

  const handleClearDestino = () => {
    setDestinoCoords(null);
    onDestinoChange("");
    onDistanciaChange(0);
    onTempoChange("");
    setSelectingMode('destino');
  };

  const hasRoute = origemCoords && destinoCoords;

  // Map-only mode: renders just the map full-size
  if (mapOnly) {
    return (
      <div className="absolute inset-0">
        <RideMap
          selectingMode={selectingMode}
          origemCoords={origemCoords}
          destinoCoords={destinoCoords}
          onSelect={handleMapSelect}
          onOrigemAddress={onOrigemChange}
          onDestinoAddress={onDestinoChange}
          onDistanceChange={onDistanciaChange}
          onTimeChange={onTempoChange}
          fullscreen
        />
      </div>
    );
  }

  // Inputs-only mode: renders search fields for the bottom sheet
  if (inputsOnly) {
    return (
      <div className="space-y-3">
        {/* Uber-style address inputs */}
        <div className="flex gap-3">
          {/* Dot-line connector */}
          <div className="flex flex-col items-center py-3 gap-0">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            <div className="w-[2px] flex-1 bg-muted-foreground/30 my-1" />
            <div className="w-2 h-2 rounded-sm bg-foreground" />
          </div>

          <div className="flex-1 space-y-2">
            <AddressSearch
              placeholder="De onde?"
              value={origem}
              icon={<div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />}
              onSelect={handleOrigemSearch}
              onClear={handleClearOrigem}
            />
            <AddressSearch
              placeholder="Para onde?"
              value={destino}
              icon={<div className="w-1.5 h-1.5 rounded-sm bg-foreground" />}
              onSelect={handleDestinoSearch}
              onClear={handleClearDestino}
            />
          </div>

          {/* Swap button */}
          {hasRoute && (
            <button
              onClick={handleSwapRoute}
              className="self-center p-2 rounded-full bg-secondary hover:bg-muted transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Distance & time pills */}
        <AnimatePresence>
          {distanciaKm > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1.5">
                <Route className="w-3 h-3" /> {distanciaKm} km
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1.5">
                <Clock className="w-3 h-3" /> {tempoEstimado}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
