import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, usePage } from '@inertiajs/react'

type PageProps = {
  title: string
}

export default function InventorySchedulingReport() {
  const { title } = usePage<PageProps>().props

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title, href: '/reports/inventory-scheduling' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={title} />
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-600">This report is coming soon.</p>
      </div>
    </AppLayout>
  )
}
