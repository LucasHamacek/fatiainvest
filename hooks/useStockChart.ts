// hooks/useStockChart.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StockData, DividendData, ChartData } from '../types/stock.types'

export const useStockChart = (selectedStock: StockData | null) => {
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    async function fetchChartData() {
      if (!selectedStock) return

      try {
        const { data, error } = await supabase.rpc('dividendos_por_ano', {
          ticker_param: selectedStock.ticker
        })

        if (error) throw error

        const dividendData = (data || []) as DividendData[]
        const formattedData: ChartData[] = dividendData.map(item => ({
          year: item.ano.toString(),
          Dividend: parseFloat(item.dividendo?.toString() || '0')
        }))

        setChartData(formattedData)
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error)
        setChartData([])
      }
    }

    fetchChartData()
  }, [selectedStock])

  return { chartData }
}