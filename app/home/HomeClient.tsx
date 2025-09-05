"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { StockData } from '../../types/stock.types';
import { useStocksContext } from "@/context/StocksContext";
import { useStockChart } from '../../hooks/useStockChart';
import { FilterOption } from '../../components/StockList/FilterSelect';
import { LoadingScreen } from '../../components/Layout/LoadingScreen';
import { StockList } from '../../components/StockList/StockList';
import { StockDetails } from '../../components/StockDetails/StockDetails';
import { StockSheet } from '../../components/StockDetails/StockSheet';
import { useSearch } from "@/context/SearchContext";
import { useSearchParams, useRouter } from "next/navigation";
import { useWatchlist } from "@/context/WatchlistContext";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";

export default function HomeClient() {
  const { stocks, loading } = useStocksContext();
  const { user } = useAuth();
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const { chartData } = useStockChart(selectedStock);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { searchTerm, setSearchTerm } = useSearch();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('none');
  const [consistentStocks,] = useState<Set<string>>(new Set());
  const [searchApplied, setSearchApplied] = useState(false);
  const [investorProfile, setInvestorProfile] = useState<string>("agressivo");

  useEffect(() => {
    if (user) {
      setInvestorProfile(user.user_metadata?.investorProfile || "agressivo");
    }
  }, [user]);

  // Lista de tickers que você quer ocultar
  const hiddenTickers = useMemo(() => [
    'AESB3',
    'CIEL3',
    'ENAT3',
    'ODPV3',
    'TRPL3',
    'TRPL4'
  ], []);

  // Obter dados da watchlist
  const { watchlist } = useWatchlist();

  // Função para aplicar filtros na watchlist (sem searchTerm)
  const filterWatchlistStocks = useCallback((stocksToFilter: StockData[]): StockData[] => {
    // Oculta ações com preco_atual === 0 e tickers ocultos
    const filteredStocks = stocksToFilter
      .filter(stock => stock.preco_atual !== 0)
      .filter(stock => !hiddenTickers.includes(stock.ticker));
    // Atualiza preco_max_calc conforme perfil
    return filteredStocks.map(stock => ({
      ...stock,
      preco_max_calc: investorProfile === "conservador" ? stock.preco_max_conservador : stock.preco_max_agressivo
    }));
  }, [hiddenTickers, investorProfile]);

  // Calcular watchlistStocks usando useMemo para evitar recálculos desnecessários
  const watchlistStocks = useMemo(() => {
    return filterWatchlistStocks(stocks.filter(stock => watchlist.includes(stock.ticker)));
  }, [stocks, watchlist, filterWatchlistStocks]);

  // Função para aplicar filtros nas ações
  const applyFilters = useCallback((stocksToFilter: StockData[]): StockData[] => {
    // DEBUG: Veja o valor do searchTerm e o tamanho da lista original
    console.log('[applyFilters] searchTerm:', searchTerm, '| stocksToFilter:', stocksToFilter.length);
    // Oculta ações com preco_atual === 0 e tickers ocultos
    const filtered = stocksToFilter
      .filter(stock => stock.preco_atual !== 0)
      .filter(stock => !hiddenTickers.includes(stock.ticker));

    // Filtro de busca
    const filteredWithSearch = searchTerm
      ? filtered.filter(stock =>
          (stock.ticker ?? '').toLowerCase().includes((searchTerm ?? '').toLowerCase()) ||
          (stock.companhia ?? '').toLowerCase().includes((searchTerm ?? '').toLowerCase())
        )
      : filtered;

    // Atualiza preco_max_calc conforme perfil
    const filteredStocks = filteredWithSearch.map(stock => ({
      ...stock,
      preco_max_calc: investorProfile === "conservador" ? stock.preco_max_conservador : stock.preco_max_agressivo
    }));

    switch (selectedFilter) {
      case 'highest-dy':
        // Ordenar por DY do maior para o menor
        return filteredStocks
          .filter(stock => stock.dy_medio_calc && stock.dy_medio_calc > 0)
          .sort((a, b) => (b.dy_medio_calc || 0) - (a.dy_medio_calc || 0));

      case 'opportunity':
        // Ações com preço atual <= preço máximo Bazin E DY médio > 6%
        return filteredStocks.filter(stock => {
          if (!stock.preco_atual || !stock.preco_max_calc || !stock.dy_medio_calc) return false;
          return stock.preco_atual <= stock.preco_max_calc && stock.dy_medio_calc > 6;
        });

      case 'watchlist':
        return watchlistStocks;

      default:
        return filteredStocks;
    }
  }, [hiddenTickers, searchTerm, selectedFilter, investorProfile, watchlistStocks]);

  // Atualiza o contexto de busca ao montar se vier via query param
  useEffect(() => {
    if (searchApplied) return;
    const searchFromUrl = searchParams.get("search") || "";
    if (searchFromUrl && searchFromUrl !== searchTerm) {
      setSearchTerm(searchFromUrl);
      router.replace("/home", { scroll: false });
      setSearchApplied(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, searchApplied]);

  // Definir primeira ação quando os dados carregarem ou filtro mudar
  useEffect(() => {
    if (stocks.length > 0) {
      const filteredStocks = applyFilters(stocks);
      if (
        filteredStocks.length > 0 &&
        (!selectedStock || selectedStock.ticker !== filteredStocks[0].ticker)
      ) {
        setSelectedStock(filteredStocks[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocks, selectedFilter, consistentStocks, applyFilters]);

  // Seleciona automaticamente a primeira ação ao buscar
  useEffect(() => {
    if (searchTerm) {
      const filtered = applyFilters(stocks);
      if (filtered.length > 0) {
        setSelectedStock(filtered[0]);
      } else {
        setSelectedStock(null);
      }
    }
  }, [searchTerm, applyFilters, stocks]);

  // Quando o usuário faz uma busca e o filtro atual não retorna resultados, muda para 'none' (All Stocks)
  useEffect(() => {
    if (searchTerm) {
      const filtered = applyFilters(stocks);
      if (filtered.length === 0 && selectedFilter !== 'none') {
        setSelectedFilter('none');
      }
    }
  }, [searchTerm, applyFilters, stocks, selectedFilter]);

  // Limpa o selectedStock se a lista exibida ficar vazia
  useEffect(() => {
    if (selectedStock && stocks.length > 0) {
      const found = stocks.find(s => s.ticker === selectedStock.ticker);
      if (!found) setSelectedStock(null);
    }
  }, [stocks, selectedStock]);

  // Memoiza a função de clique para evitar re-renderizações desnecessárias em StockCard/Watchlist
  const handleStockClick = useCallback((stock: StockData) => {
    setSelectedStock(stock);
    if (window.innerWidth < 768) {
      setSheetOpen(true);
    }
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Toaster />
      <div className="font-[inter] flex-1 flex h-[calc(100vh-56px)] md:h-[calc(100vh-40px)] overflow-hidden">
        <StockList
          stocks={stocks} // Passa sempre a lista completa
          onStockClick={handleStockClick}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          /*searchTerm={searchTerm}*/
          investorProfile={investorProfile}
        />
        <StockSheet
          selectedStock={selectedStock}
          chartData={chartData}
          sheetOpen={sheetOpen}
          setSheetOpen={setSheetOpen}
        />
        <StockDetails
          selectedStock={selectedStock}
          chartData={chartData}
        />
      </div>
    </>
  );
}