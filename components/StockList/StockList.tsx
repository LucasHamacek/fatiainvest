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
            <p>Faça login para adicionar ações aos seus favoritos</p>
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
            className="ml-2 text-[#007AFF] font-normal px-2 py-1 rounded hover:underline"
            onClick={editMode ? handleDone : () => setEditMode(true)}
          >
            {editMode ? 'Salvar' : 'Editar'}
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill={toRemove.has(stock.ticker) ? '#ef4444' : 'none'} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
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