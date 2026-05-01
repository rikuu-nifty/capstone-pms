import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-xs hover:bg-blue-700",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/70 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link:
          "text-primary underline-offset-4 hover:underline",
        success:
          "border-transparent bg-green-500 text-white [a&]:hover:bg-green-600 focus-visible:ring-green-500/50",
        primary:
          'bg-black text-white hover:bg-gray-600 transition-colors duration-300',
        blue:
          "border-transparent bg-blue-500 text-white [a&]:hover:bg-blue-600 focus-visible:ring-blue-500/50",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon:
          "size-9 rounded-full border border-transparent hover:bg-white hover:shadow-sm [&:has(.lucide-check)]:hover:border-green-200 [&:has(.lucide-check)]:hover:bg-green-50 [&:has(.lucide-check)]:hover:text-green-700 [&:has(.lucide-check-circle)]:hover:border-green-200 [&:has(.lucide-check-circle)]:hover:bg-green-50 [&:has(.lucide-check-circle)]:hover:text-green-700 [&:has(.lucide-check-circle-2)]:hover:border-green-200 [&:has(.lucide-check-circle-2)]:hover:bg-green-50 [&:has(.lucide-check-circle-2)]:hover:text-green-700 [&:has(.lucide-eye)]:hover:border-slate-200 [&:has(.lucide-file-pen-line)]:hover:border-blue-200 [&:has(.lucide-file-pen-line)]:hover:bg-blue-50 [&:has(.lucide-file-pen-line)]:hover:text-blue-700 [&:has(.lucide-pencil)]:hover:border-blue-200 [&:has(.lucide-pencil)]:hover:bg-blue-50 [&:has(.lucide-pencil)]:hover:text-blue-700 [&:has(.lucide-pen)]:hover:border-blue-200 [&:has(.lucide-pen)]:hover:bg-blue-50 [&:has(.lucide-pen)]:hover:text-blue-700 [&:has(.lucide-pen-line)]:hover:border-blue-200 [&:has(.lucide-pen-line)]:hover:bg-blue-50 [&:has(.lucide-pen-line)]:hover:text-blue-700 [&:has(.lucide-rotate-ccw)]:hover:border-amber-200 [&:has(.lucide-rotate-ccw)]:hover:bg-amber-50 [&:has(.lucide-rotate-ccw)]:hover:text-amber-700 [&:has(.lucide-trash)]:hover:border-red-200 [&:has(.lucide-trash)]:hover:bg-red-50 [&:has(.lucide-trash-2)]:hover:border-red-200 [&:has(.lucide-trash-2)]:hover:bg-red-50 [&:has(.lucide-user-check)]:hover:border-green-200 [&:has(.lucide-user-check)]:hover:bg-green-50 [&:has(.lucide-user-check)]:hover:text-green-700 [&:has(.lucide-user-x)]:hover:border-red-200 [&:has(.lucide-user-x)]:hover:bg-red-50 [&:has(.lucide-x)]:hover:border-red-200 [&:has(.lucide-x)]:hover:bg-red-50 [&:has(.lucide-x-circle)]:hover:border-red-200 [&:has(.lucide-x-circle)]:hover:bg-red-50",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const iconTooltipLabels: Record<string, string> = {
  Check: "Approve",
  CheckCircle: "Approve",
  CheckCircle2: "Approve",
  Eye: "View",
  FilePenLine: "Edit",
  Pen: "Edit",
  PenLine: "Edit",
  Pencil: "Edit",
  RotateCcw: "Restore",
  Trash: "Delete",
  Trash2: "Delete",
  UserCheck: "Approve",
  UserX: "Reject",
  X: "Cancel",
  XCircle: "Reject",
}

function getElementName(type: unknown) {
  if (typeof type === "string") return type
  const component = type as { displayName?: string; name?: string }
  return component.displayName || component.name || ""
}

function inferIconTooltip(children: React.ReactNode): string | null {
  let label: string | null = null

  React.Children.forEach(children, (child) => {
    if (label || !React.isValidElement(child)) return

    const name = getElementName(child.type)
    if (iconTooltipLabels[name]) {
      label = iconTooltipLabels[name]
      return
    }

    label = inferIconTooltip((child.props as { children?: React.ReactNode }).children)
  })

  return label
}

function normalizeActionTooltip(label?: string | null) {
  if (!label) return null
  const normalized = label.trim()
  const lower = normalized.toLowerCase()

  if (lower.startsWith("edit")) return "Edit"
  if (lower.startsWith("delete")) return "Delete"
  if (lower.startsWith("view")) return "View"
  if (lower.startsWith("approve")) return "Approve"
  if (lower.startsWith("reject")) return "Reject"
  if (lower.startsWith("restore")) return "Restore"
  if (lower.startsWith("cancel")) return "Cancel"

  return normalized
}

function getActionHoverClass(label?: string | null) {
  const action = normalizeActionTooltip(label)

  if (action === "Edit") return "rounded-full border border-transparent hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
  if (action === "Delete") return "rounded-full border border-transparent hover:border-red-200 hover:bg-red-50"
  if (action === "View") return "rounded-full border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm"
  if (action === "Approve") return "rounded-full border border-transparent hover:border-green-200 hover:bg-green-50 hover:text-green-700"
  if (action === "Reject" || action === "Cancel") return "rounded-full border border-transparent hover:border-red-200 hover:bg-red-50"
  if (action === "Restore") return "rounded-full border border-transparent hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"

  return null
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  title,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  const tooltipLabel =
    size === "icon" && !ariaLabel && !title
      ? normalizeActionTooltip(inferIconTooltip(children))
      : null
  const actionLabel = size === "icon" ? normalizeActionTooltip(ariaLabel ?? title ?? inferIconTooltip(children)) : null
  const actionHoverClass = getActionHoverClass(actionLabel)
  const button = (
    <Comp
      data-slot="button"
      aria-label={ariaLabel ?? tooltipLabel ?? undefined}
      title={tooltipLabel ? undefined : title}
      className={cn(buttonVariants({ variant, size, className }), actionHoverClass)}
      {...props}
    >
      {children}
    </Comp>
  )

  if (!tooltipLabel) return button

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltipLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { Button, buttonVariants }
