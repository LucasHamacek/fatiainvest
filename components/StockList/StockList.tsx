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
  const displayedStocks = showAll ? filteredList : filteredList.slice(0, 7);

  // Empty state para watchlist sem login
  if (selectedFilter === 'watchlist' && !user) {
    return (
      <div className="w-full h-full md:max-w-80 lg:max-w-96 xl:max-w-112 p-4 md:border-r border-gray-200 dark:border-zinc-700 overflow-y-auto flex flex-col">
        <div className="flex flex-col">
          <h2 className="text-[22pt] font-semibold mb-1">Ações</h2>
          <p className="text-[13pt] text-gray-500 mb-4">
            Preço máximo de compra usando o método de dividend yield do Bazin.
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
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-[11pt] text-gray-500">
            <p>Entre para adicionar ações aos seus favoritos</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state para watchlist sem ações
  if (selectedFilter === 'watchlist' && user && filteredStocks.length === 0) {
    return (
      <div className="w-full h-full md:max-w-80 lg:max-w-96 xl:max-w-112 p-4 md:border-r border-gray-200 dark:border-zinc-700 overflow-y-auto flex flex-col">
        <div className="flex flex-col">
          <h2 className="text-[22pt] font-semibold mb-1">Ações</h2>
          <p className="text-[13pt] text-gray-500 mb-4">
            Preço máximo de compra usando o método de dividend yield do Bazin.
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
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-[11pt] text-gray-500">
            <p>Sua lista de favoritos está vazia. Adicione algumas ações para acompanhá-las aqui.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full md:max-w-80 lg:max-w-96 xl:max-w-112 p-4 md:border-r border-gray-200 dark:border-zinc-700 overflow-y-auto flex flex-col">
      <div className="flex flex-col">
        <h2 className="text-[22pt] font-semibold mb-1">Ações</h2>
        <p className="text-[13pt] font-normal text-gray-500 mb-4">
          Preço máximo de compra usando o método de dividend yield do Bazin.
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
            className="ml-2 text-[#007AFF] font-normal py-1 rounded hover:underline transition-colors duration-200"
            onClick={editMode ? handleDone : () => setEditMode(true)}
          >
            {editMode ? 'Salvar' : 'Editar'}
          </button>
        )}
      </div>

      <div>
        {displayedStocks.map((stock) => (
          <div key={stock.ticker} className="relative flex items-center group">
            <div className={`flex-1 transition-all duration-300 ease-in-out ${selectedFilter === 'watchlist' && editMode ? 'pr-16' : 'pr-0'
              }`}>
              <StockCard stock={stock} onClick={onStockClick} />
            </div>
            {selectedFilter === 'watchlist' && (
              <div
                className={`absolute right-0 flex items-center justify-center w-16 pl-4 pb-5 h-full transition-all duration-300 ease-in-out transform ${editMode
                    ? 'translate-x-0 opacity-100 scale-100'
                    : 'translate-x-4 opacity-0 scale-95 pointer-events-none'
                  }`}
              >
                <button
                  className={`text-red-500 hover:text-red-700 transition-colors duration-200 ${toRemove.has(stock.ticker) ? 'opacity-100' : 'opacity-60'
                    }`}
                  onClick={() => handleToggleRemove(stock.ticker)}
                  aria-label="Selecionar para remover"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={toRemove.has(stock.ticker) ? '#ef4444' : '#ef4444'} width="28" height="28">
                    <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
        {/* Botão para mostrar todas as ações se houver mais de 10 */}
        {!showAll && filteredList.length > 7 && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
            >
              Mostrar todas
            </Button>
          </div>
        )}
      </div>
      {displayedStocks.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-[11pt] text-sm text-gray-500">
            <p>
              {selectedFilter === 'watchlist'
                ? 'Ainda não há ações na sua lista. Adicione algumas ações para acompanhá-las aqui.'
                : 'Nenhuma ação encontrada.'}
            </p>
            {selectedFilter !== 'watchlist' && (
              <p>Experimente outros filtros ou termos de busca.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}