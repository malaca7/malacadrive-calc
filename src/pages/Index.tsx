import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Calculator, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteInputs } from "@/components/RouteInputs";
import { RideConfig } from "@/components/RideConfig";
import { ExtrasConfig } from "@/components/ExtrasConfig";
import { ResultCard } from "@/components/ResultCard";
import { Corrida, calcularCorrida } from "@/lib/corrida";

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 backdrop-blur-2xl bg-background/70 border-b border-border/30"
      >
        <div className="container max-w-lg mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold font-['Space_Grotesk'] leading-none tracking-tight">MALACA DRIVE</h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5 tracking-wider uppercase">Calculadora de Corridas</p>
            </div>
          </div>
          <motion.div
            key={breakdown.total}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-right"
          >
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</span>
            <p className="text-lg font-bold text-gradient font-['Space_Grotesk'] leading-none">
              {breakdown.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </motion.div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-5 pb-24 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <RouteInputs
            origem={origem} destino={destino}
            distanciaKm={distanciaKm} tempoEstimado={tempoEstimado}
            onOrigemChange={setOrigem} onDestinoChange={setDestino}
            onDistanciaChange={setDistanciaKm} onTempoChange={setTempoEstimado}
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <RideConfig
            passageirosTipo={passageirosTipo} feiraTipo={feiraTipo} animalTipo={animalTipo}
            onPassageirosChange={setPassageirosTipo} onFeiraChange={setFeiraTipo} onAnimalChange={setAnimalTipo}
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <ExtrasConfig
            temEspera={temEspera} minutosEspera={minutosEspera}
            temParadas={temParadas} paradas={paradas}
            onTemEsperaChange={setTemEspera} onMinutosEsperaChange={setMinutosEspera}
            onTemParadasChange={setTemParadas} onParadasChange={setParadas}
          />
        </motion.div>

        {/* Calculate button */}
        <AnimatePresence mode="wait">
          {!showResult && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button
                onClick={() => setShowResult(true)}
                disabled={!canCalculate}
                size="lg"
                className="w-full btn-glow gap-2.5 text-base py-6 font-semibold rounded-2xl"
              >
                <Sparkles className="w-5 h-5" />
                Calcular Corrida
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {showResult && canCalculate && (
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <ResultCard corrida={corrida} breakdown={breakdown} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
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
      </main>
    </div>
  );
};

export default Index;
