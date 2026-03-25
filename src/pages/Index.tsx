import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RideMap } from "@/components/RideMap";
import { AddressSearch } from "@/components/AddressSearch";
import { RideConfig } from "@/components/RideConfig";
import { ExtrasConfig } from "@/components/ExtrasConfig";
import { ResultCard } from "@/components/ResultCard";
import { Corrida, calcularCorrida, formatarMoeda } from "@/lib/corrida";
import { Route, Clock, ArrowRightLeft } from "lucide-react";

const Index = () => {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [distanciaKm, setDistanciaKm] = useState(0);
  const [tempoEstimado, setTempoEstimado] = useState("");
  const [origemCoords, setOrigemCoords] = useState<[number, number] | null>(null);
  const [destinoCoords, setDestinoCoords] = useState<[number, number] | null>(null);
  const [selectingMode, setSelectingMode] = useState<'origem' | 'destino'>('origem');
  const [passageirosTipo, setPassageirosTipo] = useState<'4' | '6'>('4');
  const [feiraTipo, setFeiraTipo] = useState<'nao' | '1' | '2+'>('nao');
  const [animalTipo, setAnimalTipo] = useState<'nao' | 'pequeno' | 'medio' | 'grande'>('nao');
  const [temEspera, setTemEspera] = useState(false);
  const [minutosEspera, setMinutosEspera] = useState(0);
  const [temParadas, setTemParadas] = useState(false);
  const [paradas, setParadas] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState<'route' | 'config' | 'extras'>('route');

  const corrida: Corrida = {
    origem, destino,
    distancia_km: distanciaKm,
    tempo_estimado: tempoEstimado,
    passageiros_tipo: passageirosTipo,
    feira_tipo: feiraTipo,
    animal_tipo: animalTipo,
    minutos_espera: minutosEspera,
    tem_espera: temEspera,
    paradas, tem_paradas: temParadas,
  };

  const breakdown = useMemo(() => calcularCorrida(corrida), [
    distanciaKm, passageirosTipo, feiraTipo, animalTipo,
    temEspera, minutosEspera, temParadas, paradas,
  ]);

  const canCalculate = origem && destino && distanciaKm > 0;

  const handleOrigemSearch = useCallback((lat: number, lng: number, address: string) => {
    setOrigemCoords([lat, lng]);
    setOrigem(address);
    if (!destinoCoords) setSelectingMode('destino');
  }, [destinoCoords]);

  const handleDestinoSearch = useCallback((lat: number, lng: number, address: string) => {
    setDestinoCoords([lat, lng]);
    setDestino(address);
  }, []);

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
    const tmp = origem;
    setOrigem(destino);
    setDestino(tmp);
  };

  const handleClearOrigem = () => {
    setOrigemCoords(null);
    setOrigem("");
    setDistanciaKm(0);
    setTempoEstimado("");
    setSelectingMode('origem');
  };

  const handleClearDestino = () => {
    setDestinoCoords(null);
    setDestino("");
    setDistanciaKm(0);
    setTempoEstimado("");
    setSelectingMode('destino');
  };

  const hasRoute = origemCoords && destinoCoords;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
            <span className="text-background text-xs font-bold">M</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Malaca Drive</span>
        </div>
        <AnimatePresence mode="wait">
          {canCalculate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-foreground text-background rounded-full px-4 py-1.5"
            >
              <span className="text-sm font-bold">{formatarMoeda(breakdown.total)}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map area */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <RideMap
            selectingMode={selectingMode}
            origemCoords={origemCoords}
            destinoCoords={destinoCoords}
            onSelect={handleMapSelect}
            onOrigemAddress={setOrigem}
            onDestinoAddress={setDestino}
            onDistanceChange={setDistanciaKm}
            onTimeChange={setTempoEstimado}
            fullscreen
          />
        </div>
      </div>

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="relative z-30 bg-background rounded-t-3xl"
        style={{ maxHeight: sheetExpanded ? '65vh' : 'auto' }}
      >
        <button
          onClick={() => setSheetExpanded(!sheetExpanded)}
          className="w-full flex justify-center py-3"
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </button>

        <div className={`px-5 pb-6 ${sheetExpanded ? 'overflow-y-auto' : ''}`}
          style={{ maxHeight: sheetExpanded ? 'calc(65vh - 40px)' : 'auto' }}
        >
          <AnimatePresence mode="wait">
            {showResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <ResultCard corrida={corrida} breakdown={breakdown} />
                <Button
                  variant="outline"
                  onClick={() => setShowResult(false)}
                  className="w-full h-12 rounded-xl border-border/50 text-sm font-medium"
                >
                  Editar corrida
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Route inputs */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center py-3">
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
                    {hasRoute && (
                      <button
                        onClick={handleSwapRoute}
                        className="self-center p-2 rounded-full bg-secondary hover:bg-muted transition-colors"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>

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

                {/* Section pills */}
                <div className="flex gap-2">
                  {[
                    { id: 'config' as const, label: 'Veículo', icon: Settings },
                    { id: 'extras' as const, label: 'Extras', icon: Sliders },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveSection(activeSection === id ? 'route' : id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                        activeSection === id
                          ? 'bg-foreground text-background'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeSection === 'config' && (
                    <motion.div
                      key="config"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <RideConfig
                        passageirosTipo={passageirosTipo} feiraTipo={feiraTipo} animalTipo={animalTipo}
                        onPassageirosChange={setPassageirosTipo} onFeiraChange={setFeiraTipo} onAnimalChange={setAnimalTipo}
                      />
                    </motion.div>
                  )}
                  {activeSection === 'extras' && (
                    <motion.div
                      key="extras"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <ExtrasConfig
                        temEspera={temEspera} minutosEspera={minutosEspera}
                        temParadas={temParadas} paradas={paradas}
                        onTemEsperaChange={setTemEspera} onMinutosEsperaChange={setMinutosEspera}
                        onTemParadasChange={setTemParadas} onParadasChange={setParadas}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  onClick={() => setShowResult(true)}
                  disabled={!canCalculate}
                  size="lg"
                  className="w-full h-14 rounded-2xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground transition-all duration-200"
                >
                  {canCalculate
                    ? `Calcular — ${formatarMoeda(breakdown.total)}`
                    : 'Para onde vamos?'
                  }
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </motion.div>
    </div>
  );
};

export default Index;
