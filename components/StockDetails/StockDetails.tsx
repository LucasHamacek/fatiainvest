// components/StockDetails/StockDetails.tsx
import { Dot, Star } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useWatchlist } from "@/context/WatchlistContext"
import { Button } from "@/components/ui/button"
import { StockData, ChartData } from '../../types/stock.types'
import { StockChart } from './StockChart'
import { StockMetrics } from './StockMetrics'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StockDetailsProps {
  selectedStock: StockData | null
  chartData: ChartData[]
}

export const StockDetails = ({ selectedStock, chartData }: StockDetailsProps) => {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  if (!selectedStock) return null;
  const isInWatchlist = watchlist.includes(selectedStock.ticker);

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
            <div>
              {isInWatchlist ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="rounded-full text-yellow-500 w-[32px] h-[32px] focus-visible:ring-0 opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none"
                        variant="secondary"
                        onClick={() => removeFromWatchlist(selectedStock.ticker)}
                      >
                        <Star fill="currentColor" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-medium">
                      Remove from Watchlist
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="rounded-full text-gray-500 w-[32px] h-[32px] focus-visible:ring-0 opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none"
                        variant="secondary"
                        onClick={() => addToWatchlist(selectedStock.ticker)}
                      >
                        <Star fill="currentColor" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-medium">
                      Add to Watchlist
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
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