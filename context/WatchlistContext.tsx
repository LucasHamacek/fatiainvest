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
    toast("Entre para gerenciar sua lista de favoritos.", {
      icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
        <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z" clip-rule="evenodd" />
      </svg>),
    });

  };

  const addToWatchlist = async (ticker: string) => {
    if (!user?.id) {
      showLoginToast();
      return;
    }
    setWatchlist((prev) => (prev.includes(ticker) ? prev : [...prev, ticker]));
    await supabase.from("watchlists").upsert({ user_id: user.id, ticker });
    toast.success("Ação adicionada aos favoritos!", {
      icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
      </svg>),
    });
  };

  const removeFromWatchlist = async (ticker: string) => {
    if (!user?.id) {
      showLoginToast();
      return;
    }
    setWatchlist((prev) => prev.filter((t) => t !== ticker));
    await supabase.from("watchlists").delete().eq("user_id", user.id).eq("ticker", ticker);
    toast.success("Ação removida dos favoritos!", {
      icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
        <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clip-rule="evenodd" />
      </svg>),
});
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
