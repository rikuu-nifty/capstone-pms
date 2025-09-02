import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-auto',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        primary: 'bg-black text-white',

        // ✅ status-specific
        active:   'bg-emerald-100 text-emerald-700 border border-emerald-200',
        archived: 'bg-gray-100 text-gray-700 border border-gray-200',
        completed:'bg-emerald-100 text-emerald-700 border border-emerald-200',
        pending:  'bg-yellow-100 text-yellow-700 border border-yellow-200',
        overdue:  'bg-red-100 text-red-700 border border-red-200',


        // custom role variants
        pmo_head: 'bg-blue-100 text-blue-700 border border-blue-200 font-medium',
        pmo_staff: 'bg-gray-100 text-gray-700 border border-gray-200 font-medium',
        vp_admin: 'bg-purple-100 text-purple-700 border border-purple-200 font-medium',
        superuser: 'bg-red-100 text-red-700 border border-red-200 font-medium',

        // status-specific (now by color)
        Pending_Review: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        Pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        Completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        Overdue: 'bg-red-100 text-red-700 border border-red-200',
        Cancelled: 'bg-red-100 text-red-700 border border-red-200',

        // still keep these
        success:
          'border-transparent bg-green-500 text-white [a&]:hover:bg-green-600 focus-visible:ring-green-500/50',
        darkOutline: 'bg-white text-black border border-black',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);


function Badge({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'span';

    return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
