import { StockCard } from "@/components/StockList/StockCard";
import { StockData } from "@/types/stock.types";
import { useWatchlist } from "@/context/WatchlistContext";
import { Trash2 } from "lucide-react"

interface WatchlistProps {
  stocks: StockData[];
  onStockClick: (stock: StockData) => void;
}

export const Watchlist = ({ stocks, onStockClick }: WatchlistProps) => {
  const { removeFromWatchlist } = useWatchlist();
  if (!stocks.length) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[300px] text-gray-500 text-center">
        Your watchlist is empty. Add some stocks to track them here.
      </div>
    );
  }
  return (
    <div className="w-full md:max-w-80 lg:max-w-96 xl:max-w-112 px-4 py-2 border-r border-gray-200 overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4">Watchlist</h2>
      <div>
        {stocks.map((stock) => (
          <div
            key={stock.ticker}
            className="flex items-center justify-between"
          >
            <StockCard stock={stock} onClick={onStockClick} />
          </div>
        ))}
      </div>
    </div>
  );
}
