import {
  Route, Users, ShoppingCart, PawPrint, Clock, MapPinned,
  MapPin, Navigation, Download, Share2
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Breakdown, Corrida, formatarMoeda } from "@/lib/corrida";
import { gerarPDF } from "@/lib/pdfGenerator";

interface ResultCardProps {
  corrida: Corrida;
  breakdown: Breakdown;
}

function LineItem({ icon: Icon, label, value, index }: {
  icon: React.ElementType; label: string; value: number; index: number;
}) {
  if (value === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="flex items-center justify-between py-3 border-b border-border/20 last:border-0"
    >
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" /> {label}
      </span>
      <span className="text-sm font-semibold tabular-nums">
        {formatarMoeda(value)}
      </span>
    </motion.div>
  );
}

export function ResultCard({ corrida, breakdown }: ResultCardProps) {
  const handleDownloadPDF = () => gerarPDF(corrida, breakdown);

  const handleWhatsApp = () => {
    const msg = `🚗 *MALACA DRIVE - Resumo da Corrida*\n\n` +
      `📍 Origem: ${corrida.origem}\n` +
      `📍 Destino: ${corrida.destino}\n` +
      `📏 Distância: ${corrida.distancia_km} km\n` +
      `⏱ Tempo: ${corrida.tempo_estimado}\n\n` +
      `💰 *Valor Total: ${formatarMoeda(breakdown.total)}*\n\n` +
      `Detalhamento:\n` +
      `• KM (${corrida.distancia_km} × R$ 2,75): ${formatarMoeda(breakdown.valorKm)}\n` +
      (breakdown.adicionalPassageiros > 0 ? `• Passageiros: ${formatarMoeda(breakdown.adicionalPassageiros)}\n` : '') +
      (breakdown.adicionalFeira > 0 ? `• Feira: ${formatarMoeda(breakdown.adicionalFeira)}\n` : '') +
      (breakdown.adicionalAnimal > 0 ? `• Animal: ${formatarMoeda(breakdown.adicionalAnimal)}\n` : '') +
      (breakdown.valorEspera > 0 ? `• Espera: ${formatarMoeda(breakdown.valorEspera)}\n` : '') +
      (breakdown.valorParadas > 0 ? `• Paradas: ${formatarMoeda(breakdown.valorParadas)}\n` : '') +
      `\n_Recibo gerado por MALACA DRIVE_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Route summary */}
      <div className="flex gap-3">
        <div className="flex flex-col items-center py-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          <div className="w-[2px] flex-1 bg-border/40 my-1" />
          <div className="w-2 h-2 rounded-sm bg-foreground" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Origem</p>
            <p className="text-sm truncate">{corrida.origem}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Destino</p>
            <p className="text-sm truncate">{corrida.destino}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <span className="text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1.5 flex items-center gap-1">
          <Route className="w-3 h-3" /> {corrida.distancia_km} km
        </span>
        <span className="text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1.5 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {corrida.tempo_estimado}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/30" />

      {/* Breakdown */}
      <div>
        <LineItem icon={Route} label={`${corrida.distancia_km} km × R$ 2,75`} value={breakdown.valorKm} index={0} />
        <LineItem icon={Users} label="Passageiros extra" value={breakdown.adicionalPassageiros} index={1} />
        <LineItem icon={ShoppingCart} label="Feira" value={breakdown.adicionalFeira} index={2} />
        <LineItem icon={PawPrint} label="Animal" value={breakdown.adicionalAnimal} index={3} />
        <LineItem icon={Clock} label={`Espera (${corrida.minutos_espera} min)`} value={breakdown.valorEspera} index={4} />
        <LineItem icon={MapPinned} label={`${corrida.paradas} parada(s)`} value={breakdown.valorParadas} index={5} />
      </div>

      {/* Total */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-foreground text-background rounded-2xl p-5 text-center"
      >
        <span className="text-xs opacity-60 block mb-1 uppercase tracking-wider">Valor Total</span>
        <span className="text-3xl font-bold">
          {formatarMoeda(breakdown.total)}
        </span>
      </motion.div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleDownloadPDF}
          className="h-12 rounded-xl bg-secondary text-foreground hover:bg-muted border-0 gap-2 font-medium"
        >
          <Download className="w-4 h-4" /> PDF
        </Button>
        <Button
          onClick={handleWhatsApp}
          className="h-12 rounded-xl bg-[hsl(152,69%,47%)] hover:bg-[hsl(152,69%,42%)] text-white border-0 gap-2 font-medium"
        >
          <Share2 className="w-4 h-4" /> WhatsApp
        </Button>
      </div>
    </div>
  );
}
