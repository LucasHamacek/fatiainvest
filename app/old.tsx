"use client"

import {
  Search,
  Plus,
  Dot
} from "lucide-react"

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts"

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
  MenubarLabel
} from "@/components/ui/menubar"

import {
  Input,
} from "@/components/ui/input"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Button
} from "@/components/ui/button"

import {
  Progress
} from "@/components/ui/progress"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

// Tipos para os dados
interface StockData {
  ticker: string
  companhia: string
  setor: string
  dy_medio_calc: number
  preco_max_calc: number
  dividendo_calc: number
  preco_atual: number
  data_preco: string
}

interface DividendData {
  ano: number
  dividendo: number
}

interface ChartData {
  year: string
  Dividend: number
}

const chartConfig = {
  desktop: {
    label: "year",
    color: "#007AFF",
  },
} satisfies ChartConfig

export default function Page() {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [progress, setProgress] = useState(13)

  // Estado para controlar qual preço mostrar (radio button)
  const [priceView, setPriceView] = useState<'current' | 'max'>('current')
  // Estado para controlar a Sheet no mobile
  const [sheetOpen, setSheetOpen] = useState(false)

  // Buscar dados das ações
  useEffect(() => {
    async function fetchStocks() {
      try {
        // Simular progresso de carregamento
        const timer1 = setTimeout(() => setProgress(40), 200)
        const timer2 = setTimeout(() => setProgress(70), 400)
        const timer3 = setTimeout(() => setProgress(90), 600)

        const { data, error } = await supabase.rpc('calcular_dados_completos_acoes')

        if (error) throw error

        const stocksData = (data || []) as StockData[]
        setStocks(stocksData)
        if (stocksData && stocksData.length > 0) {
          setSelectedStock(stocksData[0])
        }

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

  // Buscar dados do gráfico quando uma ação é selecionada
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

  // Filtrar ações baseado na pesquisa
  const filteredStocks = stocks.filter(stock =>
    stock.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.companhia?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calcular variação (simulada - você pode ajustar conforme sua lógica)
  const calculateVariation = (currentPrice: number | null, maxPrice: number | null): string => {
    if (!currentPrice || !maxPrice) return '0.00'
    const variation = (((currentPrice - maxPrice) / maxPrice) * 100)
    const sign = variation >= 0 ? '+' : ''
    return `${sign}${variation.toFixed(2)}`
  }

  // Calcular projeção DY
  const calculateDYProjection = (dividendoCalc: number | null, precoAtual: number | null): string => {
    if (!dividendoCalc || !precoAtual) return '0.00'
    return ((dividendoCalc / precoAtual) * 100).toFixed(2)
  }

  // Função para obter o preço a ser exibido baseado na seleção do radio
  const getDisplayPrice = (stock: StockData): number => {
    return priceView === 'max' ? (stock.preco_max_calc || 0) : (stock.preco_atual || 0)
  }

  // Função para lidar com o clique no card (desktop vs mobile)
  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock)
    // No mobile, abrir a sheet
    if (window.innerWidth < 768) {
      setSheetOpen(true)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-lg font-medium">Carregando dados das ações...</div>
        <Progress value={progress} className="w-[60%]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center px-4 border-b border-gray-200">
        <div>
          <svg className="size-5" viewBox="0 0 23 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.3333 23.1666C11.3333 24.6549 11.0402 26.1287 10.4706 27.5037C9.90109 28.8787 9.06629 30.1281 8.01389 31.1805C6.96149 32.2329 5.71211 33.0677 4.33708 33.6373C2.96206 34.2068 1.48832 34.5 0 34.5L4.95396e-07 23.1666H11.3333Z" fill="#74B3FB" />
            <path d="M22.6667 0.5C22.6667 1.98832 22.3736 3.46206 21.804 4.83709C21.2345 6.21211 20.3997 7.46149 19.3473 8.51389C18.2949 9.56629 17.0455 10.4011 15.6705 10.9706C14.2954 11.5402 12.8217 11.8334 11.3334 11.8334L11.3334 0.5H22.6667Z" fill="#007AFF" />
            <path d="M0 11.8334C0 10.345 0.293146 8.87129 0.8627 7.49626C1.43225 6.12124 2.26706 4.87186 3.31946 3.81946C4.37186 2.76706 5.62124 1.93225 6.99626 1.3627C8.37129 0.793146 9.84503 0.5 11.3333 0.5L11.3333 11.8334H0Z" fill="#8ABEFA" />
            <path d="M11.3334 11.8334C12.8217 11.8334 14.2954 12.1265 15.6705 12.6961C17.0455 13.2656 18.2949 14.1004 19.3473 15.1528C20.3997 16.2052 21.2345 17.4546 21.804 18.8296C22.3736 20.2047 22.6667 21.6784 22.6667 23.1667L11.3334 23.1667V11.8334Z" fill="#499EFD" />
          </svg>
        </div>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent className="shadow-xs">
              <MenubarLabel>Stock Info</MenubarLabel>
              <MenubarSeparator />
              <MenubarRadioGroup value={priceView} onValueChange={(value) => setPriceView(value as 'current' | 'max')}>
                <MenubarRadioItem value="current">
                  Current Price
                </MenubarRadioItem>
                <MenubarRadioItem value="max">
                  Max. Price
                </MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Lists</MenubarTrigger>
            <MenubarContent className="shadow-xs">
              <MenubarLabel>My Lists</MenubarLabel>
              <MenubarSeparator />
              <MenubarCheckboxItem checked>All Stocks</MenubarCheckboxItem>
              <MenubarCheckboxItem>Financial</MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarItem>Add New List</MenubarItem>
              <MenubarItem>Manange Lists</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Settings</MenubarTrigger>
            <MenubarContent className="shadow-xs">
              <MenubarItem>New Tab</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Account</MenubarTrigger>
            <MenubarContent className="shadow-xs">
              <MenubarItem>New Tab</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Log Out</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
      <div className="flex flex-1 overflow-hidden">

        {/* Conteúdo sidebar */}
        <div className="w-full md:w-64 p-4 border-r border-gray-200">
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"></Search>
            <Input
              placeholder="Search"
              className="pl-8 bg-gray-100 border-0 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            {filteredStocks.map((stock) => (
              <Card
                key={stock.ticker}
                className="flex flex-row justify-between items-center bg-transparent p-0 mb-2 border-0 shadow-none cursor-pointer"
                onClick={() => handleStockClick(stock)}
              >
                <CardHeader className="w-full p-0 gap-0">
                  <CardTitle className="text-lg font-semibold">{stock.ticker}</CardTitle>
                  <CardDescription className="truncate">{stock.companhia}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col min-w-16 items-end p-0 bg-red-500 px-1 rounded-[4px]">
                  <p className="flex gap-1 font-medium">
                    {parseFloat(getDisplayPrice(stock).toString()).toFixed(2)}
                    <span className="font-normal">BRL</span>
                  </p>
                  <p className="flex gap-1 text-sm">
                    {parseFloat((stock.dy_medio_calc || 0).toString()).toFixed(2)}%
                    <span>DY</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sheet para mobile */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="h-[80vh] p-4">
            {selectedStock && (
              <>
                <SheetHeader className="p-0 mb-4">
                  <SheetTitle className="text-2xl font-bold">
                    {selectedStock.ticker}
                    <span className="text-gray-500 text-sm font-normal ml-1"> {selectedStock.companhia}</span>
                  </SheetTitle>
                  <SheetDescription>
                    <div className="flex items-center">
                      Ibovespa <Dot className="size-5" />
                      <span>{selectedStock.setor || 'N/A'}</span> <Dot className="size-5" />
                      <span>BRL</span>
                    </div>
                  </SheetDescription>
                </SheetHeader>

                <div>
                  <Card className="shadow-none border-0 p-0 mb-4">
                    <CardContent className="p-0">
                      <ChartContainer className="max-h-96 w-full" config={chartConfig}>
                        <AreaChart
                          accessibilityLayer
                          data={chartData}
                          margin={{
                            left: 12,
                            right: 0,
                          }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="year"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 4)}
                            interval={0}
                          />
                          <YAxis
                            orientation="right"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `${value}`}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                          />
                          <Area
                            dataKey="Dividend"
                            type="linear"
                            fill="var(--color-desktop)"
                            fillOpacity={0.7}
                            stroke="var(--color-desktop)"
                          />
                        </AreaChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card className="p-0 shadow-none border-0">
                    <CardContent className="grid grid-flow-col grid-rows-3 gap-x-4 gap-y-1 p-0">
                      <div className="flex itens-center justify-between w-full">
                        <p className="text-sm font-light truncate">Current Price</p>
                        <p className="font-medium">{parseFloat((selectedStock.preco_atual || 0).toString()).toFixed(2)}</p>
                      </div>
                      <div className="flex itens-center justify-between w-full">
                        <p className="text-sm font-light truncate">Max. Value</p>
                        <p className="font-medium">{parseFloat((selectedStock.preco_max_calc || 0).toString()).toFixed(2)}</p>
                      </div>
                      <div className="flex itens-center justify-between w-full">
                        <p className="text-sm font-light truncate">Variation</p>
                        <p className="font-medium">
                          {calculateVariation(selectedStock.preco_atual, selectedStock.preco_max_calc)}%
                        </p>
                      </div>
                      <div className="flex itens-center justify-between w-full">
                        <p className="text-sm font-light truncate">Dividend Yield</p>
                        <p className="font-medium">{parseFloat((selectedStock.dy_medio_calc || 0).toString()).toFixed(2)}%</p>
                      </div>
                      <div className="flex itens-center justify-between w-full">
                        <p className="text-sm font-light truncate">Avg. Dividend</p>
                        <p className="font-medium">{parseFloat((selectedStock.dividendo_calc || 0).toString()).toFixed(2)}</p>
                      </div>
                      <div className="flex itens-center justify-between w-full">
                        <p className="text-sm font-light truncate">DY Projection</p>
                        <p className="font-medium">
                          {calculateDYProjection(selectedStock.dividendo_calc, selectedStock.preco_atual)}%
                        </p>
                      </div>
                      {/* Últimos dividendos - mostrando apenas os que existem */}
                      {chartData.slice(-5).reverse().map((dividend, index) => (
                        <div key={index} className="flex itens-center justify-between w-full">
                          <p className="text-sm font-light truncate">Dividend ({dividend.year})</p>
                          <p className="font-medium">{dividend.Dividend.toFixed(2)}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 overflow-auto hidden md:flex md:flex-col">
          {selectedStock && (
            <>
              <Card className="shadow-none border-0 p-0 mb-4">
                <CardHeader className="flex items-center justify-between mb-4 p-0">
                  <div className="flex flex-col">
                    <CardTitle className="text-3xl font-bold mb-2">
                      {selectedStock.ticker}
                      <span className="text-gray-500 text-sm font-normal ml-1"> {selectedStock.companhia}</span>
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500 pb-4">
                      <p className="flex itens-center" >
                        Ibovespa <Dot className="size-5" />
                        <span>{selectedStock.setor || 'N/A'}</span> <Dot className="size-5" />
                        <span>BRL</span>
                      </p>
                    </CardDescription>
                  </div>
                  <Button className="cursor-pointer"> <Plus className="size-4" />Add to List</Button>
                </CardHeader>

                <CardContent className="p-0">
                  <ChartContainer className="max-h-96 w-full" config={chartConfig}>
                    <AreaChart
                      accessibilityLayer
                      data={chartData}
                      margin={{
                        left: 12,
                        right: 0,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="year"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 4)}
                        interval={0}
                      />
                      <YAxis
                        orientation="right"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Area
                        dataKey="Dividend"
                        type="linear"
                        fill="var(--color-desktop)"
                        fillOpacity={0.7}
                        stroke="var(--color-desktop)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card className="p-0 shadow-none border-0">
                <CardContent className="grid grid-flow-col grid-rows-3 gap-x-4 gap-y-1 p-0">
                  <div className="flex itens-center justify-between w-full">
                    <p className="text-sm font-light truncate">Current Price</p>
                    <p className="font-medium">{parseFloat((selectedStock.preco_atual || 0).toString()).toFixed(2)}</p>
                  </div>
                  <div className="flex itens-center justify-between w-full">
                    <p className="text-sm font-light truncate">Max. Value</p>
                    <p className="font-medium">{parseFloat((selectedStock.preco_max_calc || 0).toString()).toFixed(2)}</p>
                  </div>
                  <div className="flex itens-center justify-between w-full">
                    <p className="text-sm font-light truncate">Variation</p>
                    <p className="font-medium">
                      {calculateVariation(selectedStock.preco_atual, selectedStock.preco_max_calc)}%
                    </p>
                  </div>
                  <div className="flex itens-center justify-between w-full">
                    <p className="text-sm font-light truncate">Dividend Yield</p>
                    <p className="font-medium">{parseFloat((selectedStock.dy_medio_calc || 0).toString()).toFixed(2)}%</p>
                  </div>
                  <div className="flex itens-center justify-between w-full">
                    <p className="text-sm font-light truncate">Avg. Dividend</p>
                    <p className="font-medium">{parseFloat((selectedStock.dividendo_calc || 0).toString()).toFixed(2)}</p>
                  </div>
                  <div className="flex itens-center justify-between w-full">
                    <p className="text-sm font-light truncate">DY Projection</p>
                    <p className="font-medium">
                      {calculateDYProjection(selectedStock.dividendo_calc, selectedStock.preco_atual)}%
                    </p>
                  </div>
                  {/* Últimos dividendos - mostrando apenas os que existem */}
                  {chartData.slice(-5).reverse().map((dividend, index) => (
                    <div key={index} className="flex itens-center justify-between w-full">
                      <p className="text-sm font-light truncate">Dividend ({dividend.year})</p>
                      <p className="font-medium">{dividend.Dividend.toFixed(2)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

  // Definir primeira ação quando os dados carregarem
useEffect(() => {
  if (stocks.length > 0 && !selectedStock) {
    setSelectedStock(stocks[0])
  }
}, [stocks, selectedStock]) 