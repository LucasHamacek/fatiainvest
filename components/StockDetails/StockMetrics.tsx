// components/StockDetails/StockMetrics.tsx
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { StockData, ChartData } from '../../types/stock.types'
import { calculateVariation, calculateDYProjection } from '../../utils/stockCalculations'
import { Info, HelpCircle } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface StockMetricsProps {
  selectedStock: StockData
  chartData: ChartData[]
}

export const StockMetrics = ({ selectedStock, chartData }: StockMetricsProps) => {
  // Calcular número total de itens para determinar número de colunas
  const totalItems = 6 + chartData.slice(-5).length; // 6 itens fixos + últimos dividendos
  const numCols = Math.ceil(totalItems / 3); // 3 linhas no grid
  
  // Gerar separadores baseado no número de colunas
  // Considerando o gap-x-4 (1rem) entre colunas
  const separators = [];
  for (let i = 1; i < numCols; i++) {
    // Calcular posição considerando os gaps
    const colWidth = `calc((100% - ${(numCols - 1)} * 1rem) / ${numCols})`;
    const gapWidth = '1rem';
    const leftPosition = `calc(${i} * (${colWidth} + ${gapWidth}) - 0.5rem)`;
    
    separators.push(
      <div 
        key={i} 
        className="hidden lg:block absolute top-0 bottom-0" 
        style={{ left: leftPosition }}
      >
        <Separator orientation="vertical" className="h-full" />
      </div>
    );
  }

  return (
    <Card className="p-0 shadow-none border-0 bg-transparent">
      <CardContent className="flex flex-col lg:grid lg:grid-flow-col lg:grid-rows-3 lg:gap-x-4 gap-y-2 p-0 lg:max-h-64 overflow-y-auto scrollbar relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Separadores verticais entre colunas - calculados automaticamente */}
        {separators}
        
        <div className="flex items-center justify-between min-w-48 w-full">
          <div className="flex items-center gap-1">
            <p className="text-sm font-light truncate">Current Price</p>
            {selectedStock.data_atualizacao && (
              <Popover>
                <PopoverTrigger asChild>
                  <span tabIndex={0} role="button">
                    <Info size={16} className="text-gray-400 cursor-pointer" />
                  </span>
                </PopoverTrigger>
                <PopoverContent>
                  Updated: {new Date(selectedStock.data_atualizacao).toLocaleDateString()}
                </PopoverContent>
              </Popover>
            )}
          </div>
          <span className="font-medium">
            {parseFloat((selectedStock.preco_atual || 0).toString()).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between min-w-48 w-full">
          <p className="text-sm font-light truncate">Max. Value (Bazin)</p>
          <p className="font-medium">{parseFloat((selectedStock.preco_max_calc || 0).toString()).toFixed(2)}</p>
        </div>
        <div className="flex items-center justify-between min-w-48 w-full">
          <div className="flex items-center gap-1">
            <p className="text-sm font-light truncate">Variation</p>
            <Popover>
              <PopoverTrigger asChild>
                <span tabIndex={0} role="button">
                  <HelpCircle size={16} className="text-gray-400 cursor-pointer" />
                </span>
              </PopoverTrigger>
              <PopoverContent className="max-w-3xs text-wrap">
                Difference between the current price and the maximum price (Bazin Method). Shows how much the current price is above or below the calculated fair value.
              </PopoverContent>
            </Popover>
          </div>
          <p className="font-medium">
            {calculateVariation(selectedStock.preco_atual, selectedStock.preco_max_calc)}%
          </p>
        </div>
        <div className="flex items-center justify-between min-w-48 w-full">
          <div className="flex items-center gap-1">
            <p className="text-sm font-light truncate">Avg. Dividend Yield</p>
            <Popover>
              <PopoverTrigger asChild>
                <span tabIndex={0} role="button">
                  <HelpCircle size={16} className="text-gray-400 cursor-pointer" />
                </span>
              </PopoverTrigger>
              <PopoverContent className="max-w-3xs text-wrap">
                Average dividend yield over the last 5 years, or over all available years with distributed dividends.
              </PopoverContent>
            </Popover>
          </div>
          <p className="font-medium">{parseFloat((selectedStock.dy_medio_calc || 0).toString()).toFixed(2)}%</p>
        </div>
        <div className="flex items-center justify-between min-w-48 w-full">
          <div className="flex items-center gap-1">
            <p className="text-sm font-light truncate">Avg. Dividend</p>
            <Popover>
              <PopoverTrigger asChild>
                <span tabIndex={0} role="button">
                  <HelpCircle size={16} className="text-gray-400 cursor-pointer" />
                </span>
              </PopoverTrigger>
              <PopoverContent className="max-w-3xs text-wrap">
                Average dividend amount distributed over the last 5 years, or over all available years with distributed dividends.
              </PopoverContent>
            </Popover>
          </div>
          <p className="font-medium">{parseFloat((selectedStock.dividendo_calc || 0).toString()).toFixed(2)}</p>
        </div>
        <div className="flex items-center justify-between min-w-48 w-full">
          <div className="flex items-center gap-1">
            <p className="text-sm font-light truncate">DY Projection</p>
            <Popover>
              <PopoverTrigger asChild>
                <span tabIndex={0} role="button">
                  <HelpCircle size={16} className="text-gray-400 cursor-pointer" />
                </span>
              </PopoverTrigger>
              <PopoverContent className="max-w-3xs text-wrap">
                Projected dividend yield based on the average dividend and the current price, assuming the company continues to distribute dividends at the same average rate.
              </PopoverContent>
            </Popover>
          </div>
          <p className="font-medium">
            {calculateDYProjection(selectedStock.dividendo_calc, selectedStock.preco_atual)}%
          </p>
        </div>
        {/* Últimos dividendos - mostrando apenas os que existem */}
        {chartData.slice(-5).reverse().map((dividend, index) => (
          <div key={index} className="flex itens-center justify-between min-w-48 w-full">
            <p className="text-sm font-light truncate">Dividend ({dividend.year})</p>
            <p className="font-medium">{dividend.Dividend.toFixed(2)}</p>
          </div>
        ))}
      </CardContent>
    </Card >
  )
}