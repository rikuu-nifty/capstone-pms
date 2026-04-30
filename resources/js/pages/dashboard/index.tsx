import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowRightLeft,
    BarChart3,
    Boxes,
    Building,
    CheckCircle2,
    Clock,
    FileText,
    ShieldAlert,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import type { ReactNode } from 'react';
import AssetsByLocationBarChart from './AssetsByLocationBarChart';
import AssetsOverTimeChart from './AssetsOverTime';
import CategoryDonutChart from './categoryDonutChart';
import KpiCard from './KpiCard';

type LocationCount = { location: string; assets: number };
type CategoryCount = { name: string; count: number };
type TransferActivity = { id: number; status: string; created_at: string };

type DashboardPageProps = {
    stats: {
        totalAssets: number;
        activeTransfers: number;
        pendingRequests: number;
        completedThisMonth: number;
        offCampusAssets: number;
    };
    categories: CategoryCount[];
    buildings: LocationCount[];
    rooms: LocationCount[];
    departments: LocationCount[];
    recentTransfers?: TransferActivity[];
    assetTrend: number;
    assetsOverTime: {
        month: string;
        added: number;
        disposed: number;
        transfers: number;
        cumulative: number;
    }[];
};

type AuthProps = {
    auth: {
        user: {
            name: string;
            unit_or_department_id?: number | null;
            permissions?: string[];
        };
        permissions?: string[];
        unit_or_department_id?: number | null;
    };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const formatStatus = (status: string) =>
    status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

const formatDate = (date: string) =>
    new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));

const topByAssets = (items: LocationCount[]) => [...items].sort((a, b) => b.assets - a.assets)[0];
const topByCount = (items: CategoryCount[]) => [...items].sort((a, b) => b.count - a.count)[0];

