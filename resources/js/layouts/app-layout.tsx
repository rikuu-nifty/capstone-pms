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
import { type ReactNode } from 'react';


interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}

        {/* ✅ Toast Provider */}
        <Toaster
  richColors
  position="top-right"
  style={
    {
      /* ✅ Success — soft mint */
      "--success-bg": "#ecfdf5",     // minty pastel background
      "--success-text": "#065f46",  // emerald-900 for contrast
      "--success-border": "#6ee7b7", // light emerald accent

      /* ⚠️ Warning — soft amber */
      "--warning-bg": "#fffbeb",
      "--warning-text": "#92400e",  // amber-900
      "--warning-border": "#fcd34d",

      /* ❌ Error — soft rose */
      "--error-bg": "#fef2f2",
      "--error-text": "#991b1b",    // rose-900
      "--error-border": "#fca5a5",

      /* ℹ️ Info — soft sky */
      "--info-bg": "#eff6ff",
      "--info-text": "#1e3a8a",     // blue-900
      "--info-border": "#93c5fd",

      /* ✨ Neutral / default */
      "--normal-bg": "#f9fafb",
      "--normal-text": "#111827",
      "--normal-border": "#e5e7eb",
    } as React.CSSProperties
  }
/>

    </AppLayoutTemplate>
);
