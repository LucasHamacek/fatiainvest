// components/StockList/StockCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StockData, PriceView } from '../../types/stock.types'
import { getDisplayPrice } from '../../utils/stockCalculations'
import { getBackgroundColor } from '../../utils/stockCalculations'

interface StockCardProps {
  stock: StockData
  priceView: PriceView
  onClick: (stock: StockData) => void
}

export const StockCard = ({ stock, priceView, onClick }: StockCardProps) => {
  return (
    <Card
      className="flex flex-row justify-between items-center bg-transparent p-0 mb-2 border-0 shadow-none cursor-pointer"
      onClick={() => onClick(stock)}
    >
      <CardHeader className="w-full p-0 gap-0">
        <CardTitle className="text-lg font-semibold">{stock.ticker}</CardTitle>
        <CardDescription className="truncate">{stock.companhia}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col min-w-16 items-end p-0 gap-[2px]">
        <p className={`flex gap-1 text-sm font-semibold ${getBackgroundColor(stock)} justify-center min-w-[52px] px-1 rounded-[5px]`}>
          {parseFloat(getDisplayPrice(stock, priceView).toString()).toFixed(2)}
        </p>
        <p className="flex gap-1 text-sm">
          {parseFloat((stock.dy_medio_calc || 0).toString()).toFixed(2)}%
          <span>DY</span>
        </p>
      </CardContent>
    </Card>
  )
}