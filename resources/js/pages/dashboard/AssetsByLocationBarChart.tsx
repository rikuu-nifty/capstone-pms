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

    const totalLocations = activeData.length;
    // const totalAssets = React.useMemo(() => activeData.reduce((acc, curr) => acc + curr.assets, 0), [activeData]);

    const keyLabel: Record<keyof typeof datasets, string> = {
        buildings: 'Buildings',
        departments: 'Departments',
        rooms: 'Rooms',
    };

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>

                    <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                        <p>
                            Total {keyLabel[activeKey]}: <span className="font-bold text-foreground">{totalLocations.toLocaleString()}</span>
                        </p>
                        {/* <p>
                            Assets across {keyLabel[activeKey]}: <span className="font-medium text-foreground">{totalAssets.toLocaleString()}</span>
                        </p> */}
                    </div>
                </div>

                <div className="flex w-full justify-end sm:w-auto">
                    <Select value={activeKey} onValueChange={(val) => setActiveKey(val as keyof typeof datasets)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select dataset" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="buildings">Buildings</SelectItem>
                            <SelectItem value="departments">Departments</SelectItem>
                            <SelectItem value="rooms">Rooms</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
                    <BarChart data={activeData} margin={{ left: 20, right: 20, top: 10, bottom: 40 }} barSize={40} barGap={20}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="location"
                            tickLine={true}
                            axisLine={true}
                            tickMargin={10}
                            interval={0}
                            angle={activeData.length > 6 ? -30 : 0}
                            textAnchor={activeData.length > 6 ? 'end' : 'middle'}
                            tickFormatter={(val) => (val.length > 10 ? val.slice(0, 10) + '…' : val)}
                        />
                        <YAxis allowDecimals={false} />
                        <ChartTooltip
                            content={<ChartTooltipContent className="w-[160px]" nameKey="assets" labelFormatter={(value) => `Location: ${value}`} />}
                        />

                        <Bar dataKey="assets" radius={[8, 8, 0, 0]}>
                            {activeData.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`hsl(${(210 + index * 137.508) % 360}, 70%, 55%)`}
                                    className="transition-opacity hover:opacity-80"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
