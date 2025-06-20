// components/StockDetails/StockMetrics.tsx
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { StockData, ChartData } from '../../types/stock.types'
import { calculateVariation, calculateDYProjection } from '../../utils/stockCalculations'

interface StockMetricsProps {
  selectedStock: StockData
  chartData: ChartData[]
}

export const StockMetrics = ({ selectedStock, chartData }: StockMetricsProps) => {
  return (
    <Card className="p-0 shadow-none border-0 bg-transparent">
      <CardContent className="flex flex-col lg:grid lg:grid-flow-col lg:grid-rows-3 lg:gap-x-4 gap-y-2 p-0 lg:max-h-64 overflow-y-auto scrollbar" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
        <div className="flex itens-center justify-between min-w-48 w-full">
          <p className="text-sm font-light truncate">Current Price</p>
          <p className="font-medium">{parseFloat((selectedStock.preco_atual || 0).toString()).toFixed(2)}</p>
        </div>
        <div className="flex itens-center justify-between min-w-48 w-full">
          <p className="text-sm font-light truncate">Max. Value (Bazin)</p>
          <p className="font-medium">{parseFloat((selectedStock.preco_max_calc || 0).toString()).toFixed(2)}</p>
        </div>
        <div className="flex itens-center justify-between min-w-48 w-full">
          <p className="text-sm font-light truncate">Variation</p>
          <p className="font-medium">
            {calculateVariation(selectedStock.preco_atual, selectedStock.preco_max_calc)}%
          </p>
        </div>
        <div className="flex itens-center justify-between min-w-48 w-full">
          <p className="text-sm font-light truncate">Dividend Yield</p>
          <p className="font-medium">{parseFloat((selectedStock.dy_medio_calc || 0).toString()).toFixed(2)}%</p>
        </div>
        <div className="flex itens-center justify-between min-w-48 w-full">
          <p className="text-sm font-light truncate">Avg. Dividend</p>
          <p className="font-medium">{parseFloat((selectedStock.dividendo_calc || 0).toString()).toFixed(2)}</p>
        </div>
        <div className="flex itens-center justify-between min-w-48 w-full">
          <p className="text-sm font-light truncate">DY Projection</p>
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
    </Card>
  )
}