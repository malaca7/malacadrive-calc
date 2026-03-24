import { Clock, MapPinned } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface ExtrasConfigProps {
  temEspera: boolean;
  minutosEspera: number;
  temParadas: boolean;
  paradas: number;
  onTemEsperaChange: (v: boolean) => void;
  onMinutosEsperaChange: (v: number) => void;
  onTemParadasChange: (v: boolean) => void;
  onParadasChange: (v: number) => void;
}

export function ExtrasConfig({
  temEspera, minutosEspera, temParadas, paradas,
  onTemEsperaChange, onMinutosEsperaChange, onTemParadasChange, onParadasChange,
}: ExtrasConfigProps) {
  return (
    <div className="glass-card p-5 space-y-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-lg font-semibold flex items-center gap-2 font-['Space_Grotesk']">
        <Clock className="w-5 h-5 text-blue-accent" />
        Extras
      </h2>

      {/* Tempo de espera */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Tempo de espera
            <span className="text-xs opacity-60">(R$ 0,50/min)</span>
          </label>
          <Switch checked={temEspera} onCheckedChange={onTemEsperaChange} />
        </div>
        {temEspera && (
          <Input
            type="number"
            min={0}
            placeholder="Minutos de espera"
            value={minutosEspera || ''}
            onChange={(e) => onMinutosEsperaChange(parseInt(e.target.value) || 0)}
            className="bg-secondary border-border/50 focus:border-blue-accent animate-fade-in"
          />
        )}
      </div>

      {/* Paradas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground flex items-center gap-1.5">
            <MapPinned className="w-3.5 h-3.5" /> Paradas no trajeto
            <span className="text-xs opacity-60">(R$ 5,00/parada)</span>
          </label>
          <Switch checked={temParadas} onCheckedChange={onTemParadasChange} />
        </div>
        {temParadas && (
          <Input
            type="number"
            min={0}
            placeholder="Quantidade de paradas"
            value={paradas || ''}
            onChange={(e) => onParadasChange(parseInt(e.target.value) || 0)}
            className="bg-secondary border-border/50 focus:border-blue-accent animate-fade-in"
          />
        )}
      </div>
    </div>
  );
}
