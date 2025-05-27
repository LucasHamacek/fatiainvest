// components/StockDetails/StockChart.tsx
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts"

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
  return (
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
          tickFormatter={(value) => isMobile ? `${value}` : `$${value}`}
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
  )
}