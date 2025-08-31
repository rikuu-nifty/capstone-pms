'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

type Dataset = { location: string; assets: number }[];

type Props = {
    datasets: {
        buildings: Dataset;
        departments: Dataset;
        rooms: Dataset;
    };
    title: string;
    description: string;
};

export default function AssetsByLocationBarChart({ datasets, title, description }: Props) {
    const [activeKey, setActiveKey] = React.useState<keyof typeof datasets>('buildings');
    const activeData = datasets[activeKey];

    const chartConfig: ChartConfig = {
        assets: { label: 'Assets' },
    };

    const total = React.useMemo(() => activeData.reduce((acc, curr) => acc + curr.assets, 0), [activeData]);

    return (
        <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Total {activeKey}: <span className="font-bold">{total.toLocaleString()}</span>
                    </p>
                </div>

                {/* Dropdown filter */}
                <Select value={activeKey} onValueChange={(val) => setActiveKey(val as keyof typeof datasets)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select dataset" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="buildings">Buildings</SelectItem>
                        <SelectItem value="departments">Departments</SelectItem>
                        <SelectItem value="rooms">Rooms</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
                    <BarChart data={activeData} margin={{ left: 20, right: 20, top: 10, bottom: 40 }} barSize={40} barGap={20}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="location"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            interval={0}
                            angle={activeData.length > 6 ? -30 : 0}
                            textAnchor={activeData.length > 6 ? 'end' : 'middle'}
                        />
                        <YAxis allowDecimals={false} />
                        <ChartTooltip
                            content={<ChartTooltipContent className="w-[150px]" nameKey="assets" labelFormatter={(value) => `Location: ${value}`} />}
                        />

                        <Bar dataKey="assets" radius={[6, 6, 0, 0]}>
                            {activeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${(210 + index * 137.508) % 360}, 70%, 50%)`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
