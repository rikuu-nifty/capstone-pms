import { usePage } from '@inertiajs/react'


type PlaceholderPageProps = {
  title: string
}

export default function PlaceholderReport() {
  const { title } = usePage<PlaceholderPageProps>().props

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-600">This report is coming soon.</p>
    </div>
  )
}
