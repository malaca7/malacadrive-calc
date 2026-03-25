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
    <div className="space-y-4 py-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground/80 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Tempo de espera
            <span className="text-xs text-muted-foreground">(R$ 0,50/min)</span>
          </label>
          <Switch checked={temEspera} onCheckedChange={onTemEsperaChange} />
        </div>
        <AnimatePresence>
          {temEspera && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Input
                type="number" min={0}
                placeholder="Minutos"
                value={minutosEspera || ''}
                onChange={(e) => onMinutosEsperaChange(parseInt(e.target.value) || 0)}
                className="bg-secondary border-0 rounded-xl h-11"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-border/30" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground/80 flex items-center gap-2">
            <MapPinned className="w-4 h-4 text-muted-foreground" />
            Paradas
            <span className="text-xs text-muted-foreground">(R$ 5/parada)</span>
          </label>
          <Switch checked={temParadas} onCheckedChange={onTemParadasChange} />
        </div>
        <AnimatePresence>
          {temParadas && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Input
                type="number" min={0}
                placeholder="Quantidade"
                value={paradas || ''}
                onChange={(e) => onParadasChange(parseInt(e.target.value) || 0)}
                className="bg-secondary border-0 rounded-xl h-11"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
