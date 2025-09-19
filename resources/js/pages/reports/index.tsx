// import { Input } from '@/components/ui/input'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import type { PageProps as InertiaPageProps } from '@inertiajs/core'
import { Head, usePage } from '@inertiajs/react'
import { ArrowRightLeft, CalendarCheck2, ClipboardList, Trash2, Truck } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import {
  Cell,
  Label,
  Pie,
  PieChart,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

import { ReportCard } from './ReportCard'

// 🔹 Type for chart data coming from backend
type CategoryData = {
  label: string
  value: number
}

type InventorySheetChartData = {
  date: string;
  inventoried: number;
  scheduled: number;
  not_inventoried: number;
};

// 🔹 Extend default Inertia props with our custom props
type ReportsPageProps = InertiaPageProps & {
  categoryData: CategoryData[],
  inventorySheetChartData: InventorySheetChartData[],
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reports', href: '/reports' }]

export default function ReportsIndex() {
  const { categoryData, inventorySheetChartData } = usePage<ReportsPageProps>().props
  const [showOthersModal, setShowOthersModal] = useState(false)

  const BASE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC']

  function generateColor(index: number, total: number): string {
    if (index < BASE_COLORS.length) {
      return BASE_COLORS[index]
    }

    // for categories beyond 5, generate vibrant HSL
    const step = 360 / total
    const hue = (210 + index * step) % 360
    const saturation = 80
    const lightness = 60

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  // ✅ Calculate total assets
  const totalAssets = categoryData.reduce((acc, curr) => acc + curr.value, 0)

  // ✅ Group small categories into "Others"
  const MAX_CATEGORIES = 5
  const sortedData = [...categoryData].sort((a, b) => b.value - a.value)
  let displayedData = sortedData
  let others: CategoryData[] = []

  if (sortedData.length > MAX_CATEGORIES) {
    displayedData = sortedData.slice(0, MAX_CATEGORIES - 1)
    others = sortedData.slice(MAX_CATEGORIES - 1)
    const othersTotal = others.reduce((sum, c) => sum + c.value, 0)
    displayedData.push({ label: 'Others', value: othersTotal })
  }

  const reports = [
    {
      title: 'Asset Inventory List Report',
      description: 'Summary of assets grouped by category.',
      href: route('reports.inventory-list'),
      icon: <ClipboardList className="h-5 w-5 text-blue-500" />,
      footer: (
        <span className="text-xs text-muted-foreground">
          Click "View" to see more details
        </span>
      ),
      chart:
        displayedData.length > 0 ? (
          <div className="rounded-lg bg-gray-50 p-3">
            <ChartContainer
              config={{
                assets: { label: 'Assets' },
              }}
              className="mx-auto aspect-square max-h-[200px]"
            >
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={displayedData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={5}
                  onClick={(data) => {
                    if (data && data.name === 'Others') {
                      setShowOthersModal(true)
                    }
                  }}
                >
                  {displayedData.map((_, index) => (
                    <Cell key={index} fill={generateColor(index, displayedData.length)} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-xl font-bold"
                            >
                              {totalAssets.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 18}
                              className="fill-muted-foreground text-xs"
                            >
                              Total Assets
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* ✅ Custom Legend */}
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {displayedData.map((d, i) => (
                <div
                  key={i}
                  className="flex cursor-pointer items-center gap-2"
                  onClick={() => d.label === 'Others' && setShowOthersModal(true)}
                >
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: generateColor(i, displayedData.length) }}
                  ></span>
                  <span className="text-xs text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>

            {/* ✅ Others Modal */}
            <Dialog open={showOthersModal} onOpenChange={setShowOthersModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Other Categories</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  {others.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm text-muted-foreground"
                    >
                      <span>{cat.label}</span>
                      <span className="font-medium">{cat.value}</span>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No data available
          </div>
        ),
    },
    {
      title: 'Inventory Sheet Report',
      description: 'Generate detailed per-room/per-building inventory sheets.',
      href: route('reports.inventory-sheet'),
      icon: <ClipboardList className="h-5 w-5 text-purple-500" />,
      footer: (
        <span className="text-xs text-muted-foreground">
          Click "View" to see more details
        </span>
      ),
      chart:
        inventorySheetChartData.length > 0 ? (
        <div className="rounded-lg bg-gray-50 p-3">
          <ChartContainer
            config={{
              not_inventoried: { label: "Not Inventoried", color: "#f59e0b" },
              inventoried: { label: "Inventoried", color: "#00A86B" },
              scheduled: { label: "Scheduled", color: "#3b82f6" },
            }}
            className="mx-auto h-[200px] w-full" 
          >
            <AreaChart data={inventorySheetChartData}>
              <defs>
                <linearGradient id="fillNotInventoried" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillInventoried" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A86B" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00A86B" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillScheduled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                new Date(value as string).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
                label={{
                  value: "Total Assets",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fontSize: 11, fill: "#6b7280" },
                }}
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                  indicator="dot"
                  className="space-y-1"
                  labelFormatter={(v) =>
                    new Date(v as string).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
                }
              />

              <Area
                dataKey="not_inventoried"
                type="monotone"
                fill="url(#fillNotInventoried)"
                stroke="#f59e0b"
                stackId="a"
              />
              <Area
                dataKey="inventoried"
                type="monotone"
                fill="url(#fillInventoried)"
                stroke="#00A86B"
                stackId="a"
              />
              <Area
                dataKey="scheduled"
                type="monotone"
                fill="url(#fillScheduled)"
                stroke="#3b82f6"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-400">
          No data available
        </div>
      ),

    },

    {
      title: 'Inventory Scheduling Report',
      description: 'Placeholder for scheduling data visualization.',
      href: route('reports.inventory-scheduling'),
      icon: <CalendarCheck2 className="h-5 w-5 text-green-500" />,
    },
    {
      title: 'Property Transfer Report',
      description: 'Placeholder for transfer report.',
      href: route('reports.transfer'),
      icon: <ArrowRightLeft className="h-5 w-5 text-orange-500" />,
    },
    {
      title: 'Turnover/Disposal Report',
      description: 'Placeholder for turnover/disposal.',
      href: route('reports.turnover-disposal'),
      icon: <Trash2 className="h-5 w-5 text-red-500" />,
    },
    {
      title: 'Off-Campus Report',
      description: 'Placeholder for off-campus reporting.',
      href: route('reports.off-campus'),
      icon: <Truck className="h-5 w-5 text-indigo-800" />,
    },
  ]

  const filteredReports = reports

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Reports" />
      <div className="space-y-6 px-6 py-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Generate, view, and manage reports across assets, transfers, and inventory scheduling.
          </p>
        </div>

        {/* Reports Grid */}
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredReports.map((report, idx) => (
              <ReportCard key={idx} {...report} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border py-10 text-center text-muted-foreground">
            <p>No reports available.</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