export default function Dashboard() {
    const {
        stats,
        categories,
        assetTrend,
        buildings,
        departments,
        rooms,
        assetsOverTime,
        recentTransfers = [],
    } = usePage<DashboardPageProps>().props;
    const { auth } = usePage<AuthProps>().props;

    const hasUnit = !!auth.unit_or_department_id;
    const permissions = auth.permissions ?? [];
    const canViewAll = permissions.includes('view-inventory-list');
    const canViewOwn = permissions.includes('view-own-unit-inventory-list');
    const canSeeStatsAndCharts = canViewAll || (canViewOwn && hasUnit);
    const inventoryHref = canViewAll ? '/inventory-list' : '/inventory-list/own';
    const topCategory = topByCount(categories);
    const topBuilding = topByAssets(buildings);
    const totalMovement = assetsOverTime.reduce((sum, point) => sum + point.added + point.disposed + point.transfers, 0);
    const pendingRatio = stats.totalAssets > 0 ? Math.round((stats.pendingRequests / stats.totalAssets) * 100) : 0;
    const isPositiveTrend = assetTrend >= 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6">
                <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            Welcome back, {auth.user?.name ?? 'User'}
                        </h1>
                        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                            Monitor asset volume, movement, pending requests, and location distribution from one operational view.
                        </p>
                    </div>

                    {canSeeStatsAndCharts && (
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline">
                                <Link href="/reports">
                                    <FileText className="h-4 w-4" />
                                    Reports
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={inventoryHref}>
                                    <Boxes className="h-4 w-4" />
                                    Inventory
                                </Link>
                            </Button>
                        </div>
                    )}
                </section>

                {!canSeeStatsAndCharts ? (
                    <Card className="mx-auto w-full max-w-2xl py-10 text-center">
                        <CardContent className="flex flex-col items-center gap-3">
                            <div className="rounded-full bg-amber-50 p-3 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60">
                                <ShieldAlert className="h-7 w-7" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Dashboard access is limited</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Your account does not currently have permission to view dashboard statistics or charts.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            <KpiCard
                                title="Total Assets"
                                value={stats.totalAssets}
                                tone="blue"
                                icon={<Boxes className="h-5 w-5" />}
                                footer={`${categories.length.toLocaleString()} tracked categories`}
                            />
                            <KpiCard
                                title="Active Transfers"
                                value={stats.activeTransfers}
                                tone="violet"
                                icon={<ArrowRightLeft className="h-5 w-5" />}
                                footer={`${stats.completedThisMonth.toLocaleString()} completed this month`}
                            />
                            <KpiCard
                                title="Pending Turnover Requests"
                                value={stats.pendingRequests}
                                tone="amber"
                                icon={<Clock className="h-5 w-5" />}
                                footer={`${pendingRatio}% of current asset count`}
                            />
                            <KpiCard
                                title="Transfers Completed This Month"
                                value={stats.completedThisMonth}
                                tone="emerald"
                                icon={<CheckCircle2 className="h-5 w-5" />}
                                footer={`${totalMovement.toLocaleString()} asset events in 6 months`}
                            />
                            <KpiCard
                                title="Off-Campus Assets"
                                value={stats.offCampusAssets}
                                tone="rose"
                                icon={<Building className="h-5 w-5" />}
                                footer="Currently outside campus custody"
                            />
                        </section>

                        <section className="grid gap-4 lg:grid-cols-3">
                            <InsightCard
                                title="Asset Trend"
                                value={`${Math.abs(assetTrend).toLocaleString()}%`}
                                detail={isPositiveTrend ? 'Increase from last month' : 'Decrease from last month'}
                                icon={isPositiveTrend ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                tone={
                                    isPositiveTrend
                                        ? 'text-emerald-600 bg-emerald-50 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60'
                                        : 'text-rose-600 bg-rose-50 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60'
                                }
                            />
                            <InsightCard
                                title="Top Category"
                                value={topCategory?.name ?? 'No category'}
                                detail={`${(topCategory?.count ?? 0).toLocaleString()} assigned assets`}
                                icon={<BarChart3 className="h-5 w-5" />}
                                tone="bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60"
                            />
                            <InsightCard
                                title="Busiest Building"
                                value={topBuilding?.location ?? 'No building'}
                                detail={`${(topBuilding?.assets ?? 0).toLocaleString()} assets on record`}
                                icon={<Building className="h-5 w-5" />}
                                tone="bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900/60"
                            />
                        </section>

                        <section className="grid gap-4 xl:grid-cols-3">
                            <div className="xl:col-span-2">
                                <AssetsOverTimeChart data={assetsOverTime} />
                            </div>
                            <CategoryDonutChart categories={categories} assetTrend={assetTrend} />
                        </section>

                        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                            <AssetsByLocationBarChart
                                datasets={{ buildings, departments, rooms }}
                                title="Assets Distribution"
                                description="Compare asset concentration across buildings, departments, and rooms."
                            />
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between gap-3">
                                    <div>
                                        <CardTitle>Recent Transfers</CardTitle>
                                        <p className="mt-1 text-sm text-muted-foreground">Latest property movement activity</p>
                                    </div>
                                    <Button asChild variant="ghost" size="icon" aria-label="Open transfers">
                                        <Link href="/transfers">
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {recentTransfers.length === 0 ? (
                                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                            No recent transfers found.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentTransfers.map((transfer) => (
                                                <Link
                                                    key={transfer.id}
                                                    href={`/transfers/${transfer.id}/view`}
                                                    className="group flex items-center justify-between gap-3 rounded-lg border p-3 transition hover:border-blue-200 hover:bg-blue-50/60 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:hover:border-blue-900 dark:hover:bg-blue-950/20"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                                            Transfer #{transfer.id}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{formatDate(transfer.created_at)}</p>
                                                    </div>
                                                    <span className="flex shrink-0 items-center gap-2">
                                                        <Badge variant="outline">{formatStatus(transfer.status)}</Badge>
                                                        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function InsightCard({ title, value, detail, icon, tone }: { title: string; value: string; detail: string; icon: ReactNode; tone: string }) {
    return (
        <Card className="py-5">
            <CardContent className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="mt-2 truncate text-xl font-semibold text-foreground">{value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                </div>
                <div className={`rounded-lg p-2 ring-1 ${tone}`}>{icon}</div>
            </CardContent>
        </Card>
    );
}
