// types/stock.types.ts
export interface StockData {
  ticker: string
  companhia: string
  setor: string
  dy_medio_calc: number
  preco_max_calc: number
  dividendo_calc: number
  preco_atual: number
  data_atualizacao: string
  data_preco: string
  preco_max_agressivo: number;
  preco_max_conservador: number;
  chartData?: { ano: number; dividendo: number }[];
}

export interface DividendData {
  ano: number
  dividendo: number
}

export interface ChartData {
  year: string
  Dividend: number
}