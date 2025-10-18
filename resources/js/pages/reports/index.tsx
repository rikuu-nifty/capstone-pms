// import { Input } from '@/components/ui/input'
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';
import { ArrowRightLeft, CalendarCheck2, ClipboardList, Trash2, Truck } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  // ChartLegendContent,
} from '@/components/ui/chart';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  RadarChart,         
  Radar,              
  PolarGrid,          
  PolarAngleAxis,     
  ResponsiveContainer
} from 'recharts';

import { ReportCard } from './ReportCard';
import { formatEnums } from '@/types/custom-index';

// 🔹 Type for chart data coming from backend
type CategoryData = {
  label: string
  value: number
}

type InventorySheetChartData = {
  date: string
  inventoried: number
  scheduled: number
  not_inventoried: number
}

type TurnoverDisposalChartData = {
  month: string
  turnover: number
  disposal: number
};

// 🔹 Extend default Inertia props with our custom props
import { AssetInventoryListChart } from './charts/AssetInventoryListChart'
import { InventorySchedulingStatusChart } from './charts/InventorySchedulingStatusChart'
import TransferStatusChart from './charts/TransferStatusChart'
import OffCampusStatusChart from './charts/OffCampusStatusChart' // import chart
// import { ReportCard } from './ReportCard'; // Already imported above

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CategoryDataAlt = { label: string; value: number } // renamed to avoid redeclaration conflict

type SchedulingData = { label: string; value: number }

type TransferStatusData = {
  month: string
  completed: number
  pending_review: number
  upcoming: number
  in_progress: number
  overdue: number
  cancelled: number
}

type OffCampusSummary = {
  statusSummary: Record<string, number>
  purposeSummary: Record<string, number>
}

