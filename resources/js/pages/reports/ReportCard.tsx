import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@inertiajs/react'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button' // ✅ import button

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

        {/* ✅ Replace text link with shadcn button */}
        <Button size="sm" variant="outline" asChild>
          <Link href={href}>View</Link>
        </Button>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Mini Chart Preview */}
        <div className="w-full">
          {chart ?? (
            <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-400 text-sm">
              Data Visualization Charts
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-6 text-center">{description}</p>
      </CardContent>

      {footer && (
        <CardFooter className="border-t px-4 h-8 flex justify-center items-end">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
