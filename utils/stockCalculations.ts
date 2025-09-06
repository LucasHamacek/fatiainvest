// utils/stockCalculations.ts
import { StockData, } from '../types/stock.types'

// Calcular variação (simulada - você pode ajustar conforme sua lógica)
export const calculateVariation = (currentPrice: number | null, maxPrice: number | null): string => {
  if (!currentPrice || !maxPrice) return '0.00'
  const variation = (((currentPrice - maxPrice) / maxPrice) * 100)
  const sign = variation >= 0 ? '+' : ''
  return `${sign}${variation.toFixed(2)}`
}

// Calcular projeção DY
export const calculateDYProjection = (dividendoCalc: number | null, precoAtual: number | null): string => {
  if (!dividendoCalc || !precoAtual) return '0.00'
  return ((dividendoCalc / precoAtual) * 100).toFixed(2)
}

export const getBackgroundColor = (stock: StockData): string => {
  const currentPrice = stock.preco_atual || 0
  const maxPrice = stock.preco_max_calc || 0
  if (!currentPrice || !maxPrice) return 'bg-[rgb(0,136,255)]' // azul

  if (currentPrice > maxPrice) {
    return 'bg-[rgb(255,56,60)]' // vermelho
  } else if (currentPrice <= maxPrice) {
    return 'bg-[rgb(52,199,89)]' // verde
  }
  return 'bg-[rgb(0,136,255)]' // azul
}