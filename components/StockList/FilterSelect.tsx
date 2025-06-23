// components/StockList/FilterSelect.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type FilterOption = 'none' | 'highest-dy' | 'opportunity';

interface FilterSelectProps {
  selectedFilter: FilterOption
  onFilterChange: (filter: FilterOption) => void
}

export const FilterSelect = ({ selectedFilter, onFilterChange }: FilterSelectProps) => {
  const filterOptions = [
    { value: 'none' as FilterOption, label: 'All Stocks' },
    { value: 'highest-dy' as FilterOption, label: 'Highest Dividend Yield' },
    { value: 'opportunity' as FilterOption, label: 'Opportunity' }
  ];

  return (
    <div className="mb-2">
      <Select value={selectedFilter} onValueChange={onFilterChange}>
        <SelectTrigger className="text-[#007AFF] text-lg font-medium p-0 border-0 focus-visible:ring-0 shadow-none bg-transparent dark:bg-transparent hover:bg-transparent hover:dark:bg-transparent">
          <SelectValue placeholder="Filter stocks" />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}