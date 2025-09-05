import { Dot, Star } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { useWatchlist } from "@/context/WatchlistContext"
import { useEffect, useRef, useState } from "react"

interface StockSheetProps {
  selectedStock: StockData | null
  chartData: ChartData[]
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
}

export const StockSheet = ({ selectedStock, chartData, sheetOpen, setSheetOpen }: StockSheetProps) => {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const isInWatchlist = selectedStock ? watchlist.includes(selectedStock.ticker) : false;
  const [canRenderChart, setCanRenderChart] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [hasSize, setHasSize] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (sheetOpen) {
      // Aguarda 250ms após abrir o sheet para garantir altura
      timeout = setTimeout(() => setCanRenderChart(true), 250);
    } else {
      setCanRenderChart(false);
    }
    return () => clearTimeout(timeout);
  }, [sheetOpen]);

  useEffect(() => {
    if (!canRenderChart) {
      setHasSize(false);
      return;
    }
    if (chartContainerRef.current) {
      const { width, height } = chartContainerRef.current.getBoundingClientRect();
      setHasSize(width > 0 && height > 0);
    }
  }, [canRenderChart, chartData]);

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent side="bottom" className="h-[80vh] py-4 gap-0 rounded-t-xl border-0 shadow-none overflow-x-auto scrollbar overflow-y-auto">
        {selectedStock && (
          <>
            <SheetHeader className="p-0 px-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="w-full mr-10">
                  <div className="flex w-full items-center justify-between">
                    <SheetTitle className="text-2xl font-bold"> {selectedStock.ticker} </SheetTitle>
                    <div className="flex items-center">
                      {isInWatchlist ? (
                        <Button
                          className="rounded-full text-yellow-500 w-[32px] h-[32px] focus-visible:ring-0 opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none"
                          variant="secondary"
                          onClick={() => {
                            removeFromWatchlist(selectedStock.ticker);
                            setSheetOpen(false);
                          }}
                        >
                          <Star fill="currentColor" />
                        </Button>
                      ) : (
                        <Button
                          className="rounded-full text-gray-500 w-[32px] h-[32px] focus-visible:ring-0 opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none"
                          variant="secondary"
                          onClick={() => addToWatchlist(selectedStock.ticker)}
                        >
                          <Star fill="currentColor" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm font-normal pr-6"> {selectedStock.companhia}</p>
                </div>
              </div>
              <SheetDescription className="flex items-center">
                Ibovespa <Dot className="size-5" />
                <span>{selectedStock.setor || 'N/A'}</span> <Dot className="size-5" />
                <span>BRL</span>
              </SheetDescription>
            </SheetHeader>

            <div className="px-4 overflow-x-auto scrollbar-hide">
              <Card className="shadow-none border-0 p-0 mb-4 bg-transparent">
                <CardContent className="p-0">
                  <div ref={chartContainerRef} className="w-full min-h-[200px] max-h-96">
                    {canRenderChart && hasSize && chartData && chartData.length > 0 && (
                      <StockChart chartData={chartData} isMobile={true} />
                    )}
                  </div>
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