"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// ✅ Props from backend
type ChartPoint = {
  month: string
  added: number
  disposed: number
  transfers: number
  cumulative: number
}

type Props = {
  data: ChartPoint[]
}

// ✅ Define chart config with HSL-based colors (blue palette)
const chartConfig = {
  added: {
    label: "New Assets",
    color: "hsl(210, 90%, 55%)", // medium blue
  },
  disposed: {
    label: "Disposed Assets",
    color: "hsl(200, 70%, 45%)", // darker blue
  },
  transfers: {
    label: "Transfers",
    color: "hsl(220, 80%, 65%)", // lighter blue
  },
  cumulative: {
    label: "Total Active Assets",
    color: "hsl(210, 100%, 35%)", // strong dark blue for emphasis
  },
} satisfies ChartConfig

export default function AssetsOverTimeChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets Over Time</CardTitle>
        <CardDescription>
          Monthly additions, disposals, transfers, and cumulative totals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)} // short month label
            />
            <YAxis tickLine={false} axisLine={false} />
            {/* ✅ Custom Tooltip showing ALL lines */}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />

            {/* New Assets */}
            <Line
              dataKey="added"
              type="monotone"
              stroke={chartConfig.added.color}
              strokeWidth={2}
              dot={false}
            />

            {/* Disposed Assets */}
            <Line
              dataKey="disposed"
              type="monotone"
              stroke={chartConfig.disposed.color}
              strokeWidth={2}
              dot={false}
            />

            {/* Transfers */}
            <Line
              dataKey="transfers"
              type="monotone"
              stroke={chartConfig.transfers.color}
              strokeWidth={2}
              dot={false}
            />

            {/* Cumulative Active Assets */}
            <Line
              dataKey="cumulative"
              type="monotone"
              stroke={chartConfig.cumulative.color}
              strokeWidth={3} // thicker to stand out
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Overall asset pool trending up <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing trends for the last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
