import { MapPin, Navigation, Route, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  return (
    <div className="glass-card p-5 space-y-4 animate-fade-in">
      <h2 className="text-lg font-semibold flex items-center gap-2 font-['Space_Grotesk']">
        <Route className="w-5 h-5 text-blue-accent" />
        Rota da Corrida
      </h2>

      <div className="space-y-3">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-success" />
          <Input
            placeholder="Origem (endereço de partida)"
            value={origem}
            onChange={(e) => onOrigemChange(e.target.value)}
            className="pl-10 bg-secondary border-border/50 focus:border-blue-accent placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="relative">
          <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
          <Input
            placeholder="Destino (endereço de chegada)"
            value={destino}
            onChange={(e) => onDestinoChange(e.target.value)}
            className="pl-10 bg-secondary border-border/50 focus:border-blue-accent placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Route className="w-3 h-3" /> Distância (KM)
          </label>
          <Input
            type="number"
            min={0}
            step={0.1}
            placeholder="0.0"
            value={distanciaKm || ''}
            onChange={(e) => onDistanciaChange(parseFloat(e.target.value) || 0)}
            className="bg-secondary border-border/50 focus:border-blue-accent"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Tempo estimado
          </label>
          <Input
            placeholder="Ex: 25 min"
            value={tempoEstimado}
            onChange={(e) => onTempoChange(e.target.value)}
            className="bg-secondary border-border/50 focus:border-blue-accent"
          />
        </div>
      </div>
    </div>
  );
}
