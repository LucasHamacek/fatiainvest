import { StockData } from '../../types/stock.types'
import { StockCard } from './StockCard'
import { FilterSelect, FilterOption } from './FilterSelect'
import { useWatchlist } from "@/context/WatchlistContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { SearchInput } from "./SearchInput";

interface StockListProps {
  stocks: StockData[]
  onStockClick: (stock: StockData) => void
  selectedFilter: FilterOption
  onFilterChange: (filter: FilterOption) => void
  investorProfile: string
}

export const StockList = ({
  stocks,
  onStockClick,
  selectedFilter,
  onFilterChange,
  investorProfile
}: StockListProps) => {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [toRemove, setToRemove] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Resetar showAll e edição ao trocar de filtro (não reseta searchTerm)
  useEffect(() => {
    setShowAll(false);
    setEditMode(false);
    setToRemove(new Set());
  }, [selectedFilter]);

  // Filtros globais (oculta tickers indesejados e preço 0)
  const hiddenTickers = [
    'AESB3',
    'CIEL3',
    'ENAT3',
    'ODPV3',
    'TRPL3',
    'TRPL4'
  ];
  let filteredStocks = stocks
    .filter(stock => stock.preco_atual !== 0)
    .filter(stock => !hiddenTickers.includes(stock.ticker));

  // Filtro de busca
  if (searchTerm && selectedFilter !== 'watchlist') {
    filteredStocks = filteredStocks.filter(stock =>
      (stock.ticker ?? '').toLowerCase().includes((searchTerm ?? '').toLowerCase()) ||
      (stock.companhia ?? '').toLowerCase().includes((searchTerm ?? '').toLowerCase())
    );
  }

  // Atualiza preco_max_calc conforme perfil
  filteredStocks = filteredStocks.map(stock => ({
    ...stock,
    preco_max_calc: investorProfile === "conservador" ? stock.preco_max_conservador : stock.preco_max_agressivo
  }));

  // Filtros específicos
  if (selectedFilter === 'highest-dy') {
    filteredStocks = filteredStocks
      .filter(stock => stock.dy_medio_calc && stock.dy_medio_calc > 0)
      .sort((a, b) => (b.dy_medio_calc || 0) - (a.dy_medio_calc || 0));
  } else if (selectedFilter === 'opportunity') {
    filteredStocks = filteredStocks.filter(stock => {
      if (!stock.preco_atual || !stock.preco_max_calc || !stock.dy_medio_calc) return false;
      return stock.preco_atual <= stock.preco_max_calc && stock.dy_medio_calc > 6;
    });
  } else if (selectedFilter === 'watchlist') {
    filteredStocks = filteredStocks.filter(stock => watchlist.includes(stock.ticker));
  }

  const handleToggleRemove = (ticker: string) => {
    setToRemove((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) {
        next.delete(ticker);
      } else {
        next.add(ticker);
      }
      return next;
    });
  };

  const handleDone = async () => {
    await Promise.all(Array.from(toRemove).map((ticker) => removeFromWatchlist(ticker)));
    setToRemove(new Set());
    setEditMode(false);
    onFilterChange('watchlist');
  };

  // Lista de tickers a serem removidos (em edição)
  const tickersToRemove = editMode ? toRemove : new Set();
  // Filtra localmente as ações removidas enquanto o contexto não atualiza
  const filteredList = selectedFilter === 'watchlist'
    ? filteredStocks.filter(stock => !tickersToRemove.has(stock.ticker))
    : filteredStocks;

  // Paginação: mostra só 10 por padrão
  const displayedStocks = showAll ? filteredList : filteredList.slice(0, 10);

  // Empty state para watchlist sem login
  if (selectedFilter === 'watchlist' && !user) {
    return (
      <div className="w-full md:max-w-80 lg:max-w-96 xl:max-w-112 p-4 md:border-r border-gray-200 dark:border-zinc-700 overflow-y-auto">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Smart Stock Pricing</h2>
          <p className="text-base text-gray-500 mb-4">
            {"Maximum purchase price using Bazin's dividend yield method."}
          </p>
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            stocks={stocks.map(s => ({ ticker: s.ticker, companhia: s.companhia }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <FilterSelect selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
        </div>
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-center text-gray-500 mt-8">
            <p>Login to add stocks to your favorites.</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state para watchlist sem ações
  if (selectedFilter === 'watchlist' && user && filteredStocks.length === 0) {
    return (
      <div className="w-full md:max-w-80 lg:max-w-96 xl:max-w-112 p-4 md:border-r border-gray-200 dark:border-zinc-700 overflow-y-auto">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Smart Stock Pricing</h2>
          <p className="text-base text-gray-500 mb-4">
            {"Maximum purchase price using Bazin's dividend yield method."}
          </p>
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            stocks={stocks.map(s => ({ ticker: s.ticker, companhia: s.companhia }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <FilterSelect selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
        </div>
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-center text-gray-500 mt-8">
            <p>Your favorites is empty. Add some stocks to track them here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:max-w-80 lg:max-w-96 xl:max-w-112 p-4 md:border-r border-gray-200 dark:border-zinc-700 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Smart Stock Pricing</h2>
        <p className="text-base text-gray-500 mb-4">
          {"Maximum purchase price using Bazin's dividend yield method."}
        </p>
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          stocks={stocks.map(s => ({ ticker: s.ticker, companhia: s.companhia }))}
        />
      </div>

      <div className="flex items-center justify-between">
        <FilterSelect selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
        {selectedFilter === 'watchlist' && filteredStocks.length > 0 && (
          <button
            className="ml-2 text-[#007AFF] font-normal px-2 py-1 rounded hover:underline"
            onClick={editMode ? handleDone : () => setEditMode(true)}
          >
            {editMode ? 'Done' : 'Edit'}
          </button>
        )}
      </div>

      <div>
        {displayedStocks.map((stock) => (
          <div key={stock.ticker} className="flex items-center justify-between group">
            <StockCard stock={stock} onClick={onStockClick} />
            {selectedFilter === 'watchlist' && editMode && (
              <button
                className={`flex items-center justify-center w-16 mb-4 text-red-500 hover:text-red-700 ${toRemove.has(stock.ticker) ? 'opacity-100' : 'opacity-60'}`}
                onClick={() => handleToggleRemove(stock.ticker)}
                aria-label="Selecionar para remover"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={toRemove.has(stock.ticker) ? '#ef4444' : 'none'} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </button>
            )}
          </div>
        ))}
        {/* Botão para mostrar todas as ações se houver mais de 10 */}
        {!showAll && filteredList.length > 10 && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
            >
              Show all
            </Button>
          </div>
        )}
      </div>
      {displayedStocks.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p>
            {selectedFilter === 'watchlist'
              ? 'Your favorites is empty. Add some stocks to track them here.'
              : 'Stocks not found'}
          </p>
          {selectedFilter !== 'watchlist' && (
            <p>Try adjusting the filters or search term</p>
          )}
        </div>
      )}
    </div>
  )
}