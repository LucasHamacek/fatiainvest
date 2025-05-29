// components/StockList/StockCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StockData, } from '../../types/stock.types'
import { getBackgroundColor } from '../../utils/stockCalculations'

interface StockCardProps {
  stock: StockData
  onClick: (stock: StockData) => void
}

export const StockCard = ({ stock, onClick }: StockCardProps) => {
  return (
    <Card
      className="flex flex-row justify-between items-center bg-transparent p-0 mb-4 border-0 shadow-none cursor-pointer"
      onClick={() => onClick(stock)}
    >
      <CardHeader className="w-full p-0 gap-0">
        <CardTitle className="text-lg font-semibold">{stock.ticker}</CardTitle>
        <CardDescription className="truncate">{stock.companhia}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col min-w-16 items-end p-0 gap-[2px]">
        <p className={`flex gap-1 text-sm font-semibold text-white ${getBackgroundColor(stock)} justify-center min-w-[52px] px-1 rounded-[5px]`}>
          {parseFloat((stock.preco_max_calc || 0).toString()).toFixed(2)}
        </p>
        <p className="flex gap-1 text-sm">
          {parseFloat((stock.dy_medio_calc || 0).toString()).toFixed(2)}%
          <span>DY</span>
        </p>
      </CardContent>
    </Card>
  )
}