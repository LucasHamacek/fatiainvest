// components/StockList/SearchInput.tsx
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRef, useEffect, useState, useMemo } from "react"

interface StockSuggestion {
  ticker: string;
  companhia: string;
}

interface SearchInputProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  stocks?: StockSuggestion[] // Novo: lista de ações para autocomplete
}

export const SearchInput = ({ searchTerm, setSearchTerm, stocks = [] }: SearchInputProps) => {
  const [inputValue, setInputValue] = useState(searchTerm)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fecha sugestões ao clicar fora
  useEffect(() => {
    if (!showSuggestions) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showSuggestions])

  // Sugestões filtradas
  const suggestions = useMemo(() => {
    if (!inputValue) return [];
    return stocks.filter(stock =>
      (stock.ticker ?? "").toLowerCase().includes(inputValue.toLowerCase()) ||
      (stock.companhia ?? "").toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 8); // Limita sugestões
  }, [inputValue, stocks]);

  // Atualiza o valor local ao digitar
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setShowSuggestions(true)
  }

  // Dispara busca ao submeter (Enter)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(inputValue)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: StockSuggestion) => {
    setInputValue(suggestion.ticker)
    setSearchTerm(suggestion.ticker)
    setShowSuggestions(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <form onSubmit={handleSubmit} autoComplete="off">
        <Search className="absolute left-3 top-2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search"
          className="pl-9 pr-10 bg-gray-100 border-0 shadow-none rounded-full text-sm"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setShowSuggestions(true)}
        />
        {inputValue && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-gray-700"
            onClick={() => {
              setInputValue("")
              setSearchTerm("")
              setShowSuggestions(false)
            }}
            aria-label="Limpar busca"
          >
            <X className="h-5 w-5 text-gray-500 stroke-1.5" />
          </button>
        )}
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-popover dark:bg-zinc-900 border border-border dark:border-zinc-700 rounded-md shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          {suggestions.map((s, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === suggestions.length - 1;
            return (
              <li
                key={s.ticker}
                className={[
                  "px-4 py-2 cursor-pointer transition-colors select-none",
                  "hover:bg-accent hover:text-accent-foreground dark:hover:bg-zinc-800",
                  isFirst ? "rounded-t-md" : "",
                  isLast ? "rounded-b-md" : ""
                ].join(" ")}
                onMouseDown={() => handleSuggestionClick(s)}
                tabIndex={0}
              >
                <span className="font-semibold">{s.ticker}</span> <span className="text-muted-foreground">{s.companhia}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}