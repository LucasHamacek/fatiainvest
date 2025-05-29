// components/StockList/SearchInput.tsx
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchInputProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export const SearchInput = ({ searchTerm, setSearchTerm }: SearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"></Search>
      <Input
        placeholder="Search"
        className="pl-8 bg-gray-100 border-0 shadow-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}