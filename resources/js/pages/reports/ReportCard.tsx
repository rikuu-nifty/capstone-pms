import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@inertiajs/react'
import { ReactNode } from 'react'

type ReportCardProps = {
  title: string
  description: string
  href: string
  icon: ReactNode
  chart?: ReactNode // chart preview (optional)
  footer?: ReactNode // ✅ flexible footer content
}

export function ReportCard({ title, description, href, icon, chart, footer }: ReportCardProps) {
  return (
    <Card className="shadow-md rounded-2xl flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-gray-100 text-gray-700">{icon}</span>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        <Link
          href={href}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View
        </Link>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Mini Chart Preview */}
        <div className="h-40 flex items-center justify-center">
          {chart ?? <span className="text-gray-400 text-sm">Data Visualization Charts</span>}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-3">{description}</p>
      </CardContent>

      {footer && (
        <CardFooter className="border-t px-4 h-8 flex justify-center items-end">
  {footer}
</CardFooter>

      )}
    </Card>
  )
}
