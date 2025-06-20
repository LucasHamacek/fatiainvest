// components/Layout/Header.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useSearch } from "@/context/SearchContext";
import { SearchInput } from '../StockList/SearchInput'
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";

export const Header = () => {
  const { searchTerm, setSearchTerm } = useSearch();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verifica o usuário ao montar
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // Escuta mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  };

  // Função para lidar com a busca e redirecionar se necessário
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Sempre redireciona para /home?search=term, mesmo se estiver na watchlist ou outra rota
    if (!pathname.startsWith("/home")) {
      router.push(`/home?search=${encodeURIComponent(term)}`);
    } else {
      // Já está na home (inclui tab=watchlist), remove o tab e atualiza o search param
      const params = new URLSearchParams(window.location.search);
      params.delete("tab"); // Remove tab=watchlist
      params.set("search", term);
      router.replace(`/home?${params.toString()}`);
    }
  };

  return (
    <div className='flex items-center gap-2 p-4 md:border-b border-gray-200 h-16'>
      <a href="/home">
        <svg className="size-6" viewBox="0 0 23 35" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.3333 23.1666C11.3333 24.6549 11.0402 26.1287 10.4706 27.5037C9.90109 28.8787 9.06629 30.1281 8.01389 31.1805C6.96149 32.2329 5.71211 33.0677 4.33708 33.6373C2.96206 34.2068 1.48832 34.5 0 34.5L4.95396e-07 23.1666H11.3333Z" fill="#74B3FB" />
          <path d="M22.6667 0.5C22.6667 1.98832 22.3736 3.46206 21.804 4.83709C21.2345 6.21211 20.3997 7.46149 19.3473 8.51389C18.2949 9.56629 17.0455 10.4011 15.6705 10.9706C14.2954 11.5402 12.8217 11.8334 11.3334 11.8334L11.3334 0.5H22.6667Z" fill="#007AFF" />
          <path d="M0 11.8334C0 10.345 0.293146 8.87129 0.8627 7.49626C1.43225 6.12124 2.26706 4.87186 3.31946 3.81946C4.37186 2.76706 5.62124 1.93225 6.99626 1.3627C8.37129 0.793146 9.84503 0.5 11.3333 0.5L11.3333 11.8334H0Z" fill="#8ABEFA" />
          <path d="M11.3334 11.8334C12.8217 11.8334 14.2954 12.1265 15.6705 12.6961C17.0455 13.2656 18.2949 14.1004 19.3473 15.1528C20.3997 16.2052 21.2345 17.4546 21.804 18.8296C22.3736 20.2047 22.6667 21.6784 22.6667 23.1667L11.3334 23.1667V11.8334Z" fill="#499EFD" />
        </svg>
      </a>
      <div className='w-full'>
        <SearchInput searchTerm={searchTerm} setSearchTerm={handleSearch} />
      </div>
      {user ? (
        <>
          <button
            className="ml-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            onClick={() => router.push("/home?tab=watchlist")}
          >
            Watchlist
          </button>
          <Button className='ml-2'
            variant="outline"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </>
      ) : (
        <Button className='ml-2'
          variant="outline"
          onClick={() => window.location.href = '/login'}
        >
          Login
        </Button>
      )}
    </div>
  )
}