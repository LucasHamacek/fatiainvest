// utils/stockCalculations.ts
import { StockData, PriceView } from '../types/stock.types'

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

// Função para obter o preço a ser exibido baseado na seleção do radio
export const getDisplayPrice = (stock: StockData, priceView: PriceView): number => {
  return priceView === 'max' ? (stock.preco_max_calc || 0) : (stock.preco_atual || 0)
}

export const getBackgroundColor = (stock: StockData): string => {
  const currentPrice = stock.preco_atual || 0
  const maxPrice = stock.preco_max_calc || 0
  
  if (!currentPrice || !maxPrice) return 'bg-blue-500'
  
  const variation = ((currentPrice - maxPrice) / maxPrice) * 100
  
  if (variation > 10 || variation < -10) {
    return 'bg-red-400 text-white'
  } else if (variation > 5 || variation < -5) {
    return 'bg-blue-400 text-white'
  } else {
    return 'bg-green-400 text-white'
  }
}