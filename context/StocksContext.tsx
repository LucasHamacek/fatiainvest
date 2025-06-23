"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { StockData } from "@/types/stock.types";

interface StocksContextType {
  stocks: StockData[];
  loading: boolean;
  error: string | null;
}

const StocksContext = createContext<StocksContextType>({
  stocks: [],
  loading: true,
  error: null,
});

export function StocksProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStocks() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc("calcular_dados_completos_acoes");
        console.log("[StocksContext] Resultado do fetch:", data, error);
        if (error) throw error;
        setStocks(data || []);
      } catch (err: any) {
        setError("Erro ao buscar ações");
        setStocks([]);
        console.error("[StocksContext] Erro ao buscar ações:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStocks();
  }, []);

  return (
    <StocksContext.Provider value={{ stocks, loading, error }}>
      {children}
    </StocksContext.Provider>
  );
}

export function useStocksContext() {
  return useContext(StocksContext);
}
