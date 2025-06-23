"use client";
import { createContext, useContext, useState } from "react";

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  searchTerm: "",
  setSearchTerm: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("");
  // Log para depuração
  const debugSetSearchTerm = (term: string) => {
    setSearchTerm(term);
  };
  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm: debugSetSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
