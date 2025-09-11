"use client"


import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"


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


// ✅ Define chart config with real colors
const chartConfig = {
  added: {
    label: "New Assets",
    color: "#3B82F6", // blue
  },
  disposed: {
    label: "Disposed Assets",
    color: "#EF4444", // red
  },
  transfers: {
    label: "Transfers",
    color: "#F59E0B", // amber/orange
  },
  cumulative: {
    label: "Total Active Assets",
    color: "#10B981", // green
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
          <AreaChart
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
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />


            {/* Gradient defs for each color */}
            <defs>
              <linearGradient id="fillAdded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.added.color} stopOpacity={0.7} />
                <stop offset="95%" stopColor={chartConfig.added.color} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillDisposed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.disposed.color} stopOpacity={0.7} />
                <stop offset="95%" stopColor={chartConfig.disposed.color} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillTransfers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.transfers.color} stopOpacity={0.7} />
                <stop offset="95%" stopColor={chartConfig.transfers.color} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.cumulative.color} stopOpacity={0.7} />
                <stop offset="95%" stopColor={chartConfig.cumulative.color} stopOpacity={0.05} />
              </linearGradient>
            </defs>


            {/* Areas */}
            <Area
              dataKey="added"
              type="monotone"
              stroke={chartConfig.added.color}
              fill="url(#fillAdded)"
              strokeWidth={2}
            />
            <Area
              dataKey="disposed"
              type="monotone"
              stroke={chartConfig.disposed.color}
              fill="url(#fillDisposed)"
              strokeWidth={2}
            />
            <Area
              dataKey="transfers"
              type="monotone"
              stroke={chartConfig.transfers.color}
              fill="url(#fillTransfers)"
              strokeWidth={2}
            />
            <Area
              dataKey="cumulative"
              type="monotone"
              stroke={chartConfig.cumulative.color}
              fill="url(#fillCumulative)"
              strokeWidth={3} // slightly thicker
            />
          </AreaChart>
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



