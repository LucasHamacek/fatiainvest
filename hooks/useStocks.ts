import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { StockData } from '../types/stock.types'

export const useStocks = () => {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(13)

  useEffect(() => {
    async function fetchStocks() {
      try {
        // Simular progresso de carregamento
        const timer1 = setTimeout(() => setProgress(40), 200)
        const timer2 = setTimeout(() => setProgress(70), 400)
        const timer3 = setTimeout(() => setProgress(90), 600)

        const { data, error } = await supabase.rpc('calcular_dados_completos_acoes')

        if (error) throw error

        // Para cada ação, busca os dividendos anuais
        const stocksWithDividends = await Promise.all(
          (data || []).map(async (stock: any) => {
            const { data: chartData } = await supabase.rpc('dividendos_por_ano', {
              ticker_param: stock.ticker,
            });
            return { ...stock, chartData: chartData || [] };
          })
        );

        setStocks(stocksWithDividends)

        // Finalizar carregamento
        setTimeout(() => setProgress(100), 100)

        // Limpar timers
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      } catch (error) {
        console.error('Erro ao buscar ações:', error)
      } finally {
        setTimeout(() => setLoading(false), 800)
      }
    }

    fetchStocks()
  }, [])

  return { stocks, loading, progress }
}