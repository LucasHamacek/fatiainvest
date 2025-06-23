"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


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
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Carrega o usuário autenticado do Supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Carrega a watchlist do Supabase ao logar
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data, error } = await supabase
        .from("watchlists")
        .select("ticker")
        .eq("user_id", userId);
      if (!error && data) {
        setWatchlist(data.map((row: any) => row.ticker));
      }
    })();
  }, [userId]);

  const showLoginToast = () => {
    toast("Login to add or remove stocks from your favorites.", {
      action: {
        label: 'Login',
        onClick: () => window.location.href = "/login",
      }
    });

  };

  const addToWatchlist = async (ticker: string) => {
    if (!userId) {
      showLoginToast();
      return;
    }
    setWatchlist((prev) => (prev.includes(ticker) ? prev : [...prev, ticker]));
    await supabase.from("watchlists").upsert({ user_id: userId, ticker });
    toast.success("Stock added to favorites!");
  };

  const removeFromWatchlist = async (ticker: string) => {
    if (!userId) {
      showLoginToast();
      return;
    }
    setWatchlist((prev) => prev.filter((t) => t !== ticker));
    await supabase.from("watchlists").delete().eq("user_id", userId).eq("ticker", ticker);
    toast.success("Stock removed from favorites!");
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
