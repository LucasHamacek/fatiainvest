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
    <Card className="p-0 text-[11pt] shadow-none border-0 bg-transparent">
      <CardContent className="flex flex-col lg:grid lg:grid-flow-col lg:grid-rows-3 lg:gap-x-4 gap-y-2 p-0 lg:max-h-64 overflow-y-auto scrollbar relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Separadores verticais entre colunas - calculados automaticamente */}
        {separators}

        <div className="flex items-center justify-between min-w-48 w-full">
          <div className="flex items-center gap-1">
            <p className="text-sm font-light truncate">Preço Atual</p>
            {selectedStock.data_atualizacao && (
              <Popover>
                <PopoverTrigger asChild>
                  <span tabIndex={0} role="button">
                    <Info size={16} className="text-gray-400 cursor-pointer" />
                  </span>
                </PopoverTrigger>
                <PopoverContent className="max-w-3xs text-wrap">
                  Atualizado: {new Date(selectedStock.data_atualizacao).toLocaleDateString()}
                </PopoverContent>
              </Popover>
            )}
          </div>
          <span className="font-semibold">
            {parseFloat((selectedStock.preco_atual || 0).toString()).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between min-w-48 w-full">
          <div className="flex items-center gap-1">
            <p className="text-sm font-light truncate">Valor Máx. (Bazin)</p>
            <Popover>
              <PopoverTrigger asChild>
                <span tabIndex={0} role="button">
                  <HelpCircle size={16} className="text-gray-400 cursor-pointer" />
                </span>
              </PopoverTrigger>
              <PopoverContent className="max-w-3xs text-wrap">
                Criado por Décio Bazin, calcula o preço máximo a pagar por uma ação com base no dividend yield histórico.
              </PopoverContent>
            </Popover>
          </div>
          <p className="font-semibold">{parseFloat((selectedStock.preco_max_calc || 0).toString()).toFixed(2)}</p>
        </div>
        <div className="flex items-center justify-between min-w-48 w-full">
          <div className="flex items-center gap-1">
            <p className="text-sm font-light truncate">Variação</p>
            <Popover>
              <PopoverTrigger asChild>
                <span tabIndex={0} role="button">
                  <HelpCircle size={16} className="text-gray-400 cursor-pointer" />
                </span>
              </PopoverTrigger>
              <PopoverContent className="max-w-3xs text-wrap">
                Diferença entre o preço atual e o preço máximo (Bazin). Mostra o quanto o preço atual está acima ou abaixo do valor justo calculado.
              </PopoverContent>
            </Popover>
          </div>
          <p className="font-semibold">
            {calculateVariation(selectedStock.preco_atual, selectedStock.preco_max_calc)}%
          </p>
        </div>
        <div className="flex items-center justify-between min-w-48 w-full">
          <div className="flex items-center gap-1">
            <p className="text-sm font-light truncate">DY Médio</p>
            <Popover>
              <PopoverTrigger asChild>
                <span tabIndex={0} role="button">
                  <HelpCircle size={16} className="text-gray-400 cursor-pointer" />
                </span>
              </PopoverTrigger>
              <PopoverContent className="max-w-3xs text-wrap">
                Dividend yield médio dos últimos 5 anos, ou de todos os anos disponíveis com dividendos distribuídos.
              </PopoverContent>
            </Popover>
          </div>
          <p className="font-semibold">{parseFloat((selectedStock.dy_medio_calc || 0).toString()).toFixed(2)}%</p>
        </div>
        <div className="flex items-center justify-between min-w-48 w-full">
          <div className="flex items-center gap-1">
            <p className="text-sm font-light truncate">Dividendo Médio</p>
            <Popover>
              <PopoverTrigger asChild>
                <span tabIndex={0} role="button">
                  <HelpCircle size={16} className="text-gray-400 cursor-pointer" />
                </span>
              </PopoverTrigger>
              <PopoverContent className="max-w-3xs text-wrap">
                Valor médio de dividendos distribuídos nos últimos 5 anos, ou de todos os anos disponíveis com dividendos distribuídos.
              </PopoverContent>
            </Popover>
          </div>
          <p className="font-semibold">{parseFloat((selectedStock.dividendo_calc || 0).toString()).toFixed(2)}</p>
        </div>
        <div className="flex items-center justify-between min-w-48 w-full">
          <div className="flex items-center gap-1">
            <p className="text-sm font-light truncate">Projeção DY</p>
            <Popover>
              <PopoverTrigger asChild>
                <span tabIndex={0} role="button">
                  <HelpCircle size={16} className="text-gray-400 cursor-pointer" />
                </span>
              </PopoverTrigger>
              <PopoverContent className="max-w-3xs text-wrap">
                Dividend yield projetado com base no dividendo médio e no preço atual, assumindo que a empresa continue distribuindo dividendos na mesma taxa média.
              </PopoverContent>
            </Popover>
          </div>
          <p className="font-semibold">
            {calculateDYProjection(selectedStock.dividendo_calc, selectedStock.preco_atual)}%
          </p>
        </div>
        {/* Últimos dividendos - mostrando apenas os que existem */}
        {chartData.slice(-5).reverse().map((dividend, index) => (
          <div key={index} className="flex itens-center justify-between min-w-48 w-full">
            <p className="text-sm font-light truncate">Dividendo {dividend.year}</p>
            <p className="font-semibold">{dividend.Dividend.toFixed(2)}</p>
          </div>
        ))}
      </CardContent>
    </Card >
  )
}