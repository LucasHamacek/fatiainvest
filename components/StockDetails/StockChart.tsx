// components/StockDetails/StockChart.tsx
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts"
import { useRef, useLayoutEffect, useState } from "react"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { ChartData } from '../../types/stock.types'

const chartConfig = {
  desktop: {
    label: "year",
    color: "#007AFF",
  },
} satisfies ChartConfig

interface StockChartProps {
  chartData: ChartData[]
  isMobile?: boolean
}

export const StockChart = ({ chartData, isMobile = false }: StockChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canRender, setCanRender] = useState(false)

  useLayoutEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setCanRender(width > 0 && height > 0)
    }
  }, [chartData])

  return (
    <div ref={containerRef} className="w-full min-h-[200px] max-h-96 mt-2">
      {canRender && (
        <ChartContainer className="w-full min-h-[200px] max-h-96 mt-2" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 0,
            }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#007AFF" stopOpacity={1}/>
                <stop offset="100%" stopColor="#007AFF" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value.slice(0, 4)}
              interval={0}
            />
            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => isMobile ? `${value}` : `${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="Dividend"
              type="linear"
              fill="url(#colorGradient)"
              stroke="#007AFF"
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  )
}