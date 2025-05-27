// components/StockDetails/StockSheet.tsx
import { Dot } from "lucide-react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { StockData, ChartData } from '../../types/stock.types'
import { StockChart } from './StockChart'
import { StockMetrics } from './StockMetrics'

interface StockSheetProps {
  selectedStock: StockData | null
  chartData: ChartData[]
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
}

export const StockSheet = ({ selectedStock, chartData, sheetOpen, setSheetOpen }: StockSheetProps) => {
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent side="bottom" className="h-[80vh] p-4 rounded-t-md">
        {selectedStock && (
          <>
            <SheetHeader className="p-0 mb-4">
              <SheetTitle className="text-2xl font-bold">
                {selectedStock.ticker}
                <span className="text-gray-500 text-sm font-normal ml-1"> {selectedStock.companhia}</span>
              </SheetTitle>
              <SheetDescription className="flex items-center">
                  Ibovespa <Dot className="size-5" />
                  <span>{selectedStock.setor || 'N/A'}</span> <Dot className="size-5" />
                  <span>BRL</span>
              </SheetDescription>
            </SheetHeader>

            <div>
              <Card className="shadow-none border-0 p-0 mb-4 bg-transparent">
                <CardContent className="p-0">
                  <StockChart chartData={chartData} isMobile={true} />
                </CardContent>
              </Card>

              <StockMetrics selectedStock={selectedStock} chartData={chartData} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}