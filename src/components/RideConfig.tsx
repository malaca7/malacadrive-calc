import { Users, ShoppingCart, PawPrint } from "lucide-react";
import { motion } from "framer-motion";

interface RideConfigProps {
  passageirosTipo: '4' | '6';
  feiraTipo: 'nao' | '1' | '2+';
  animalTipo: 'nao' | 'pequeno' | 'medio' | 'grande';
  onPassageirosChange: (v: '4' | '6') => void;
  onFeiraChange: (v: 'nao' | '1' | '2+') => void;
  onAnimalChange: (v: 'nao' | 'pequeno' | 'medio' | 'grande') => void;
}

function OptionButton({ selected, onClick, children, extra }: {
  selected: boolean; onClick: () => void; children: React.ReactNode; extra?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`relative px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
        selected
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
          : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      {children}
      {extra && <span className="block text-[11px] mt-0.5 opacity-70">{extra}</span>}
    </motion.button>
  );
}

export function RideConfig({
  passageirosTipo, feiraTipo, animalTipo,
  onPassageirosChange, onFeiraChange, onAnimalChange,
}: RideConfigProps) {
  return (
    <div className="glass-card p-5 space-y-5">
      <h2 className="text-base font-semibold flex items-center gap-2 font-['Space_Grotesk'] tracking-tight">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-primary" />
        </div>
        Configuração
      </h2>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider font-medium">
          Passageiros
        </label>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton selected={passageirosTipo === '4'} onClick={() => onPassageirosChange('4')}>
            4 passageiros
          </OptionButton>
          <OptionButton selected={passageirosTipo === '6'} onClick={() => onPassageirosChange('6')} extra="+R$ 10,00">
            6 passageiros
          </OptionButton>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider font-medium">
          Carrinho de feira
        </label>
        <div className="grid grid-cols-3 gap-2">
          <OptionButton selected={feiraTipo === 'nao'} onClick={() => onFeiraChange('nao')}>Não</OptionButton>
          <OptionButton selected={feiraTipo === '1'} onClick={() => onFeiraChange('1')} extra="+R$ 5,00">1 carrinho</OptionButton>
          <OptionButton selected={feiraTipo === '2+'} onClick={() => onFeiraChange('2+')} extra="+R$ 7,50">2 ou mais</OptionButton>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider font-medium">
          Animal
        </label>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton selected={animalTipo === 'nao'} onClick={() => onAnimalChange('nao')}>Não</OptionButton>
          <OptionButton selected={animalTipo === 'pequeno'} onClick={() => onAnimalChange('pequeno')} extra="+R$ 5,00">Pequeno</OptionButton>
          <OptionButton selected={animalTipo === 'medio'} onClick={() => onAnimalChange('medio')} extra="+R$ 8,00">Médio</OptionButton>
          <OptionButton selected={animalTipo === 'grande'} onClick={() => onAnimalChange('grande')} extra="+R$ 13,00">Grande</OptionButton>
        </div>
      </div>
    </div>
  );
}
