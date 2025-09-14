import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Pie, PieChart, Tooltip, TooltipProps } from 'recharts';

type Props = {
    categories: { name: string; count: number }[];
    assetTrend: number;
};

// ✅ Use same base colors as InventoryListReport
const BASE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC'];

function generateColor(index: number, total: number): string {
    if (index < BASE_COLORS.length) return BASE_COLORS[index];
    const step = 360 / total;
    const hue = (210 + index * step) % 360;
    return `hsl(${hue}, 80%, 60%)`;
}

export default function CategoryDonutChart({ categories, assetTrend }: Props) {
    const totalAssets = categories.reduce((sum, cat) => sum + cat.count, 0);

    const chartData = categories.map((cat, i) => ({
        category: cat.name,
        assets: cat.count,
        percentage: totalAssets > 0 ? ((cat.count / totalAssets) * 100).toFixed(1) : "0",
        fill: generateColor(i, categories.length), // ✅ unified color logic
    }));

    const isPositive = assetTrend >= 0;

    // ✅ Custom tooltip
    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (active && payload && payload.length > 0) {
            const data = payload[0].payload as (typeof chartData)[number];
            return (
                <div className="rounded-md border bg-white p-2 text-xs shadow-md dark:bg-neutral-900 dark:text-neutral-100">
                    <p className="font-medium">{data.category}</p>
                    <p>{data.assets} asset ({data.percentage}%)</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Inventory Categories Statistics</CardTitle>
                <CardDescription>Assets by Category</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 flex flex-col items-center justify-center">
                <ChartContainer config={{ assets: { label: 'Assets' } } as ChartConfig} className="h-[200px] w-full">
                    <PieChart>
                        <Pie data={chartData} dataKey="assets" nameKey="category" innerRadius={60} outerRadius={100} strokeWidth={2} />
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ChartContainer>

                {/* ✅ Custom Legend */}
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                    {chartData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: d.fill }}></span>
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{d.category}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className={`flex items-center gap-2 leading-none font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? `Asset categories increased by ${Math.abs(assetTrend)}%` : `Asset categories decreased by ${Math.abs(assetTrend)}%`}
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div className="leading-none text-muted-foreground">Compared to last month’s asset records</div>
            </CardFooter>
        </Card>
    );
}
