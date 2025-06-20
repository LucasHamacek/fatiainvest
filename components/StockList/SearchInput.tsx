// components/StockList/SearchInput.tsx
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface SearchInputProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export const SearchInput = ({ searchTerm, setSearchTerm }: SearchInputProps) => {
  const [inputValue, setInputValue] = useState(searchTerm)

  // Atualiza o valor local ao digitar
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  // Dispara busca ao submeter (Enter)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(inputValue)
  }

  return (
    <form className="relative" onSubmit={handleSubmit}>
      <Search className="absolute left-3 top-2 h-5 w-5 text-muted-foreground" />
      <Input
        placeholder="Search"
        className="pl-9 pr-10 bg-gray-100 border-0 shadow-none rounded-full text-sm"
        value={inputValue}
        onChange={handleChange}
      />
      {inputValue && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-gray-700"
          onClick={() => {
            setInputValue("")
            setSearchTerm("")
          }}
          aria-label="Limpar busca"
        >
          <X className="h-5 w-5 text-gray-500 stroke-1.5" />
        </button>
      )}
    </form>
  )
}