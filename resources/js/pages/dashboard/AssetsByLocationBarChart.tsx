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

const chartConfig: ChartConfig = {
    assets: { label: 'Assets' },
};

const keyLabel: Record<keyof Props['datasets'], string> = {
    buildings: 'Buildings',
    departments: 'Departments',
    rooms: 'Rooms',
};

export default function AssetsByLocationBarChart({ datasets, title, description }: Props) {
    const [activeKey, setActiveKey] = React.useState<keyof typeof datasets>('buildings');
    const activeData = React.useMemo(() => [...datasets[activeKey]].sort((a, b) => b.assets - a.assets).slice(0, 12), [activeKey, datasets]);
    const totalLocations = datasets[activeKey].length;
    const totalAssets = datasets[activeKey].reduce((acc, item) => acc + item.assets, 0);

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="rounded-md border px-2 py-1">
                            {totalLocations.toLocaleString()} {keyLabel[activeKey].toLowerCase()}
                        </span>
                        <span className="rounded-md border px-2 py-1">{totalAssets.toLocaleString()} assets</span>
                    </div>
                </div>

                <Select value={activeKey} onValueChange={(value) => setActiveKey(value as keyof typeof datasets)}>
                    <SelectTrigger className="w-full sm:w-[190px]">
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
                {activeData.length === 0 ? (
                    <div className="flex h-[360px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                        No location data available.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[360px] w-full">
                        <BarChart data={activeData} layout="vertical" margin={{ left: 10, right: 24, top: 8, bottom: 8 }} barSize={22}>
                            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                            <YAxis
                                dataKey="location"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={130}
                                tickFormatter={(value) => (value.length > 18 ? `${value.slice(0, 18)}...` : value)}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent className="w-[180px]" nameKey="assets" labelFormatter={(value) => value} />}
                            />
                            <Bar dataKey="assets" radius={[0, 7, 7, 0]}>
                                {activeData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`hsl(${(205 + index * 31) % 360}, 70%, 48%)`}
                                        className="transition-opacity hover:opacity-80"
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
