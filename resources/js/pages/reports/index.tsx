// import { Input } from '@/components/ui/input'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { usePage, Head } from '@inertiajs/react'
import type { PageProps as InertiaPageProps } from '@inertiajs/core'

import {
  ArrowRightLeft,
  CalendarCheck2,
  ClipboardList,
  // Globe,
  Trash2,
  Truck
} from 'lucide-react'
// import { useState } from 'react'
import { ReportCard } from './ReportCard'
import { PieChart, Pie, Cell, Label } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

// 🔹 Type for chart data coming from backend
type CategoryData = {
  label: string
  value: number
}

// 🔹 Extend default Inertia props with our custom props
type ReportsPageProps = InertiaPageProps & {
  categoryData: CategoryData[]
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Reports', href: '/reports' },
]

export default function ReportsIndex() {
  // ✅ Access backend data
  const { categoryData } = usePage<ReportsPageProps>().props

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  // 🔹 Calculate total assets
  const totalAssets = categoryData.reduce((acc, curr) => acc + curr.value, 0)

  const reports = [
    {
      title: 'Asset Inventory List Report',
      description:
        'Overview of all assets grouped by category, building, and more.',
      href: route('reports.inventory-list'),
      icon: <ClipboardList className="h-5 w-5 text-blue-500" />,
      footer: (
        <span className="text-xs text-muted-foreground">
          Click View to see details
        </span>
      ),

      // ✅ Donut chart with center text wrapped in ChartContainer + manual legend
      chart: categoryData.length > 0 ? (
        <div className="rounded-lg bg-gray-50 p-3">
          <ChartContainer
            config={{
              assets: { label: 'Assets' },
              category: { label: 'Category' },
            }}
            className="mx-auto aspect-square max-h-[200px]"
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="label"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={5}
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
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

          {/* ✅ Custom Legend (manual, like dashboard) */}
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {categoryData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                ></span>
                <span className="text-xs text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-gray-400 text-sm">
          No data available
        </div>
      ),
    },
    {
      title: 'Inventory Scheduling Report',
      description: 'Placeholder for scheduling data visualization.',
      href: route('reports.index'),
      icon: <CalendarCheck2 className="h-5 w-5 text-green-500" />,
      footer: (
        <span className="text-xs text-muted-foreground">Coming soon</span>
      ),
    },
    {
      title: 'Property Transfer Report',
      description: 'Placeholder for transfer report.',
      href: route('reports.index'),
      icon: <ArrowRightLeft className="h-5 w-5 text-orange-500" />,
      footer: (
        <span className="text-xs text-muted-foreground">Coming soon</span>
      ),
    },
    {
      title: 'Turnover/Disposal Report',
      description: 'Placeholder for turnover/disposal.',
      href: route('reports.index'),
      icon: <Trash2 className="h-5 w-5 text-red-500" />,
      footer: (
        <span className="text-xs text-muted-foreground">Coming soon</span>
      ),
    },
    {
      title: 'Off-Campus Report',
      description: 'Placeholder for off-campus reporting.',
      href: route('reports.index'),
      icon: <Truck className="h-5 w-5 text-indigo-800" />,
      footer: (
        <span className="text-xs text-muted-foreground">Coming soon</span>
      ),
    },
  ]

  // Since the search bar is commented, just show all reports
  const filteredReports = reports

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Reports" />
      <div className="space-y-6 px-6 py-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Generate, view, and manage reports across assets, transfers, and
            inventory scheduling.
          </p>

          {/* 🔻 Search Bar (commented for now) */}
          {/*
          <Input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          */}
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
