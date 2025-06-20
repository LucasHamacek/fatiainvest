import { StockData, } from '../../types/stock.types'
import { StockCard } from './StockCard'
import { FilterSelect, FilterOption } from './FilterSelect'

interface StockListProps {
  stocks: StockData[]
  searchTerm: string
  onStockClick: (stock: StockData) => void
  selectedFilter: FilterOption
  onFilterChange: (filter: FilterOption) => void
}

export const StockList = ({
  stocks,
  searchTerm,
  onStockClick,
  selectedFilter,
  onFilterChange
}: StockListProps) => {
  // Aplicar filtro de pesquisa nas ações já filtradas
  const safeSearchTerm = (searchTerm ?? '').toLowerCase();
  const filteredStocks = stocks.filter(stock =>
    (stock.ticker ?? '').toLowerCase().includes(safeSearchTerm) ||
    (stock.companhia ?? '').toLowerCase().includes(safeSearchTerm)
  )

  return (
    <div className="w-full md:max-w-80 lg:max-w-96 xl:max-w-112 px-4 py-2 border-r border-gray-200 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Bazin Method</h2>
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
          <p>Nenhuma ação encontrada</p>
          <p className="text-sm">Tente ajustar os filtros ou termo de busca</p>
        </div>
      )}
    </div>
  )
}