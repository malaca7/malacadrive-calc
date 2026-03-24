import {
  Route, Users, ShoppingCart, PawPrint, Clock, MapPinned,
  MapPin, Navigation, Download, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breakdown, Corrida, formatarMoeda } from "@/lib/corrida";
import { gerarPDF } from "@/lib/pdfGenerator";

interface ResultCardProps {
  corrida: Corrida;
  breakdown: Breakdown;
}

function LineItem({ icon: Icon, label, value, highlight }: {
  icon: React.ElementType; label: string; value: number; highlight?: boolean;
}) {
  if (value === 0) return null;
  return (
    <div className={`flex items-center justify-between py-2 ${highlight ? '' : 'border-b border-border/30'}`}>
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" /> {label}
      </span>
      <span className={`text-sm font-medium ${highlight ? 'text-2xl font-bold text-gradient' : ''}`}>
        {formatarMoeda(value)}
      </span>
    </div>
  );
}

export function ResultCard({ corrida, breakdown }: ResultCardProps) {
  const handleDownloadPDF = () => {
    gerarPDF(corrida, breakdown);
  };

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

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="glass-card glow-border p-5 space-y-4 animate-slide-up">
      <h2 className="text-lg font-semibold flex items-center gap-2 font-['Space_Grotesk']">
        <span className="text-gradient">Resultado da Corrida</span>
      </h2>

      {/* Route info */}
      <div className="bg-secondary/50 rounded-lg p-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-green-success flex-shrink-0" />
          <span className="truncate">{corrida.origem}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Navigation className="w-4 h-4 text-destructive flex-shrink-0" />
          <span className="truncate">{corrida.destino}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><Route className="w-3 h-3" /> {corrida.distancia_km} km</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {corrida.tempo_estimado}</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-0">
        <LineItem icon={Route} label={`${corrida.distancia_km} km × R$ 2,75`} value={breakdown.valorKm} />
        <LineItem icon={Users} label="Adicional passageiros" value={breakdown.adicionalPassageiros} />
        <LineItem icon={ShoppingCart} label="Carrinho de feira" value={breakdown.adicionalFeira} />
        <LineItem icon={PawPrint} label="Animal" value={breakdown.adicionalAnimal} />
        <LineItem icon={Clock} label={`Espera (${corrida.minutos_espera} min)`} value={breakdown.valorEspera} />
        <LineItem icon={MapPinned} label={`${corrida.paradas} parada(s)`} value={breakdown.valorParadas} />
      </div>

      {/* Total */}
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
        <span className="text-sm text-muted-foreground block mb-1">Valor Total</span>
        <span className="text-3xl font-bold text-gradient font-['Space_Grotesk']">
          {formatarMoeda(breakdown.total)}
        </span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={handleDownloadPDF} className="btn-glow gap-2">
          <Download className="w-4 h-4" /> Baixar PDF
        </Button>
        <Button onClick={handleWhatsApp} variant="secondary" className="gap-2 bg-green-success/20 hover:bg-green-success/30 text-green-success border border-green-success/30">
          <Share2 className="w-4 h-4" /> WhatsApp
        </Button>
      </div>
    </div>
  );
}
