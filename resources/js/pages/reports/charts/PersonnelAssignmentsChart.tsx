import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    ResponsiveContainer,
} from 'recharts';

type ChartRow = {
    name: string;
    current: number;
    past: number;
};

type PersonnelAssignmentsChartProps = {
    data: ChartRow[];
};

export default function PersonnelAssignmentsChart({ data }: PersonnelAssignmentsChartProps) {
    if (!data || data.length === 0) {
        return (
        <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No data available
        </div>
        );
    }

    const chartConfig = {
        past: { label: 'Past Assignments', color: 'var(--chart-1)' },
        current: { label: 'Current Assignments', color: 'var(--chart-2)' },
    };

    return (
        <div className="rounded-lg bg-gray-50 p-3">
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-[4/3] max-h-[277px] w-full"
        >
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) =>
                    v.length > 12 ? v.slice(0, 12) + '…' : v
                }
                />
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="past" fill="var(--chart-1)" radius={4} />
                <Bar dataKey="current" fill="var(--chart-2)" radius={4} />
                <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
        </div>
    );
}
