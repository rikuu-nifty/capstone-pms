// reports/charts/AssetInventoryListChart.tsx
'use client';

import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMemo, useState } from 'react';
import { Cell, Label, Pie, PieChart, Sector, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';

type CategoryData = { label: string; value: number };

export function AssetInventoryListChart({ categoryData }: { categoryData: CategoryData[] }) {
    const [showOthersModal, setShowOthersModal] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const BASE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC'];

    function generateColor(index: number, total: number): string {
        if (index < BASE_COLORS.length) return BASE_COLORS[index];
        const step = 360 / total;
        const hue = (210 + index * step) % 360;
        return `hsl(${hue}, 80%, 60%)`;
    }

    const totalAssets = categoryData.reduce((acc, curr) => acc + curr.value, 0);

    // ✅ Group "Others"
    const MAX_CATEGORIES = 5;
    const sortedData = [...categoryData].sort((a, b) => b.value - a.value);
    let displayedData = sortedData;
    let others: CategoryData[] = [];

    if (sortedData.length > MAX_CATEGORIES) {
        displayedData = sortedData.slice(0, MAX_CATEGORIES - 1);
        others = sortedData.slice(MAX_CATEGORIES - 1);
        displayedData.push({
            label: 'Others',
            value: others.reduce((sum, c) => sum + c.value, 0),
        });
    }

    // ✅ Default active index → largest slice
    const defaultActiveIndex = useMemo(() => {
        if (displayedData.length === 0) return null;
        let maxIdx = 0;
        let maxVal = displayedData[0].value;
        displayedData.forEach((d, i) => {
            if (d.value > maxVal) {
                maxVal = d.value;
                maxIdx = i;
            }
        });
        return maxIdx;
    }, [displayedData]);

    const currentActiveIndex = activeIndex !== null ? activeIndex : defaultActiveIndex;

    if (displayedData.length === 0) {
        return <div className="flex h-full items-center justify-center text-sm text-gray-500">No data available</div>;
    }

    // ✅ Custom Tooltip with consistent colors
    const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
        if (active && payload && payload.length > 0) {
            const { label, value } = payload[0].payload as CategoryData;
            const index = displayedData.findIndex((d) => d.label === label);
            const color = generateColor(index, displayedData.length);

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
            <ChartContainer config={{ assets: { label: 'Assets' } }} className="mx-auto max-h-[220px] w-full">
                <PieChart>
                    <ChartTooltip cursor={false} content={<CustomTooltip />} />
                    <Pie
                        data={displayedData}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={50}
                        outerRadius={80}
                        strokeWidth={5}
                        activeIndex={currentActiveIndex ?? undefined}
                        activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => <Sector {...props} outerRadius={outerRadius + 8} />}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        onClick={(data) => {
                            if (data && data.name === 'Others') setShowOthersModal(true);
                        }}
                    >
                        {displayedData.map((_, i) => (
                            <Cell key={i} fill={generateColor(i, displayedData.length)} />
                        ))}
                        <Label
                            content={({ viewBox }) =>
                                viewBox && 'cx' in viewBox && 'cy' in viewBox ? (
                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">
                                            {totalAssets.toLocaleString()}
                                        </tspan>
                                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-xs">
                                            Total Assets
                                        </tspan>
                                    </text>
                                ) : null
                            }
                        />
                    </Pie>
                </PieChart>
            </ChartContainer>

            {/* ✅ Legend */}
            <div className="mt-3 flex flex-wrap justify-center gap-3">
                {displayedData.map((d, i) => (
                    <div key={i} className="flex cursor-pointer items-center gap-2" onClick={() => d.label === 'Others' && setShowOthersModal(true)}>
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: generateColor(i, displayedData.length) }}></span>
                        <span className="text-xs text-muted-foreground">{d.label}</span>
                    </div>
                ))}
            </div>

            {/* ✅ Others Categories Modal */}
            <Dialog open={showOthersModal} onOpenChange={setShowOthersModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Other Categories</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        {others.map((cat, idx) => (
                            <div key={idx} className="flex justify-between text-sm text-muted-foreground">
                                <span>{cat.label}</span>
                                <span className="font-medium">{cat.value}</span>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
