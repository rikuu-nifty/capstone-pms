import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type ChartData = {
    label: string;
    value: number;
};

type InventoryListPageProps = {
    chartData: ChartData[];
};

// Breadcrumbs for this page
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'Asset Inventory List Report', href: '/reports/inventory-list' },
];

export default function InventoryListReport() {
    const { chartData } = usePage<InventoryListPageProps>().props;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={120} label>
                                    {chartData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
