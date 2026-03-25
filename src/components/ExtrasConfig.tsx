import { Clock, MapPinned } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="glass-card p-5 space-y-5">
      <h2 className="text-base font-semibold flex items-center gap-2 font-['Space_Grotesk'] tracking-tight">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Clock className="w-4 h-4 text-primary" />
        </div>
        Extras
      </h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Tempo de espera
            <span className="text-[10px] opacity-50 ml-1">(R$ 0,50/min)</span>
          </label>
          <Switch checked={temEspera} onCheckedChange={onTemEsperaChange} />
        </div>
        <AnimatePresence>
          {temEspera && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <Input
                type="number" min={0}
                placeholder="Minutos de espera"
                value={minutosEspera || ''}
                onChange={(e) => onMinutosEsperaChange(parseInt(e.target.value) || 0)}
                className="bg-secondary/40 border-border/40 focus:border-primary/50 rounded-xl transition-all duration-300"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground flex items-center gap-1.5">
            <MapPinned className="w-3.5 h-3.5" /> Paradas no trajeto
            <span className="text-[10px] opacity-50 ml-1">(R$ 5,00/parada)</span>
          </label>
          <Switch checked={temParadas} onCheckedChange={onTemParadasChange} />
        </div>
        <AnimatePresence>
          {temParadas && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <Input
                type="number" min={0}
                placeholder="Quantidade de paradas"
                value={paradas || ''}
                onChange={(e) => onParadasChange(parseInt(e.target.value) || 0)}
                className="bg-secondary/40 border-border/40 focus:border-primary/50 rounded-xl transition-all duration-300"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
