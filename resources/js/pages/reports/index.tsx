import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';
import { ArrowRightLeft, CalendarCheck2, ClipboardList, Trash2, Truck } from 'lucide-react';
import { AssetInventoryListChart } from './charts/AssetInventoryListChart';
import { InventorySchedulingStatusChart } from './charts/InventorySchedulingStatusChart';
import TransferStatusChart from './charts/TransferStatusChart';
import { ReportCard } from './ReportCard';

type CategoryData = { label: string; value: number };
type SchedulingData = { label: string; value: number };
type TransferStatusData = {
    month: string;
    completed: number;
    pending_review: number;
    upcoming: number;
    in_progress: number;
    overdue: number;
    cancelled: number;
};

type ReportsPageProps = InertiaPageProps & {
    categoryData: CategoryData[];
    schedulingData: SchedulingData[];
    transferData: TransferStatusData[]; // ✅ now monthly trends dataset
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reports', href: '/reports' }];

export default function ReportsIndex() {
    const { categoryData, schedulingData, transferData } = usePage<ReportsPageProps>().props;

    const reports = [
        {
            title: 'Asset Inventory List Report',
            description: 'Summary of assets grouped by category.',
            href: route('reports.inventory-list'),
            icon: <ClipboardList className="h-5 w-5 text-blue-500" />,
            footer: <span className="text-xs text-muted-foreground">Click "View" to see more details</span>,
            chart: <AssetInventoryListChart categoryData={categoryData} />,
        },
        {
            title: 'Inventory Scheduling Report',
            description: 'Distribution of schedules by status.',
            href: route('reports.inventory-scheduling'),
            icon: <CalendarCheck2 className="h-5 w-5 text-green-500" />,
            footer: <span className="text-xs text-muted-foreground">Click "View" to see more details</span>,
            chart: <InventorySchedulingStatusChart data={schedulingData} />,
        },
        {
            title: 'Property Transfer Report',
            description: 'Overview of transfers across buildings and departments.',
            href: route('reports.transfer'),
            icon: <ArrowRightLeft className="h-5 w-5 text-orange-500" />,
            footer: <span className="text-xs text-muted-foreground">Click "View" to see more details</span>,
            chart: <TransferStatusChart data={transferData} />, // ✅ only data mode
        },
        {
            title: 'Turnover/Disposal Report',
            description: 'Placeholder for turnover/disposal.',
            href: route('reports.turnover-disposal'),
            icon: <Trash2 className="h-5 w-5 text-red-500" />,
            footer: <span className="text-xs text-muted-foreground">Click "View" to see more details</span>,
        },
        {
            title: 'Off-Campus Report',
            description: 'Placeholder for off-campus reporting.',
            href: route('reports.off-campus'),
            icon: <Truck className="h-5 w-5 text-indigo-800" />,
            footer: <span className="text-xs text-muted-foreground">Click "View" to see more details</span>,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="space-y-6 px-6 py-4">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Reports</h1>
                    <p className="text-sm text-muted-foreground">
                        Generate, view, and manage reports across assets, transfers, and inventory scheduling.
                    </p>
                </div>

                {/* Reports Grid */}
                {reports.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {reports.map((report, idx) => (
                            <ReportCard key={idx} {...report} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border py-10 text-center text-muted-foreground">
                        <p>No reports available.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
