import jsPDF from "jspdf";
import { Breakdown, Corrida, formatarMoeda } from "./corrida";

export function gerarPDF(corrida: Corrida, breakdown: Breakdown) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Header background
  doc.setFillColor(10, 31, 68); // navy
  doc.rect(0, 0, w, 50, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MALACA DRIVE', w / 2, 25, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Recibo de Corrida', w / 2, 35, { align: 'center' });

  // Date
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR') + ' - ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(9);
  doc.text(dateStr, w / 2, 44, { align: 'center' });

  y = 60;

  // Body
  doc.setTextColor(30, 30, 30);

  // Route section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhes da Rota', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Origem: ${corrida.origem}`, margin, y); y += 6;
  doc.text(`Destino: ${corrida.destino}`, margin, y); y += 6;
  doc.text(`Distancia: ${corrida.distancia_km} km`, margin, y); y += 6;
  doc.text(`Tempo estimado: ${corrida.tempo_estimado}`, margin, y); y += 12;

  // Divider
  doc.setDrawColor(200);
  doc.line(margin, y, w - margin, y);
  y += 8;

  // Breakdown
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento de Valores', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const items: [string, number][] = [
    [`Valor por KM (${corrida.distancia_km} km x R$ 2,75)`, breakdown.valorKm],
    ['Adicional passageiros', breakdown.adicionalPassageiros],
    ['Carrinho de feira', breakdown.adicionalFeira],
    ['Animal', breakdown.adicionalAnimal],
    [`Tempo de espera (${corrida.minutos_espera} min)`, breakdown.valorEspera],
    [`Paradas (${corrida.paradas})`, breakdown.valorParadas],
  ];

  for (const [label, value] of items) {
    if (value > 0) {
      doc.text(label, margin, y);
      doc.text(formatarMoeda(value), w - margin, y, { align: 'right' });
      y += 7;
    }
  }

  y += 4;
  doc.setDrawColor(200);
  doc.line(margin, y, w - margin, y);
  y += 10;

  // Total
  doc.setFillColor(10, 31, 68);
  doc.roundedRect(margin, y - 4, w - margin * 2, 18, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR TOTAL', margin + 8, y + 7);
  doc.text(formatarMoeda(breakdown.total), w - margin - 8, y + 7, { align: 'right' });

  y += 30;

  // Footer
  doc.setTextColor(150);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Documento gerado automaticamente por MALACA DRIVE', w / 2, y, { align: 'center' });

  doc.save(`recibo-malaca-drive-${now.toISOString().slice(0, 10)}.pdf`);
}
