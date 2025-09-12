import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Cell, Label, Pie, PieChart, TooltipProps } from 'recharts';

type ChartData = {
    label: string;
    value: number;
};

type InventoryListPageProps = {
    chartData: ChartData[];
};

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'Asset Inventory List Report', href: '/reports/inventory-list' },
];

// ✅ Vibrant & bright HSL colors, works for many categories (e.g. 20+)
const BASE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC'];

function generateColor(index: number, total: number): string {
    if (index < BASE_COLORS.length) {
        return BASE_COLORS[index];
    }

    // for categories beyond 5, generate vibrant HSL
    const step = 360 / total;
    const hue = (210 + index * step) % 360;
    const saturation = 80;
    const lightness = 60;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
// ✅ Custom tooltip with proper types
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const entry = payload[0].payload as ChartData;
        const total = payload[0].payload?.total ?? 0; // fallback
        const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';

        return (
            <div className="rounded-md border bg-white p-2 text-sm shadow-md">
                <p className="font-medium">{entry.label}</p>
                <p>
                    {entry.value} Assets ({percent}%)
                </p>
            </div>
        );
    }
    return null;
};

export default function InventoryListReport() {
    const { chartData } = usePage<InventoryListPageProps>().props;

    // ✅ Calculate total assets
    const totalAssets = chartData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Asset Inventory List Report" />

            <div className="space-y-6 px-6 py-4">
                <h1 className="text-2xl font-semibold">Asset Inventory List Report</h1>
                <p className="text-sm text-muted-foreground">Distribution of assets by category.</p>

                <Card className="rounded-2xl shadow-md">
                    <CardHeader>
                        <CardTitle>Assets by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="h-96">
                        <ChartContainer
                            config={{
                                assets: { label: 'Assets' },
                                category: { label: 'Category' },
                            }}
                            className="mx-auto aspect-square max-h-[350px]"
                        >
                            <PieChart>
                                {/* ✅ Pass custom tooltip with totalAssets */}
                                <ChartTooltip cursor={false} content={<CustomTooltip active={false} payload={[]} />} />
                                <Pie
                                    data={chartData.map((d) => ({
                                        ...d,
                                        total: totalAssets, // pass total for tooltip calc
                                    }))}
                                    dataKey="value"
                                    nameKey="label"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    label={false} // ✅ also remove slice labels for cleaner look
                                    stroke="none" // ✅ ensure Pie itself has no stroke
                                >
                                    {chartData.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={generateColor(index, chartData.length)}
                                            stroke="none" // ✅ force each slice to have no stroke
                                            strokeWidth={0} // ✅ extra guarantee
                                        />
                                    ))}
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                return (
                                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                            {totalAssets.toLocaleString()}
                                                        </tspan>
                                                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-sm">
                                                            Total Assets
                                                        </tspan>
                                                    </text>
                                                );
                                            }
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>

                        {/* ✅ Manual Legend (just names) */}
                        <div className="mt-6 flex flex-wrap justify-center gap-4">
                            {chartData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span
                                        className="h-3 w-3 rounded-sm"
                                        style={{
                                            backgroundColor: generateColor(index, chartData.length),
                                        }}
                                    />
                                    <span className="text-sm">{entry.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
