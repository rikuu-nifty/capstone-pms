// import { Input } from '@/components/ui/input'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head } from '@inertiajs/react'
import { ArrowRightLeft, CalendarCheck2, ClipboardList, Globe, Trash2 } from 'lucide-react'
// import { useState } from 'react'
import { ReportCard } from './ReportCard'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Reports', href: '/reports' },
]

export default function ReportsIndex() {
  // const [search, setSearch] = useState('')

  const reports = [
    {
      title: 'Asset Inventory List Report',
      description: 'Overview of all assets grouped by category, building, and more.',
      href: route('reports.inventory-list'),
      icon: <ClipboardList className="h-5 w-5" />,
      footer: <span className="text-xs text-muted-foreground">Click View to see details</span>,
    },
    {
      title: 'Inventory Scheduling Report',
      description: 'Placeholder for scheduling data visualization.',
      href: route('reports.index'),
      icon: <CalendarCheck2 className="h-5 w-5" />,
      footer: <span className="text-xs text-muted-foreground">Click View to see details</span>,
    },
    {
      title: 'Property Transfer Report',
      description: 'Placeholder for transfer report.',
      href: route('reports.index'),
      icon: <ArrowRightLeft className="h-5 w-5" />,
      footer: <span className="text-xs text-muted-foreground">Click View to see details</span>,
    },
    {
      title: 'Turnover/Disposal Report',
      description: 'Placeholder for turnover/disposal.',
      href: route('reports.index'),
      icon: <Trash2 className="h-5 w-5" />,
      footer: <span className="text-xs text-muted-foreground">Click View to see details</span>,
    },
    {
      title: 'Off-Campus Report',
      description: 'Placeholder for off-campus reporting.',
      href: route('reports.index'),
      icon: <Globe className="h-5 w-5" />,
      footer: <span className="text-xs text-muted-foreground">Click View to see details</span>,
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
            Generate, view, and manage reports across assets, transfers, and inventory scheduling.
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
            <p>No reports match your search.</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
