import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Cell, Pie, PieChart, Tooltip, TooltipProps } from 'recharts';

type Props = {
    categories: { name: string; count: number }[];
    assetTrend: number;
};

const BASE_COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#65a30d', '#c2410c', '#be185d', '#475569'];

function generateColor(index: number, total: number): string {
    if (index < BASE_COLORS.length) {
        return BASE_COLORS[index];
    }

    const step = 360 / Math.max(total, 1);
    return `hsl(${(210 + index * step) % 360}, 68%, 48%)`;
}

export default function CategoryDonutChart({ categories, assetTrend }: Props) {
    const totalAssets = categories.reduce((sum, category) => sum + category.count, 0);
    const chartData = categories.map((category, index) => ({
        category: category.name,
        assets: category.count,
        percentage: totalAssets > 0 ? (category.count / totalAssets) * 100 : 0,
        fill: generateColor(index, categories.length),
    }));
    const isPositive = assetTrend >= 0;

    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (!active || !payload?.length) {
            return null;
        }

        const data = payload[0].payload as (typeof chartData)[number];

        return (
            <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
                <p className="font-medium">{data.category}</p>
                <p className="text-muted-foreground">
                    {data.assets.toLocaleString()} assets ({data.percentage.toFixed(1)}%)
                </p>
            </div>
        );
    };

    return (
        <Card className="flex h-full flex-col">
            <CardHeader>
                <CardTitle>Category Mix</CardTitle>
                <CardDescription>Share of assets by inventory category.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center pb-0">
                {chartData.length === 0 ? (
                    <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">No category data available.</div>
                ) : (
                    <>
                        <ChartContainer config={{ assets: { label: 'Assets' } } as ChartConfig} className="h-[250px] w-full">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="assets"
                                    nameKey="category"
                                    innerRadius={68}
                                    outerRadius={105}
                                    paddingAngle={2}
                                    strokeWidth={2}
                                >
                                    {chartData.map((entry) => (
                                        <Cell key={entry.category} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ChartContainer>

                        <div className="mt-2 grid w-full gap-2 sm:grid-cols-2">
                            {chartData.slice(0, 6).map((item) => (
                                <div key={item.category} className="flex min-w-0 items-center justify-between gap-2 text-sm">
                                    <span className="flex min-w-0 items-center gap-2">
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: item.fill }} />
                                        <span className="truncate text-muted-foreground">{item.category}</span>
                                    </span>
                                    <span className="font-medium">{item.percentage.toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter className="mt-4 flex-col items-start gap-1 text-sm">
                <div className={`flex items-center gap-2 font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? 'Inventory grew' : 'Inventory declined'} by {Math.abs(assetTrend).toLocaleString()}%
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div className="text-muted-foreground">Compared with last month.</div>
            </CardFooter>
        </Card>
    );
}
