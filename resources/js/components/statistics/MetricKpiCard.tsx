import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Tone = 'blue' | 'sky' | 'teal' | 'indigo' | 'violet' | 'purple' | 'amber' | 'yellow' | 'orange' | 'emerald' | 'green' | 'rose' | 'red' | 'slate';

type Props = {
    label: string;
    value: ReactNode;
    icon: LucideIcon;
    detail?: ReactNode;
    tone?: Tone;
    className?: string;
};

const toneClasses: Record<Tone, { accent: string; icon: string; value: string }> = {
    blue: {
        accent: 'from-blue-500',
        icon: 'bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60',
        value: 'text-blue-700 dark:text-blue-300',
    },
    sky: {
        accent: 'from-sky-500',
        icon: 'bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900/60',
        value: 'text-sky-700 dark:text-sky-300',
    },
    teal: {
        accent: 'from-teal-500',
        icon: 'bg-teal-50 text-teal-600 ring-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:ring-teal-900/60',
        value: 'text-teal-700 dark:text-teal-300',
    },
    indigo: {
        accent: 'from-indigo-500',
        icon: 'bg-indigo-50 text-indigo-600 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60',
        value: 'text-indigo-700 dark:text-indigo-300',
    },
    violet: {
        accent: 'from-violet-500',
        icon: 'bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900/60',
        value: 'text-violet-700 dark:text-violet-300',
    },
    purple: {
        accent: 'from-purple-500',
        icon: 'bg-purple-50 text-purple-600 ring-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:ring-purple-900/60',
        value: 'text-purple-700 dark:text-purple-300',
    },
    amber: {
        accent: 'from-amber-500',
        icon: 'bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60',
        value: 'text-amber-700 dark:text-amber-300',
    },
    yellow: {
        accent: 'from-yellow-500',
        icon: 'bg-yellow-50 text-yellow-600 ring-yellow-100 dark:bg-yellow-950/40 dark:text-yellow-300 dark:ring-yellow-900/60',
        value: 'text-yellow-700 dark:text-yellow-300',
    },
    orange: {
        accent: 'from-orange-500',
        icon: 'bg-orange-50 text-orange-600 ring-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900/60',
        value: 'text-orange-700 dark:text-orange-300',
    },
    emerald: {
        accent: 'from-emerald-500',
        icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60',
        value: 'text-emerald-700 dark:text-emerald-300',
    },
    green: {
        accent: 'from-green-500',
        icon: 'bg-green-50 text-green-600 ring-green-100 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-900/60',
        value: 'text-green-700 dark:text-green-300',
    },
    rose: {
        accent: 'from-rose-500',
        icon: 'bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60',
        value: 'text-rose-700 dark:text-rose-300',
    },
    red: {
        accent: 'from-red-500',
        icon: 'bg-red-50 text-red-600 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/60',
        value: 'text-red-700 dark:text-red-300',
    },
    slate: {
        accent: 'from-slate-500',
        icon: 'bg-slate-50 text-slate-600 ring-slate-100 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700',
        value: 'text-slate-800 dark:text-slate-200',
    },
};

export default function MetricKpiCard({ label, value, icon: Icon, detail, tone = 'blue', className }: Props) {
    const classes = toneClasses[tone];

    return (
        <div
            className={cn(
                'relative flex min-h-[150px] min-w-0 flex-col justify-between overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                className,
            )}
        >
            <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent', classes.accent)} />

            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                    <p className="max-w-[12rem] text-sm leading-5 font-medium text-muted-foreground">{label}</p>
                    <div className={cn('text-3xl font-semibold tracking-tight break-words', classes.value)}>{value}</div>
                </div>

                <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1', classes.icon)}>
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
            </div>

            {detail !== undefined && <div className="mt-5 border-t pt-3 text-xs leading-5 text-muted-foreground">{detail}</div>}
        </div>
    );
}
