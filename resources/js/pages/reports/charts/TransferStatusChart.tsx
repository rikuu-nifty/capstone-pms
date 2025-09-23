'use client';

import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import dayjs from 'dayjs';
import type { TooltipProps } from 'recharts';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

type MonthlyTransferData = {
    month: string;
    completed: number;
    pending_review: number;
    upcoming: number;
    in_progress: number;
    overdue: number;
    cancelled: number;
};

type Props = {
    data: MonthlyTransferData[];
    height?: string;
};

// ✅ Mapping snake_case → proper Title Case
export const STATUS_LABELS: Record<string, string> = {
    completed: 'Completed',
    pending_review: 'Pending Review',
    upcoming: 'Upcoming',
    in_progress: 'In Progress',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
};

const STATUS_ORDER = ['completed', 'pending_review', 'upcoming', 'in_progress', 'overdue', 'cancelled'];

const COLORS: Record<string, string> = {
    Completed: '#22c55e',
    'Pending Review': '#f59e0b',
    Upcoming: '#3b82f6',
    'In Progress': '#6366f1',
    Overdue: '#ef4444',
    Cancelled: '#6b7280',
};

// ✅ Custom tooltip renderer
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="rounded-md border bg-white p-3 text-xs shadow-md">
            {/* Month Label */}
            <p className="mb-2 font-semibold text-gray-700">{label}</p>

            {/* Status rows in proper order */}
            {STATUS_ORDER.map((key) => {
                const item = payload.find((p) => p.dataKey === key);
                if (!item) return null;

                return (
                    <div key={key} className="mb-1 flex last:mb-0">
                        <span className="w-28 text-gray-600">{STATUS_LABELS[key]}</span>
                        <span className="font-medium text-gray-900">{item.value as number}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default function TransferStatusChart({ data, height = 'max-h-[220px]' }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                <p className="text-lg font-semibold">No Data Available</p>
                <p className="text-sm">Try adjusting your filters to see results.</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-gray-50 p-3">
            <ChartContainer
                config={{
                    Completed: { label: 'Completed', color: COLORS.Completed },
                    'Pending Review': { label: 'Pending Review', color: COLORS['Pending Review'] },
                    Upcoming: { label: 'Upcoming', color: COLORS.Upcoming },
                    'In Progress': { label: 'In Progress', color: COLORS['In Progress'] },
                    Overdue: { label: 'Overdue', color: COLORS.Overdue },
                    Cancelled: { label: 'Cancelled', color: COLORS.Cancelled },
                }}
                className={`mx-auto w-full ${height}`}
            >
                <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: -10 }}>
                    {/* ✅ Full grid */}
                    <CartesianGrid stroke="#dadfe6" strokeDasharray="3 3" horizontal={true} vertical={true} />

                    {/* ✅ Define gradients */}
                    <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.Completed} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS.Completed} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPendingReview" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS['Pending Review']} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS['Pending Review']} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorUpcoming" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.Upcoming} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS.Upcoming} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS['In Progress']} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS['In Progress']} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOverdue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.Overdue} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS.Overdue} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.Cancelled} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS.Cancelled} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    {/* ✅ Axes */}
                    <XAxis
                        dataKey="month"
                        axisLine={true}
                        tickLine={true}
                        interval="preserveStartEnd"
                        minTickGap={20}
                        height={40}
                        padding={{ left: 5, right: 5 }}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(value) => {
                            const first = dayjs(data[0]?.month);
                            const last = dayjs(data[data.length - 1]?.month);
                            const diffYears = last.diff(first, 'year');

                            // ✅ If range spans multiple years → show Month + Year
                            if (diffYears >= 1) {
                                return dayjs(value).format('MMM YYYY'); // e.g. "Sep 2025"
                            }

                            // ✅ If within 1 year → show only Month
                            return dayjs(value).format('MMM'); // e.g. "Sep"
                        }}
                    />
                    <YAxis
                        domain={[0, 'auto']}
                        tickLine={true}
                        axisLine={true}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        label={{
                            value: 'Total Transfers',
                            angle: -90,
                            position: 'insideLeft',
                            dy: 38,
                            dx: 10,
                            style: { fill: '#6b7280', fontSize: 12 },
                        }}
                    />

                    {/* ✅ Tooltip with custom format */}
                    <ChartTooltip cursor={false} content={<CustomTooltip />} />

                    {/* ✅ Apply gradient fills */}
                    {/* ✅ Draw top-to-bottom so stacking matches legend order */}
                    <Area type="monotone" dataKey="cancelled" stroke={COLORS.Cancelled} fill="url(#colorCancelled)" stackId="1" />
                    <Area type="monotone" dataKey="overdue" stroke={COLORS.Overdue} fill="url(#colorOverdue)" stackId="1" />
                    <Area type="monotone" dataKey="in_progress" stroke={COLORS['In Progress']} fill="url(#colorInProgress)" stackId="1" />
                    <Area type="monotone" dataKey="upcoming" stroke={COLORS.Upcoming} fill="url(#colorUpcoming)" stackId="1" />
                    <Area type="monotone" dataKey="pending_review" stroke={COLORS['Pending Review']} fill="url(#colorPendingReview)" stackId="1" />
                    <Area type="monotone" dataKey="completed" stroke={COLORS.Completed} fill="url(#colorCompleted)" stackId="1" />
                </AreaChart>
            </ChartContainer>

            {/* ✅ Manual Legend (Title Case) */}
            <div className="mt-3 flex flex-wrap justify-center gap-4">
                {STATUS_ORDER.map((key) => (
                    <div key={key} className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[STATUS_LABELS[key]] }} />
                        <span className="text-xs text-muted-foreground">{STATUS_LABELS[key]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
