import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Sparkles, Route, Settings, Sliders, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteInputs } from "@/components/RouteInputs";
import { RideConfig } from "@/components/RideConfig";
import { ExtrasConfig } from "@/components/ExtrasConfig";
import { ResultCard } from "@/components/ResultCard";
import { Corrida, calcularCorrida } from "@/lib/corrida";

const tabs = [
  { id: "rota", label: "Rota", icon: Route },
  { id: "config", label: "Config", icon: Settings },
  { id: "extras", label: "Extras", icon: Sliders },
] as const;

type TabId = typeof tabs[number]["id"];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("rota");
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

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
  };

  const tabIndex = tabs.findIndex(t => t.id === activeTab);
  const [direction, setDirection] = useState(0);

  const handleTabChange = (id: TabId) => {
    const newIndex = tabs.findIndex(t => t.id === id);
    setDirection(newIndex > tabIndex ? 1 : -1);
    setActiveTab(id);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>

      {/* App Header — compact status bar style */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 backdrop-blur-2xl bg-background/80 border-b border-border/20"
      >
        <div className="max-w-lg mx-auto flex items-center justify-between py-2.5 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
              <Car className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-bold font-['Space_Grotesk'] tracking-tight">MALACA DRIVE</h1>
          </div>
          <motion.div
            key={breakdown.total}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5"
          >
            <p className="text-sm font-bold text-gradient font-['Space_Grotesk'] leading-none">
              {breakdown.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </motion.div>
        </div>
      </motion.header>

      {/* Scrollable content area */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-lg mx-auto px-4 py-4 pb-40">
          <AnimatePresence mode="wait" custom={direction}>
            {!showResult ? (
              <motion.div
                key={activeTab}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeTab === "rota" && (
                  <RouteInputs
                    origem={origem} destino={destino}
                    distanciaKm={distanciaKm} tempoEstimado={tempoEstimado}
                    onOrigemChange={setOrigem} onDestinoChange={setDestino}
                    onDistanciaChange={setDistanciaKm} onTempoChange={setTempoEstimado}
                  />
                )}
                {activeTab === "config" && (
                  <RideConfig
                    passageirosTipo={passageirosTipo} feiraTipo={feiraTipo} animalTipo={animalTipo}
                    onPassageirosChange={setPassageirosTipo} onFeiraChange={setFeiraTipo} onAnimalChange={setAnimalTipo}
                  />
                )}
                {activeTab === "extras" && (
                  <ExtrasConfig
                    temEspera={temEspera} minutosEspera={minutosEspera}
                    temParadas={temParadas} paradas={paradas}
                    onTemEsperaChange={setTemEspera} onMinutosEsperaChange={setMinutosEspera}
                    onTemParadasChange={setTemParadas} onParadasChange={setParadas}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ y: 30, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                <ResultCard corrida={corrida} breakdown={breakdown} />
                <Button
                  variant="outline"
                  onClick={() => setShowResult(false)}
                  className="w-full rounded-2xl border-border/40 hover:border-primary/40 transition-all duration-300"
                >
                  Editar corrida
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom bar — app-like navigation + CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Calculate FAB */}
        <AnimatePresence>
          {!showResult && canCalculate && (
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-lg mx-auto px-4 mb-2"
            >
              <Button
                onClick={() => setShowResult(true)}
                size="lg"
                className="w-full btn-glow gap-2.5 text-base py-5 font-semibold rounded-2xl shadow-2xl shadow-primary/30"
              >
                <Sparkles className="w-5 h-5" />
                Calcular Corrida
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab bar */}
        {!showResult && (
          <div className="backdrop-blur-2xl bg-background/80 border-t border-border/20">
            <div className="max-w-lg mx-auto flex items-center justify-around py-1.5 px-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    whileTap={{ scale: 0.92 }}
                    className={`flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-xl transition-all duration-300 relative ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute inset-0 bg-primary/10 rounded-xl"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <tab.icon className="w-5 h-5 relative z-10" />
                    <span className="text-[10px] font-medium relative z-10">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
            {/* Safe area spacer for notched devices */}
            <div className="h-[env(safe-area-inset-bottom,0px)]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
