export interface Corrida {
  origem: string;
  destino: string;
  distancia_km: number;
  tempo_estimado: string;
  passageiros_tipo: '4' | '6';
  feira_tipo: 'nao' | '1' | '2+';
  animal_tipo: 'nao' | 'pequeno' | 'medio' | 'grande';
  minutos_espera: number;
  tem_espera: boolean;
  paradas: number;
  tem_paradas: boolean;
}

export const VALOR_KM = 2.75;
export const VALOR_MINIMO_KM = 10;
export const VALOR_ESPERA_MIN = 0.50;
export const VALOR_PARADA = 5.00;

export const ADICIONAL_PASSAGEIROS: Record<string, number> = {
  '4': 0,
  '6': 10,
};

export const ADICIONAL_FEIRA: Record<string, number> = {
  'nao': 0,
  '1': 5,
  '2+': 7.50,
};

export const ADICIONAL_ANIMAL: Record<string, number> = {
  'nao': 0,
  'pequeno': 5,
  'medio': 8,
  'grande': 13,
};

export interface Breakdown {
  valorKm: number;
  adicionalPassageiros: number;
  adicionalFeira: number;
  adicionalAnimal: number;
  valorEspera: number;
  valorParadas: number;
  total: number;
}

export function calcularCorrida(corrida: Corrida): Breakdown {
  const valorKm = corrida.distancia_km > 0 ? Math.max(corrida.distancia_km * VALOR_KM, VALOR_MINIMO_KM) : 0;
  const adicionalPassageiros = ADICIONAL_PASSAGEIROS[corrida.passageiros_tipo];
  const adicionalFeira = ADICIONAL_FEIRA[corrida.feira_tipo];
  const adicionalAnimal = ADICIONAL_ANIMAL[corrida.animal_tipo];
  const valorEspera = corrida.tem_espera ? corrida.minutos_espera * VALOR_ESPERA_MIN : 0;
  const valorParadas = corrida.tem_paradas ? corrida.paradas * VALOR_PARADA : 0;

  const total = valorKm + adicionalPassageiros + adicionalFeira + adicionalAnimal + valorEspera + valorParadas;

  return {
    valorKm,
    adicionalPassageiros,
    adicionalFeira,
    adicionalAnimal,
    valorEspera,
    valorParadas,
    total,
  };
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
