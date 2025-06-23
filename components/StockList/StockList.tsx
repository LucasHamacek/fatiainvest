import { StockData } from '../../types/stock.types'
import { StockCard } from './StockCard'
import { FilterSelect, FilterOption } from './FilterSelect'

interface StockListProps {
  stocks: StockData[]
  onStockClick: (stock: StockData) => void
  selectedFilter: FilterOption
  onFilterChange: (filter: FilterOption) => void
}

export const StockList = ({
  stocks,
  onStockClick,
  selectedFilter,
  onFilterChange
}: StockListProps) => {
  const filteredStocks = stocks;

  return (
    <div className="w-full md:max-w-80 lg:max-w-96 xl:max-w-112 px-4 py-2 md:border-r border-gray-200 dark:border-zinc-700 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Bazin Method</h2>
        <p className="text-base text-gray-500 mb-4">
          Maximum purchase price based on historical Dividend Yield.
        </p>
      </div>

      <FilterSelect selectedFilter={selectedFilter} onFilterChange={onFilterChange} />

      <div>
        {filteredStocks.map((stock) => (
          <StockCard
            key={stock.ticker}
            stock={stock}
            onClick={onStockClick}
          />
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p >Stocks not found</p>
          <p >Try adjusting the filters or search term</p>
        </div>
      )}
    </div>
  )
}