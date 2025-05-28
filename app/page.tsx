"use client"

import { useState, useEffect } from 'react'
import { StockData, PriceView } from '../types/stock.types'
import { useStocks } from '../hooks/useStocks'
import { useStockChart } from '../hooks/useStockChart'
import { Header } from '../components/Layout/Header'
import { LoadingScreen } from '../components/Layout/LoadingScreen'
import { StockList } from '../components/StockList/StockList'
import { StockDetails } from '../components/StockDetails/StockDetails'
import { StockSheet } from '../components/StockDetails/StockSheet'

export default function Page() {
  const { stocks, loading, progress } = useStocks()
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
  const { chartData } = useStockChart(selectedStock)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceView, setPriceView] = useState<PriceView>('current')
  const [sheetOpen, setSheetOpen] = useState(false)

  // Lista de tickers que você quer ocultar
  const hiddenTickers = [
    'AESB3',
    'CIEL3', 
    'ENAT3',
    'ODPV3',
    'TRPL3',
    'TRPL4'
    // Adicione aqui os tickers que deseja ocultar
  ]

  // Definir primeira ação quando os dados carregarem
  useEffect(() => {
    if (stocks.length > 0 && !selectedStock) {
      // Filtrar também a primeira ação para não selecionar um ticker oculto
      const visibleStocks = stocks.filter(stock => !hiddenTickers.includes(stock.ticker))
      if (visibleStocks.length > 0) {
        setSelectedStock(visibleStocks[0])
      }
    }
  }, [stocks, selectedStock])

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

      <Header priceView={priceView} setPriceView={setPriceView} />

      <div className="flex flex-1 overflow-hidden">
        <StockList
          stocks={stocks}
          priceView={priceView}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onStockClick={handleStockClick}
          hiddenTickers={hiddenTickers} // Adicionada a nova prop
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