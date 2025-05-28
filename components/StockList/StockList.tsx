// components/StockList/StockList.tsx
import { StockData, PriceView } from '../../types/stock.types'
import { SearchInput } from './SearchInput'
import { StockCard } from './StockCard'
import { FilterSelect, FilterOption } from './FilterSelect'

interface StockListProps {
  stocks: StockData[]
  priceView: PriceView
  searchTerm: string
  setSearchTerm: (term: string) => void
  onStockClick: (stock: StockData) => void
  selectedFilter: FilterOption
  onFilterChange: (filter: FilterOption) => void
}

export const StockList = ({
  stocks,
  priceView,
  searchTerm,
  setSearchTerm,
  onStockClick,
  selectedFilter,
  onFilterChange
}: StockListProps) => {
  // Aplicar filtro de pesquisa nas ações já filtradas
  const filteredStocks = stocks.filter(stock =>
    stock.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.companhia?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full md:max-w-80 p-4 border-r border-gray-200 overflow-y-scroll">
      <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <FilterSelect selectedFilter={selectedFilter} onFilterChange={onFilterChange}
      />
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
      {filteredStocks.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p>Nenhuma ação encontrada</p>
          <p className="text-sm">Tente ajustar os filtros ou termo de busca</p>
        </div>
      )}
    </div>
  )
}