'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

type ChartPoint = {
    month: string;
    added: number;
    disposed: number;
    transfers: number;
    cumulative: number;
};

type Props = {
    data: ChartPoint[];
};

const chartConfig = {
    cumulative: {
        label: 'Active total',
        color: '#059669',
    },
    added: {
        label: 'New assets',
        color: '#2563eb',
    },
    transfers: {
        label: 'Transfers',
        color: '#d97706',
    },
    disposed: {
        label: 'Disposed',
        color: '#dc2626',
    },
} satisfies ChartConfig;

export default function AssetsOverTimeChart({ data }: Props) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Assets Over Time</CardTitle>
                <CardDescription>Six-month view of additions, disposals, transfers, and active inventory.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[330px] w-full">
                    <AreaChart accessibilityLayer data={data} margin={{ left: -10, right: 12, top: 8, bottom: 8 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => value.slice(0, 3)} />
                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={42} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <ChartLegend content={<ChartLegendContent />} />

                        <defs>
                            {Object.entries(chartConfig).map(([key, item]) => (
                                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={item.color} stopOpacity={0.45} />
                                    <stop offset="95%" stopColor={item.color} stopOpacity={0.04} />
                                </linearGradient>
                            ))}
                        </defs>

                        <Area
                            dataKey="cumulative"
                            type="monotone"
                            stroke={chartConfig.cumulative.color}
                            fill="url(#fill-cumulative)"
                            strokeWidth={3}
                        />
                        <Area dataKey="added" type="monotone" stroke={chartConfig.added.color} fill="url(#fill-added)" strokeWidth={2} />
                        <Area dataKey="transfers" type="monotone" stroke={chartConfig.transfers.color} fill="url(#fill-transfers)" strokeWidth={2} />
                        <Area dataKey="disposed" type="monotone" stroke={chartConfig.disposed.color} fill="url(#fill-disposed)" strokeWidth={2} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
