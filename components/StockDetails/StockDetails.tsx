// components/StockDetails/StockDetails.tsx
import { Plus, Dot } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Button
} from "@/components/ui/button"
import { StockData, ChartData } from '../../types/stock.types'
import { StockChart } from './StockChart'
import { StockMetrics } from './StockMetrics'

interface StockDetailsProps {
  selectedStock: StockData | null
  chartData: ChartData[]
}

export const StockDetails = ({ selectedStock, chartData }: StockDetailsProps) => {
  if (!selectedStock) return null

  return (
    <main className="flex-1 p-4 overflow-auto hidden md:flex md:flex-col">
      <>
        <Card className="shadow-none border-0 p-0 mb-4 bg-transparent">
          <CardHeader className="flex items-center justify-between mb-4 p-0">
            <div className="flex flex-col">
              <CardTitle className="text-3xl font-bold mb-2">
                {selectedStock.ticker}
                <span className="text-gray-500 text-sm font-normal ml-1"> {selectedStock.companhia}</span>
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 pb-4">
                <p className="flex itens-center" >
                  Ibovespa <Dot className="size-5" />
                  <span>{selectedStock.setor || 'N/A'}</span> <Dot className="size-5" />
                  <span>BRL</span>
                </p>
              </CardDescription>
            </div>
            <Button className="cursor-pointer"> <Plus className="size-4" />Add to List</Button>
          </CardHeader>

          <CardContent className="p-0">
            <StockChart chartData={chartData} />
          </CardContent>
        </Card>
        <StockMetrics selectedStock={selectedStock} chartData={chartData} />
      </>
    </main>
  )
}