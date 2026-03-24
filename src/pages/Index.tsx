import { useState, useMemo } from "react";
import { Car, Calculator } from "lucide-react";
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
    origem,
    destino,
    distancia_km: distanciaKm,
    tempo_estimado: tempoEstimado,
    passageiros_tipo: passageirosTipo,
    feira_tipo: feiraTipo,
    animal_tipo: animalTipo,
    minutos_espera: minutosEspera,
    tem_espera: temEspera,
    paradas,
    tem_paradas: temParadas,
  };

  const breakdown = useMemo(() => calcularCorrida(corrida), [
    distanciaKm, passageirosTipo, feiraTipo, animalTipo,
    temEspera, minutosEspera, temParadas, paradas,
  ]);

  const canCalculate = origem && destino && distanciaKm > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container max-w-lg mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold font-['Space_Grotesk'] leading-none">MALACA DRIVE</h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Calculadora de Corridas</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Total</span>
            <p className="text-lg font-bold text-gradient font-['Space_Grotesk'] leading-none">
              {breakdown.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 py-5 space-y-4 pb-24">
        <RouteInputs
          origem={origem}
          destino={destino}
          distanciaKm={distanciaKm}
          tempoEstimado={tempoEstimado}
          onOrigemChange={setOrigem}
          onDestinoChange={setDestino}
          onDistanciaChange={setDistanciaKm}
          onTempoChange={setTempoEstimado}
        />

        <RideConfig
          passageirosTipo={passageirosTipo}
          feiraTipo={feiraTipo}
          animalTipo={animalTipo}
          onPassageirosChange={setPassageirosTipo}
          onFeiraChange={setFeiraTipo}
          onAnimalChange={setAnimalTipo}
        />

        <ExtrasConfig
          temEspera={temEspera}
          minutosEspera={minutosEspera}
          temParadas={temParadas}
          paradas={paradas}
          onTemEsperaChange={setTemEspera}
          onMinutosEsperaChange={setMinutosEspera}
          onTemParadasChange={setTemParadas}
          onParadasChange={setParadas}
        />

        {/* Calculate button */}
        {!showResult && (
          <Button
            onClick={() => setShowResult(true)}
            disabled={!canCalculate}
            size="lg"
            className="w-full btn-glow gap-2 text-base py-6 font-semibold"
          >
            <Calculator className="w-5 h-5" />
            Calcular Corrida
          </Button>
        )}

        {/* Result */}
        {showResult && canCalculate && (
          <ResultCard corrida={corrida} breakdown={breakdown} />
        )}

        {showResult && (
          <Button
            variant="outline"
            onClick={() => setShowResult(false)}
            className="w-full"
          >
            Editar corrida
          </Button>
        )}
      </main>
    </div>
  );
};

export default Index;
