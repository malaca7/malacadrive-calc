import { Users, ShoppingCart, PawPrint } from "lucide-react";

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
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        selected
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'bg-secondary text-muted-foreground hover:bg-muted'
      }`}
    >
      {children}
      {extra && <span className="block text-xs mt-0.5 opacity-75">{extra}</span>}
    </button>
  );
}

export function RideConfig({
  passageirosTipo, feiraTipo, animalTipo,
  onPassageirosChange, onFeiraChange, onAnimalChange,
}: RideConfigProps) {
  return (
    <div className="glass-card p-5 space-y-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-lg font-semibold flex items-center gap-2 font-['Space_Grotesk']">
        <Users className="w-5 h-5 text-blue-accent" />
        Configuração
      </h2>

      {/* Passageiros */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Passageiros
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

      {/* Feira */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground flex items-center gap-1.5">
          <ShoppingCart className="w-3.5 h-3.5" /> Carrinho de feira
        </label>
        <div className="grid grid-cols-3 gap-2">
          <OptionButton selected={feiraTipo === 'nao'} onClick={() => onFeiraChange('nao')}>
            Não
          </OptionButton>
          <OptionButton selected={feiraTipo === '1'} onClick={() => onFeiraChange('1')} extra="+R$ 5,00">
            1 carrinho
          </OptionButton>
          <OptionButton selected={feiraTipo === '2+'} onClick={() => onFeiraChange('2+')} extra="+R$ 7,50">
            2 ou mais
          </OptionButton>
        </div>
      </div>

      {/* Animal */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground flex items-center gap-1.5">
          <PawPrint className="w-3.5 h-3.5" /> Animal
        </label>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton selected={animalTipo === 'nao'} onClick={() => onAnimalChange('nao')}>
            Não
          </OptionButton>
          <OptionButton selected={animalTipo === 'pequeno'} onClick={() => onAnimalChange('pequeno')} extra="+R$ 5,00">
            Pequeno
          </OptionButton>
          <OptionButton selected={animalTipo === 'medio'} onClick={() => onAnimalChange('medio')} extra="+R$ 8,00">
            Médio
          </OptionButton>
          <OptionButton selected={animalTipo === 'grande'} onClick={() => onAnimalChange('grande')} extra="+R$ 13,00">
            Grande
          </OptionButton>
        </div>
      </div>
    </div>
  );
}
