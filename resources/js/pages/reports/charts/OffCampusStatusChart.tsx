'use client';

import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, TooltipProps, XAxis, YAxis } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

type Props = {
    chartMode: 'status' | 'purpose';
    statusSummary: Record<string, number>;
    purposeSummary: Record<string, number>;
    isCardView?: boolean; // ✅ new prop
};

export default function OffCampusStatusChart({
    chartMode,
    statusSummary,
    purposeSummary,
    isCardView = false, // default false (full page)
}: Props) {
    const COLORS: Record<string, string> = {
        'Pending Review': '#f59e0b',
        'Pending Return': '#3b82f6',
        Returned: '#22c55e',
        Overdue: '#800000',
        Cancelled: '#dc2626',
        'Official Use': '#0ea5e9',
        Repair: '#9333ea',
    };

    const statusData = [
        { label: 'Returned', value: statusSummary.returned ?? 0 },
        { label: 'Pending Return', value: statusSummary.pending_return ?? 0 },
        { label: 'Pending Review', value: statusSummary.pending_review ?? 0 },
        { label: 'Cancelled', value: statusSummary.cancelled ?? 0 },
        { label: 'Overdue', value: statusSummary.overdue ?? 0 },
    ];

    const purposeData = [
        { label: 'Official Use', value: purposeSummary.official_use ?? 0 },
        { label: 'Repair', value: purposeSummary.repair ?? 0 },
    ];

    const data = chartMode === 'status' ? statusData : purposeData;

    // ✅ Custom Tooltip
    const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
        if (active && payload && payload.length > 0) {
            const { label, value } = payload[0].payload;
            const color = COLORS[label] || '#000';
            return (
                <div className="rounded-md border bg-white px-3 py-2 shadow-md">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: color }}></span>
                        <span className="text-sm font-medium text-gray-800">{label}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">Value: {value}</div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="rounded-lg bg-gray-50 p-3">
            <ChartContainer
                config={Object.fromEntries(data.map((d) => [d.label, { label: d.label, color: COLORS[d.label] }]))}
                className="mx-auto max-h-[350px] w-full"
            >
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 20,
                        left: 10,
                        bottom: isCardView ? 40 : 20, // ✅ more space in card view
                    }}
                    barCategoryGap={isCardView ? '25%' : '20%'} // ✅ tighter in card view
                >
                    <CartesianGrid stroke="#dadfe6" strokeDasharray="3 3" vertical={false} />

                    <XAxis
                        dataKey="label"
                        tickLine
                        axisLine
                        interval={isCardView ? 0 : 'preserveStartEnd'}
                        tick={{
                            fill: '#9ca3af',
                            fontSize: isCardView ? 10 : 12, // ✅ smaller font in card
                        }}
                        angle={isCardView ? -30 : 0} // ✅ rotate in card view
                        textAnchor={isCardView ? 'end' : 'middle'}
                    />

                    <YAxis domain={[0, 'auto']} tickLine axisLine tick={{ fill: '#9ca3af', fontSize: 12 }} />

                    {/* ✅ Tooltip now styled */}
                    <ChartTooltip cursor={false} content={<CustomTooltip />} />

                    {/* ✅ Bars with dynamic colors */}
                    <Bar dataKey="value" radius={5}>
                        <LabelList
                            dataKey="value"
                            position="top"
                            offset={12}
                            className="fill-gray-700"
                            fontSize={12}
                            formatter={(val: number) => (val > 0 ? val : '')}
                        />
                        {data.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[entry.label]} />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>

            {/* ✅ Manual Legend */}
            <div className="mt-3 flex flex-wrap justify-center gap-4">
                {data.map((d) => (
                    <div key={d.label} className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[d.label] }} />
                        <span className="text-xs text-muted-foreground">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
