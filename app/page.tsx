// Home.tsx atualizado
"use client"

import { useState, useEffect } from 'react'
import { StockData, PriceView, } from '../types/stock.types'
import { useStocks } from '../hooks/useStocks'
import { useStockChart } from '../hooks/useStockChart'
import { FilterOption } from '../components/StockList/FilterSelect'
import { Header } from '../components/Layout/Header'
import { LoadingScreen } from '../components/Layout/LoadingScreen'
import { StockList } from '../components/StockList/StockList'
import { StockDetails } from '../components/StockDetails/StockDetails'
import { StockSheet } from '../components/StockDetails/StockSheet'

export default function Home() {
  const { stocks, loading, progress } = useStocks()
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
  const { chartData } = useStockChart(selectedStock)
  const [searchTerm, setSearchTerm] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('none')
  const [consistentStocks,] = useState<Set<string>>(new Set())

  // Lista de tickers que você quer ocultar
  const hiddenTickers = [
    'AESB3',
    'CIEL3',
    'ENAT3',
    'ODPV3',
    'TRPL3',
    'TRPL4'
  ]

  // Função para aplicar filtros nas ações
  const applyFilters = (stocksToFilter: StockData[]): StockData[] => {
    const filteredStocks = stocksToFilter.filter(stock => !hiddenTickers.includes(stock.ticker))

    switch (selectedFilter) {
      case 'highest-dy':
        // Ordenar por DY do maior para o menor
        return filteredStocks
          .filter(stock => stock.dy_medio_calc && stock.dy_medio_calc > 0)
          .sort((a, b) => (b.dy_medio_calc || 0) - (a.dy_medio_calc || 0))

      case 'opportunity':
        // Ações com preço atual próximo do preço máximo (+-10%)
        return filteredStocks.filter(stock => {
          if (!stock.preco_atual || !stock.preco_max_calc) return false
          const currentPrice = stock.preco_atual
          const maxPrice = stock.preco_max_calc
          const percentageFromMax = ((maxPrice - currentPrice) / maxPrice) * 100
          return percentageFromMax >= -10 && percentageFromMax <= 10
        })

      case 'consistent':
        // Ações que distribuíram dividendos > 0 nos últimos 5 anos consecutivos
        return filteredStocks.filter(stock => consistentStocks.has(stock.ticker))

      default:
        return filteredStocks
    }
  }

  // Definir primeira ação quando os dados carregarem ou filtro mudar
  useEffect(() => {
    if (stocks.length > 0) {
      const filteredStocks = applyFilters(stocks)
      if (filteredStocks.length > 0 && (!selectedStock || selectedFilter !== 'none')) {
        setSelectedStock(filteredStocks[0])
      }
    }
  }, [stocks, selectedFilter, consistentStocks])

  // Função para lidar com o clique no card (desktop vs mobile)
  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock)
    // No mobile, abrir a sheet
    if (window.innerWidth < 768) {
      setSheetOpen(true)
    }
  }

  if (loading) {
    return <LoadingScreen progress={progress} />
  }

  return (
    <div className="flex flex-col h-screen">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <Header 
        priceView={priceView} 
        setPriceView={setPriceView}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="flex flex-1 overflow-hidden">
        <StockList
          stocks={applyFilters(stocks)}
          priceView={priceView}
          searchTerm={searchTerm}
          onStockClick={handleStockClick}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        <StockSheet
          selectedStock={selectedStock}
          chartData={chartData}
          sheetOpen={sheetOpen}
          setSheetOpen={setSheetOpen}
        />

        <StockDetails
          selectedStock={selectedStock}
          chartData={chartData}
        />
      </div>
    </div>
  )
}