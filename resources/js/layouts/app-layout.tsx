// import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
// import { type BreadcrumbItem } from '@/types';
// import { type ReactNode } from 'react';

// interface AppLayoutProps {
//     children: ReactNode;
//     breadcrumbs?: BreadcrumbItem[];
// }

// export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
//     <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
//         {children}
//     </AppLayoutTemplate>
// );

import { Toaster } from '@/components/ui/sonner'; // ✅ import Toaster
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useEffect, useState } from 'react'
import { usePage } from '@inertiajs/react'
import UnauthorizedModal from '@/components/modals/UnauthorizedModal'

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
  // flash.unauthorized is set by bootstrap/app.php handler
  const { flash } = usePage().props as { flash?: { unauthorized?: string } }
  const unauthorizedMsg = flash?.unauthorized ?? null

  const [showUnauthorized, setShowUnauthorized] = useState(false)

  useEffect(() => {
    if (unauthorizedMsg) setShowUnauthorized(true)
  }, [unauthorizedMsg])

  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      {children}

      <UnauthorizedModal
        show={showUnauthorized}
        message={unauthorizedMsg ?? undefined}
        onClose={() => setShowUnauthorized(false)}
      />
      
      <Toaster
        richColors
        position="top-right"
        style={{
          "--success-bg": "#ecfdf5",
          "--success-text": "#065f46",
          "--success-border": "#6ee7b7",
          "--warning-bg": "#fffbeb",
          "--warning-text": "#92400e",
          "--warning-border": "#fcd34d",
          "--error-bg": "#fef2f2",
          "--error-text": "#991b1b",
          "--error-border": "#fca5a5",
          "--info-bg": "#eff6ff",
          "--info-text": "#1e3a8a",
          "--info-border": "#93c5fd",
          "--normal-bg": "#f9fafb",
          "--normal-text": "#111827",
          "--normal-border": "#e5e7eb",
        } as React.CSSProperties}
      />
    </AppLayoutTemplate>
  )
}