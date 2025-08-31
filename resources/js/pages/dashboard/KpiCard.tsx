"use client"

import React from "react"

type Props = {
  title: string
  value: number
  color?: string
  icon?: React.ReactNode
}

export default function KpiCard({ title, value, color, icon }: Props) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border shadow-sm bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{title}</h2>
        {icon && (
          <div className="rounded-full bg-neutral-100 p-2 dark:bg-neutral-800">
            {icon}
          </div>
        )}
      </div>
      <p
        className={`mt-4 text-3xl font-bold ${color ?? 'text-neutral-900 dark:text-neutral-100'}`}
      >
        {value}
      </p>
    </div>
  )
}