type ReportsPageProps = InertiaPageProps & {
  categoryData: CategoryData[]
  inventorySheetChartData: InventorySheetChartData[]
  schedulingData: SchedulingData[]
  transferData: TransferStatusData[]
  offCampusData: OffCampusSummary
  turnoverDisposalChartData: TurnoverDisposalChartData[],
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reports', href: '/reports' }]

export default function ReportsIndex() {
  const { categoryData, inventorySheetChartData, turnoverDisposalChartData } = usePage<ReportsPageProps>().props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showOthersModal, setShowOthersModal] = useState(false)

  const BASE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC']

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function generateColor(index: number, total: number): string {
    if (index < BASE_COLORS.length) {
      return BASE_COLORS[index]
    }
    const step = 360 / total
    const hue = (210 + index * step) % 360
    const saturation = 80
    const lightness = 60
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalAssets = categoryData.reduce((acc, curr) => acc + curr.value, 0)

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

  const { categoryData: categoryData2, schedulingData, transferData, offCampusData } =
    usePage<ReportsPageProps>().props

  const reports = [
    {
      title: 'Asset Inventory List Report',
      description: 'Summary of assets grouped by category.',
      href: route('reports.inventory-list'),
      icon: <ClipboardList className="h-5 w-5 text-blue-500" />,
      footer: <span className="text-xs text-muted-foreground">Click "View" to see more details</span>,
      chart: <AssetInventoryListChart categoryData={categoryData2} />,
    },
    {
      title: 'Inventory Sheet Report',
      description: 'Generate detailed per-room/per-building inventory sheets.',
      href: route('reports.inventory-sheet'),
      icon: <ClipboardList className="h-5 w-5 text-purple-500" />,
      footer: (
        <span className="text-xs text-muted-foreground">Click "View" to see more details</span>
      ),
      chart:
        inventorySheetChartData.length > 0 ? (
          <div className="rounded-lg bg-gray-50 p-3">
            <ChartContainer
              config={{
                not_inventoried: { label: 'Not Inventoried', color: '#f59e0b' },
                inventoried: { label: 'Inventoried', color: '#00A86B' },
                scheduled: { label: 'Scheduled', color: '#3b82f6' },
              }}
              className="mt-3 mx-auto aspect-[4/3] max-h-[265px] w-full flex items-center justify-center"
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
                    new Date(value as string).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                  label={{
                    value: 'Total Assets',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 11, fill: '#6b7280' },
                  }}
                />

                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      className="space-y-1"
                      labelFormatter={(v) =>
                        new Date(v as string).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
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
                {/* <ChartLegend content={<ChartLegendContent />} /> */}
                <ChartLegend
                  content={({ payload }) => (
                    <div className="mt-3 flex flex-wrap justify-center gap-3">
                      {payload?.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {/* Dot in dataset color */}
                          <span
                            className="h-3 w-3 rounded-sm"
                            style={{ backgroundColor: entry.color }}
                          ></span>
                          {/* Label muted, like Inventory List */}
                          <span className="text-xs text-muted-foreground">
                            {formatEnums(entry.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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
      description: 'Distribution of schedules by status.',
      href: route('reports.inventory-scheduling'),
      icon: <CalendarCheck2 className="h-5 w-5 text-green-500" />,
      footer: <span className="text-xs text-muted-foreground">Click "View" to see more details</span>,
      chart: <InventorySchedulingStatusChart data={schedulingData} />,
    },
    {
      title: 'Property Transfer Report',
      description: 'Overview of transfers across buildings and departments.',
      href: route('reports.transfer'),
      icon: <ArrowRightLeft className="h-5 w-5 text-orange-500" />,
      footer: <span className="text-xs text-muted-foreground">Click "View" to see more details</span>,
      chart: <TransferStatusChart data={transferData} />, // only data mode
    },
    {
      title: 'Turnover/Disposal Report',
      description: 'Summary of completed turnovers and disposals this year.',
      href: route('reports.turnover-disposal'),
      icon: <Trash2 className="h-5 w-5 text-red-500" />,
      footer: (
        <span className="text-xs text-muted-foreground">
          Click "View" to see more details
        </span>
      ),
      chart: turnoverDisposalChartData.length > 0 ? (
        <div className="rounded-lg bg-gray-50 p-3">
          <ChartContainer
            config={{
              turnover: { label: 'Turnover', color: 'var(--chart-1)' },
              disposal: { label: 'Disposal', color: 'var(--chart-2)' },
            }}
            className="mx-auto aspect-[4/3] max-h-[277px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={turnoverDisposalChartData}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <PolarAngleAxis dataKey="month" tickFormatter={(v) => String(v).slice(0, 3)} />
                <PolarGrid />
                <Radar
                  name="Turnover"
                  dataKey="turnover"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Disposal"
                  dataKey="disposal"
                  stroke="var(--chart-2)"
                  fill="var(--chart-2)"
                  fillOpacity={0.4}
                />
                {/* ⛔️ No <ChartLegend /> inside the chart */}
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Custom legend outside the chart, with explicit spacing */}
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ background: 'var(--chart-1)' }} />
              <span className="text-xs text-muted-foreground">Turnover</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ background: 'var(--chart-2)' }} />
              <span className="text-xs text-muted-foreground">Disposal</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-400">
          No data available
        </div>
      ),
    },
    {
      title: 'Off-Campus Report',
      description: 'Overview of off-campus requests by status and purpose.',
      href: route('reports.off-campus'),
      icon: <Truck className="h-5 w-5 text-indigo-800" />,
      footer: <span className="text-xs text-muted-foreground">Click "View" to see more details</span>,
      chart: (
        <OffCampusStatusChart
          chartMode="status"
          statusSummary={offCampusData.statusSummary}
          purposeSummary={offCampusData.purposeSummary}
        />
      ),
    },
    {
      title: 'Personnel Assignments Report',
      description: 'View designated personnel and their current/past assigned assets.',
      href: route('reports.personnel-assignments'), // to be created later
      icon: <ClipboardList className="h-5 w-5 text-amber-600" />,
      footer: (
        <span className="text-xs text-muted-foreground">
          Click "View" to open the personnel assignment report
        </span>
      ),
      chart: (
        <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-400 p-4">
          <p>📋 Personnel assignments report placeholder</p>
          <p className="mt-1 text-xs text-muted-foreground">Data will appear once implemented</p>
        </div>
      ),
    },

  ]

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
        {reports.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report, idx) => (
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
