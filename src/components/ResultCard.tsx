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
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between py-2.5 border-b border-border/20 last:border-0"
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
    <div className="glass-card glow-border p-5 space-y-4">
      <h2 className="text-base font-semibold flex items-center gap-2 font-['Space_Grotesk'] tracking-tight">
        <span className="text-gradient">Resultado da Corrida</span>
      </h2>

      {/* Route info */}
      <div className="bg-secondary/30 rounded-xl p-3.5 space-y-2 border border-border/20">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-green-success flex-shrink-0" />
          <span className="truncate">{corrida.origem}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Navigation className="w-4 h-4 text-destructive flex-shrink-0" />
          <span className="truncate">{corrida.destino}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 pt-2 border-t border-border/20">
          <span className="flex items-center gap-1"><Route className="w-3 h-3" /> {corrida.distancia_km} km</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {corrida.tempo_estimado}</span>
        </div>
      </div>

      {/* Breakdown */}
      <div>
        <LineItem icon={Route} label={`${corrida.distancia_km} km × R$ 2,75`} value={breakdown.valorKm} index={0} />
        <LineItem icon={Users} label="Adicional passageiros" value={breakdown.adicionalPassageiros} index={1} />
        <LineItem icon={ShoppingCart} label="Carrinho de feira" value={breakdown.adicionalFeira} index={2} />
        <LineItem icon={PawPrint} label="Animal" value={breakdown.adicionalAnimal} index={3} />
        <LineItem icon={Clock} label={`Espera (${corrida.minutos_espera} min)`} value={breakdown.valorEspera} index={4} />
        <LineItem icon={MapPinned} label={`${corrida.paradas} parada(s)`} value={breakdown.valorParadas} index={5} />
      </div>

      {/* Total */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3, type: "spring", stiffness: 200 }}
        className="bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center shimmer"
      >
        <span className="text-xs text-muted-foreground block mb-1 uppercase tracking-wider">Valor Total</span>
        <span className="text-3xl font-bold text-gradient font-['Space_Grotesk']">
          {formatarMoeda(breakdown.total)}
        </span>
      </motion.div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={handleDownloadPDF} className="btn-glow gap-2 rounded-xl">
          <Download className="w-4 h-4" /> Baixar PDF
        </Button>
        <Button onClick={handleWhatsApp} variant="secondary" className="gap-2 rounded-xl bg-green-success/15 hover:bg-green-success/25 text-green-success border border-green-success/20 transition-all duration-300">
          <Share2 className="w-4 h-4" /> WhatsApp
        </Button>
      </div>
    </div>
  );
}
