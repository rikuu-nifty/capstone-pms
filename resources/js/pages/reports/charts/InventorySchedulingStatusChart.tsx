'use client';

import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Cell, TooltipProps, XAxis, YAxis } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

type SchedulingData = { label: string; value: number };

type Props = {
    data: SchedulingData[];
    height?: string; // custom height (Tailwind class)
    barSize?: number; // custom bar size
};

export function InventorySchedulingStatusChart({
    data,
    height = 'max-h-[220px]', // default for dashboard
    barSize = 35, // default bar size
}: Props) {
    if (!data || data.length === 0) {
        return <div className="flex h-full items-center justify-center text-sm text-gray-400">No data available</div>;
    }

    // ✅ Colors for each status
    const COLORS: Record<string, string> = {
        'Pending Review': '#f59e0b',
        Pending: '#3b82f6',
        Completed: '#22c55e',
        Overdue: '#800000',
        Cancelled: '#dc2626',
    };

    // ✅ Force order
    const STATUS_ORDER = ['Completed', 'Pending', 'Pending Review', 'Cancelled', 'Overdue'];

    // ✅ Reorder according to STATUS_ORDER
    const orderedData = STATUS_ORDER.map((status) => {
        const found = data.find((d) => d.label === status);
        return { label: status, value: found ? found.value : 0 };
    });

    const chartConfig = Object.fromEntries(
        orderedData.map((d) => [
            d.label,
            {
                label: d.label,
                color: COLORS[d.label] ?? '#94a3b8',
            },
        ]),
    );

    // ✅ Custom Tooltip
    const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
        if (active && payload && payload.length > 0) {
            const { label, value } = payload[0].payload as SchedulingData;
            const color = COLORS[label] || '#000';
            return (
                <div className="rounded-md border bg-white px-3 py-2 shadow-md">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: color }}></span>
                        <span className="text-sm font-medium text-gray-800">{label}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">Value: {value.toLocaleString()}</div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="rounded-lg bg-gray-50 p-3">
            <ChartContainer config={chartConfig} className={`mx-auto w-full ${height}`}>
                <BarChart data={orderedData} layout="vertical" margin={{ right: 16 }}>
                    <CartesianGrid stroke="#dadfe6" strokeDasharray="3 3" horizontal={true} vertical={true} />

                    <YAxis
                        domain={[0, 'auto']}
                        dataKey="label"
                        type="category"
                        tickLine={true}
                        axisLine={true}
                        width={100}
                        tick={({ y, payload }) => {
                            const status = payload.value;
                            return (
                                <text x={1} y={y} dy={4} textAnchor="start" fontSize={12} fontWeight="1" fill={COLORS[status] ?? '#374151'}>
                                    {status}
                                </text>
                            );
                        }}
                    />

                    <XAxis type="number" tickLine={true} axisLine={true} />

                    {/* ✅ Custom Tooltip applied */}
                    <ChartTooltip cursor={false} content={<CustomTooltip />} />

                    <Bar dataKey="value" layout="vertical" radius={4} barSize={barSize}>
                        {orderedData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[entry.label] ?? '#94a3b8'} />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>

            {/* ✅ Manual Legend */}
            <div className="mt-3 flex flex-wrap justify-center gap-4">
                {STATUS_ORDER.map((status) => (
                    <div key={status} className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[status] }}></span>
                        <span className="text-xs text-muted-foreground">{status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
