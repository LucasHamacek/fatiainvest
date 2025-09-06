"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";


interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
}

const WatchlistContext = createContext<WatchlistContextType>({
  watchlist: [],
  addToWatchlist: () => { },
  removeFromWatchlist: () => { },
});

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const router = useRouter();

  // Carrega a watchlist do Supabase ao logar
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("watchlists")
        .select("ticker")
        .eq("user_id", user.id);
      if (!error && data) {
        setWatchlist(data.map((row: any) => row.ticker));
      }
    })();
  }, [user?.id]);

  const showLoginToast = () => {
    toast("Entre para adicionar ou remover ações dos seus favoritos.", {
      action: {
        label: 'Entrar',
        onClick: () => window.location.href = "/login",
      }
    });

  };

  const addToWatchlist = async (ticker: string) => {
    if (!user?.id) {
      showLoginToast();
      return;
    }
    setWatchlist((prev) => (prev.includes(ticker) ? prev : [...prev, ticker]));
    await supabase.from("watchlists").upsert({ user_id: user.id, ticker });
    toast.success("Ação adicionada aos favoritos!");
  };

  const removeFromWatchlist = async (ticker: string) => {
    if (!user?.id) {
      showLoginToast();
      return;
    }
    setWatchlist((prev) => prev.filter((t) => t !== ticker));
    await supabase.from("watchlists").delete().eq("user_id", user.id).eq("ticker", ticker);
    toast.success("Ação removida dos favoritos!");
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
