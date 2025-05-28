// components/StockList/StockList.tsx
import { StockData, PriceView } from '../../types/stock.types'
import { SearchInput } from './SearchInput'
import { StockCard } from './StockCard'

interface StockListProps {
  stocks: StockData[]
  priceView: PriceView
  searchTerm: string
  setSearchTerm: (term: string) => void
  onStockClick: (stock: StockData) => void
  hiddenTickers?: string[] // Nova prop opcional para tickers ocultos
}

export const StockList = ({
  stocks,
  priceView,
  searchTerm,
  setSearchTerm,
  onStockClick,
  hiddenTickers = [] // Array vazio como padrão
}: StockListProps) => {
  // Primeiro filtrar tickers ocultos, depois aplicar filtro de pesquisa
  const visibleStocks = stocks.filter(stock => 
    !hiddenTickers.includes(stock.ticker)
  )
  
  const filteredStocks = visibleStocks.filter(stock =>
    stock.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.companhia?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full md:max-w-80 p-4 border-r border-gray-200 overflow-y-scroll">
      <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div>
        {filteredStocks.map((stock) => (
          <StockCard
            key={stock.ticker}
            stock={stock}
            priceView={priceView}
            onClick={onStockClick}
          />
        ))}
      </div>
    </div>
  )
}