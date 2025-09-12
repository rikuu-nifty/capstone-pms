import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Cell, Label, Pie, PieChart } from 'recharts';

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

export default function InventoryListReport() {
    const { chartData } = usePage<InventoryListPageProps>().props;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="label"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    strokeWidth={5}
                                    label
                                >
                                    {chartData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
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

                        {/* ✅ Manual Legend */}
                        <div className="mt-6 flex flex-wrap justify-center gap-4">
                            {chartData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
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
