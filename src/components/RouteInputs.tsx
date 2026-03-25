import { MapPin, Navigation, Route, Clock, ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RideMap } from "@/components/RideMap";
import { AddressSearch } from "@/components/AddressSearch";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="glass-card p-5 space-y-4">
      <h2 className="text-base font-semibold flex items-center gap-2 font-['Space_Grotesk'] tracking-tight">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Route className="w-4 h-4 text-primary" />
        </div>
        Rota da Corrida
      </h2>

      {/* Search inputs with swap button */}
      <div className="relative space-y-2">
        {/* Connecting line */}
        <div className="absolute left-[22px] top-[22px] w-[2px] h-[calc(100%-44px)] bg-gradient-to-b from-green-500/40 via-border/30 to-red-500/40 z-0 rounded-full" />

        <AddressSearch
          placeholder="Pesquisar origem..."
          value={origem}
          icon={<MapPin className="w-4 h-4 text-green-500" />}
          onSelect={handleOrigemSearch}
          onClear={handleClearOrigem}
        />

        {/* Swap button */}
        {hasRoute && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center -my-1 relative z-10"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSwapRoute}
              className="h-7 w-7 p-0 rounded-full bg-secondary/80 hover:bg-primary/20 border border-border/40 hover:border-primary/40 transition-all"
            >
              <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
            </Button>
          </motion.div>
        )}

        <AddressSearch
          placeholder="Pesquisar destino..."
          value={destino}
          icon={<Navigation className="w-4 h-4 text-red-500" />}
          onSelect={handleDestinoSearch}
          onClear={handleClearDestino}
        />
      </div>

      {/* Map and stats */}
      <AnimatePresence mode="wait">
        {hasRoute ? (
          <motion.div
            key="map-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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

            <AnimatePresence>
              {distanciaKm > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-center gap-6 text-sm bg-primary/8 border border-primary/15 rounded-xl p-3.5"
                >
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 font-semibold"
                  >
                    <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Route className="w-3.5 h-3.5 text-primary" />
                    </div>
                    {distanciaKm} km
                  </motion.span>
                  <div className="w-px h-5 bg-border/50" />
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-2 font-semibold"
                  >
                    <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                    </div>
                    {tempoEstimado}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-8 gap-3"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center"
            >
              <MapPin className="w-6 h-6 text-primary/50" />
            </motion.div>
            <p className="text-xs text-muted-foreground text-center opacity-70">
              Pesquise origem e destino para traçar a rota
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
