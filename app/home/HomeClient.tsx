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
import { Watchlist } from "@/components/StockList/Watchlist";
import { useSearchParams, useRouter } from "next/navigation";
import { useWatchlist } from "@/context/WatchlistContext";
import { supabase } from "@/lib/supabaseClient";
import { Toaster } from "@/components/ui/sonner";

export default function HomeClient() {
  const { stocks, loading } = useStocksContext();
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

  // Estado de autenticação
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && data.user.id && data.user.email) {
        setUser({ id: data.user.id, email: data.user.email });
      } else {
        setUser(null);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && session.user.id && session.user.email) {
        setUser({ id: session.user.id, email: session.user.email });
      } else {
        setUser(null);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Carrega perfil do usuário autenticado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setInvestorProfile(data.user?.user_metadata?.investorProfile || "agressivo");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setInvestorProfile(session?.user?.user_metadata?.investorProfile || "agressivo");
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Lista de tickers que você quer ocultar
  const hiddenTickers = useMemo(() => [
    'AESB3',
    'CIEL3',
    'ENAT3',
    'ODPV3',
    'TRPL3',
    'TRPL4'
  ], []);

  // Exemplo de lista de tickers da watchlist (substitua por dados reais do usuário)
  const { watchlist } = useWatchlist();
  const watchlistStocks = stocks.filter(stock => watchlist.includes(stock.ticker));

  // Função para aplicar filtros nas ações
  const applyFilters = useCallback((stocksToFilter: StockData[]): StockData[] => {
    // Oculta ações com preco_atual === 0 e tickers ocultos
    let filteredStocks = stocksToFilter
      .filter(stock => stock.preco_atual !== 0)
      .filter(stock => !hiddenTickers.includes(stock.ticker));

    // Filtro de busca
    if (searchTerm) {
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

    switch (selectedFilter) {
      case 'highest-dy':
        // Ordenar por DY do maior para o menor
        return filteredStocks
          .filter(stock => stock.dy_medio_calc && stock.dy_medio_calc > 0)
          .sort((a, b) => (b.dy_medio_calc || 0) - (a.dy_medio_calc || 0));

      case 'opportunity':
        // Ações com preço atual próximo do preço máximo (+-10%)
        return filteredStocks.filter(stock => {
          if (!stock.preco_atual || !stock.preco_max_calc) return false;
          const currentPrice = stock.preco_atual;
          const maxPrice = stock.preco_max_calc;
          const percentageFromMax = ((maxPrice - currentPrice) / maxPrice) * 100;
          return percentageFromMax >= -10 && percentageFromMax <= 10;
        });

      case 'consistent':
        if (!stocksToFilter.length) return [];
        return filteredStocks.filter(stock => {
          if (!stock.chartData || stock.chartData.length < 5) return false;
          const last5 = [...stock.chartData]
            .sort((a, b) => Number(b.ano) - Number(a.ano))
            .slice(0, 5);
          return last5.every(d => Number(d.dividendo) > 0);
        });

      default:
        return filteredStocks;
    }
  }, [hiddenTickers, searchTerm, selectedFilter, investorProfile]);

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

  const tab = searchParams.get("tab") || "stocks";
  // Determina a lista de ações exibidas atualmente
  const displayedStocks = tab === "watchlist" ? watchlistStocks : applyFilters(stocks);

  // Limpa o selectedStock se a lista exibida ficar vazia
  useEffect(() => {
    if (displayedStocks.length === 0 && selectedStock) {
      setSelectedStock(null);
    }
  }, [displayedStocks.length, selectedStock]);

  // Função para lidar com o clique no card (desktop vs mobile)
  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock);
    // No mobile, abrir a sheet
    if (window.innerWidth < 768) {
      setSheetOpen(true);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (tab === "watchlist" && !user) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
        Faça login para acessar sua Watchlist.
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="flex-1 flex max-h-[calc(100vh-4rem)] overflow-hidden">
        {tab === "watchlist" ? (
          <Watchlist
            stocks={watchlistStocks}
            onStockClick={handleStockClick}
          />
        ) : (
          <StockList
            stocks={applyFilters(stocks)}
            searchTerm={searchTerm}
            onStockClick={handleStockClick}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        )}
        <StockSheet
          selectedStock={displayedStocks.length > 0 ? selectedStock : null}
          chartData={chartData}
          sheetOpen={sheetOpen}
          setSheetOpen={setSheetOpen}
        />
        <StockDetails
          selectedStock={displayedStocks.length > 0 ? selectedStock : null}
          chartData={chartData}
        />
      </div>
    </>
  );
}
