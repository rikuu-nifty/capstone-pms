'use client';

import React from 'react';

type Props = {
    title: string;
    value: number;
    tone?: 'blue' | 'violet' | 'amber' | 'emerald' | 'rose';
    icon?: React.ReactNode;
    footer?: string | React.ReactNode;
};

const toneClasses = {
    blue: {
        icon: 'bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60',
        value: 'text-blue-700 dark:text-blue-300',
        accent: 'from-blue-500',
    },
    violet: {
        icon: 'bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900/60',
        value: 'text-violet-700 dark:text-violet-300',
        accent: 'from-violet-500',
    },
    amber: {
        icon: 'bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60',
        value: 'text-amber-700 dark:text-amber-300',
        accent: 'from-amber-500',
    },
    emerald: {
        icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60',
        value: 'text-emerald-700 dark:text-emerald-300',
        accent: 'from-emerald-500',
    },
    rose: {
        icon: 'bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60',
        value: 'text-rose-700 dark:text-rose-300',
        accent: 'from-rose-500',
    },
};

export default function KpiCard({ title, value, tone = 'blue', icon, footer }: Props) {
    const classes = toneClasses[tone];

    return (
        <div className="relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${classes.accent} to-transparent`} />

            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 space-y-2">
                    <p className="max-w-[12rem] text-sm leading-5 font-medium text-muted-foreground">{title}</p>
                    <p className={`text-3xl font-semibold tracking-tight ${classes.value}`}>{value.toLocaleString()}</p>
                </div>

                {icon && <div className={`rounded-lg p-2 ring-1 ${classes.icon}`}>{icon}</div>}
            </div>

            {footer && <div className="mt-5 border-t pt-3 text-xs leading-5 text-muted-foreground">{footer}</div>}
        </div>
    );
}
