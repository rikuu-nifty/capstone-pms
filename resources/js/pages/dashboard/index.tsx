import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import AssetsByLocationBarChart from './AssetsByLocationBarChart';
import CategoryDonutChart from './categoryDonutChart';
import AssetsOverTimeChart from './AssetsOverTime';
import { Boxes, ArrowRightLeft, Clock, CheckCircle2, Building } from 'lucide-react';
import KpiCard from './KpiCard';

type DashboardPageProps = {
  stats: {
    totalAssets: number
    activeTransfers: number
    pendingRequests: number
    completedThisMonth: number
    offCampusAssets: number
  }
  categories: { name: string; count: number }[]
  buildings: { location: string; assets: number }[]
  rooms: { location: string; assets: number }[]
  departments: { location: string; assets: number }[]
  recentTransfers: { id: number; status: string; created_at: string }[]
  assetTrend: number
  assetsOverTime: {
    month: string
    added: number
    disposed: number
    transfers: number
    cumulative: number
  }[]
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard() {
  const {
    stats,
    categories,
    assetTrend,
    buildings,
    departments,
    rooms,
    assetsOverTime
  } = usePage<DashboardPageProps>().props;

  const { auth } = usePage().props as unknown as {
    auth: {
      user: {
        name: string;
      };
    };
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
        {/* Welcome Header */}
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Welcome back, <span className="text-blue-600">{auth.user?.name ?? 'User'}</span>!
        </h1>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <KpiCard
            title="Total Assets"
            value={stats.totalAssets}
            color="text-blue-500"
            icon={<Boxes className="h-6 w-6" />}

          />
          <KpiCard
            title="Active Transfers"
            value={stats.activeTransfers}
            color="text-purple-500"
            icon={<ArrowRightLeft className="h-6 w-6" />}

          />
          <KpiCard
            title="Pending Turnover Requests"
            value={stats.pendingRequests}
            color="text-amber-500"
            icon={<Clock className="h-6 w-6" />}

          />
          <KpiCard
            title="Transfers Completed This Month"
            value={stats.completedThisMonth}
            color="text-green-500"
            icon={<CheckCircle2 className="h-6 w-6" />}

          />
          <KpiCard
            title="Off-Campus Assets"
            value={stats.offCampusAssets}
            color="text-red-500"
            icon={<Building className="h-6 w-6" />}

          />
        </div>
        
        {/* Charts Row: Line Chart + Donut Chart */}
        {/* {canViewReports && ( */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="col-span-2">
              <AssetsOverTimeChart data={assetsOverTime} />
            </div>
            <CategoryDonutChart categories={categories} assetTrend={assetTrend} />
          </div>
        {/* )} */}

        {/* Charts Row 2 */}
        <div className="grid gap-4 md:grid-cols-1">
          <AssetsByLocationBarChart
            datasets={{ buildings, departments, rooms }}
            title="Assets Distribution"
            description="Distribution of assets across Buildings, Departments, and Rooms"
          />
        </div>

        {/* Recent Activity */}
        {/* <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
          <h2 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            Recent Activity
          </h2>
          <ul className="space-y-2">
            {recentTransfers.length === 0 && (
              <li className="text-sm text-neutral-500">No recent transfers.</li>
            )}
            {recentTransfers.map((t) => (
              <li
                key={t.id}
                className="border-b border-neutral-200 pb-2 dark:border-neutral-700"
              >
                Transfer #{t.id} – {t.status}{' '}
                <span className="text-xs text-neutral-500">
                  ({new Date(t.created_at).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
        </div> */}
      </div>
    </AppLayout>
  );
}
