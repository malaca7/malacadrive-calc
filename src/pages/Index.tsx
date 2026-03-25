import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Route, Settings, Sliders, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteInputs } from "@/components/RouteInputs";
import { RideConfig } from "@/components/RideConfig";
import { ExtrasConfig } from "@/components/ExtrasConfig";
import { ResultCard } from "@/components/ResultCard";
import { Corrida, calcularCorrida, formatarMoeda } from "@/lib/corrida";

const Index = () => {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [distanciaKm, setDistanciaKm] = useState(0);
  const [tempoEstimado, setTempoEstimado] = useState("");
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

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top bar - minimal like Uber */}
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

      {/* Map area - takes remaining space behind the sheet */}
      <div className="flex-1 relative">
        <RouteInputs
          origem={origem} destino={destino}
          distanciaKm={distanciaKm} tempoEstimado={tempoEstimado}
          onOrigemChange={setOrigem} onDestinoChange={setDestino}
          onDistanciaChange={setDistanciaKm} onTempoChange={setTempoEstimado}
          mapOnly
        />
      </div>

      {/* Bottom sheet - Uber style */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="relative z-30 bg-background rounded-t-3xl"
        style={{ maxHeight: sheetExpanded ? '70vh' : 'auto' }}
      >
        {/* Drag handle */}
        <button
          onClick={() => setSheetExpanded(!sheetExpanded)}
          className="w-full flex justify-center py-3"
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </button>

        <div className={`px-5 pb-6 ${sheetExpanded ? 'overflow-y-auto' : ''}`}
          style={{ maxHeight: sheetExpanded ? 'calc(70vh - 40px)' : 'auto' }}
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
                <RouteInputs
                  origem={origem} destino={destino}
                  distanciaKm={distanciaKm} tempoEstimado={tempoEstimado}
                  onOrigemChange={setOrigem} onDestinoChange={setDestino}
                  onDistanciaChange={setDistanciaKm} onTempoChange={setTempoEstimado}
                  inputsOnly
                />

                {/* Section pills - Uber style */}
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

                {/* Expandable sections */}
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

                {/* CTA Button */}
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

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </motion.div>
    </div>
  );
};

export default Index;
