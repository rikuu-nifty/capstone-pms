import { PickerInput } from '@/components/picker-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowRightLeft, Calendar, ClipboardList, FileDown, FileSpreadsheet, FileText, Filter, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Select from 'react-select';
import TransferStatusChart from './charts/TransferStatusChart';
import DetailedTransfersTable from './DetailedTransfersTable';

type Transfer = {
    id: number;
    current_building: string | null;
    current_room: string | null;
    current_department: string | null;
    receiving_building: string | null;
    receiving_room: string | null;
    receiving_department: string | null;
    assigned_by: string | null;
    status: string;
    assets: number;
    created_at: string;
    scheduled_date?: string | null;
};

type PageProps = {
    title: string;
    transfers: Transfer[];
    filters: Filters;
    buildings: { id: number; name: string }[];
    departments: { id: number; name: string }[];
    rooms: { id: number; name: string; building_id: number }[];

    summary: {
        total: number;
        completed: number;
        pending_review: number;
        upcoming: number;
        in_progress: number;
        overdue: number;
        cancelled: number;
    };

    // 👇 ADD THIS
    chartSummary: {
        total: number;
        completed: number;
        pending_review: number;
        upcoming: number;
        in_progress: number;
        overdue: number;
        cancelled: number;
    };

    monthlyStatusTrends: {
        month: string;
        completed: number;
        pending_review: number;
        upcoming: number;
        in_progress: number;
        overdue: number;
        cancelled: number;
    }[]; // ✅ new dataset for chart
};

type Filters = {
    from: string | null;
    to: string | null;
    status: string | null;
    building_id: number | null;
    department_id: number | null;
    room_id: number | null;
};

const defaultFilters: Filters = {
    from: null,
    to: null,
    status: null,
    building_id: null,
    department_id: null,
    room_id: null,
};

// ✅ Centralized status label mapping (snake_case → Title Case)
export const STATUS_LABELS: Record<string, string> = {
    completed: 'Completed',
    pending_review: 'Pending Review',
    upcoming: 'Upcoming',
    in_progress: 'In Progress',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
};

export default function PropertyTransferReport() {
    const {
        title,
        summary,
        transfers,
        monthlyStatusTrends,
        chartSummary,
        departments,
        buildings,
        rooms,
        filters: initialFilters,
    } = usePage<PageProps>().props;

    const [filters, setFilters] = useState<Filters>(initialFilters ?? defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters ?? defaultFilters);
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

    const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '/reports' },
        { title, href: '/reports/transfer' },
    ];

    // ✅ Build summary cards AFTER we have summary
    const summaryCards = [
        { label: 'Total Transfers', value: summary.total, color: 'text-primary', icon: <ArrowRightLeft className="h-5 w-5 text-primary" /> },
        { label: 'Completed', value: summary.completed, color: 'text-green-600', icon: <FileText className="h-5 w-5 text-green-600" /> },
        {
            label: 'Pending Review',
            value: summary.pending_review ?? 0,
            color: 'text-amber-500',
            icon: <ClipboardList className="h-6 w-6 text-amber-500" />,
        },
        { label: 'Upcoming', value: summary.upcoming ?? 0, color: 'text-blue-600', icon: <Calendar className="h-5 w-5 text-blue-600" /> },
        { label: 'In Progress', value: summary.in_progress ?? 0, color: 'text-purple-600', icon: <FileDown className="h-5 w-5 text-purple-600" /> },
        { label: 'Overdue', value: summary.overdue ?? 0, color: 'text-[#800000]', icon: <RotateCcw className="h-5 w-5 text-[#800000]" /> },
        { label: 'Cancelled', value: summary.cancelled, color: 'text-gray-600', icon: <Trash2 className="h-5 w-5 text-gray-600" /> },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="space-y-8 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-sm text-muted-foreground">Overview of transfers across buildings and departments.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
                    {summaryCards.map((card, idx) => (
                        <div
                            key={idx}
                            className="flex transform flex-col justify-between rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm transition hover:scale-105 hover:border-gray-200 hover:shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                                    <p className={`text-3xl font-extrabold tracking-tight ${card.color}`}>{card.value.toLocaleString()}</p>
                                </div>
                                <div className={`text-2xl ${card.color}`}>{card.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">From</label>
                            <PickerInput type="date" value={filters.from ?? ''} onChange={(v) => updateFilter('from', v || null)} />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">To</label>
                            <PickerInput type="date" value={filters.to ?? ''} onChange={(v) => updateFilter('to', v || null)} />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">Status</label>
                            <Select
                                className="w-full"
                                value={filters.status ? { value: filters.status, label: STATUS_LABELS[filters.status] } : null}
                                options={Object.keys(STATUS_LABELS).map((s) => ({
                                    value: s,
                                    label: STATUS_LABELS[s],
                                }))}
                                onChange={(opt) => updateFilter('status', opt?.value ?? null)}
                            />
                        </div>

                        {/* Unit / Department */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-sm font-medium text-black">Unit / Department</label>
                            <Select
                                className="w-full"
                                value={
                                    filters.department_id
                                        ? {
                                              value: Number(filters.department_id),
                                              label: departments.find((d) => d.id === Number(filters.department_id))?.name || '',
                                          }
                                        : null
                                }
                                options={departments.map((d) => ({ value: d.id, label: d.name }))}
                                onChange={(opt) => updateFilter('department_id', opt ? Number(opt.value) : null)}
                                placeholder="Select department..."
                            />
                        </div>

                        {/* Building */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-sm font-medium text-black">Building</label>
                            <Select
                                className="w-full"
                                value={
                                    filters.building_id
                                        ? {
                                              value: Number(filters.building_id),
                                              label: buildings.find((b) => b.id === Number(filters.building_id))?.name || '',
                                          }
                                        : null
                                }
                                options={buildings.map((b) => ({ value: b.id, label: b.name }))}
                                onChange={(opt) => updateFilter('building_id', opt ? Number(opt.value) : null)}
                                placeholder="Select building..."
                            />
                        </div>

                        {/* Room */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-sm font-medium text-black">Room</label>
                            <Select
                                className="w-full"
                                value={
                                    filters.room_id
                                        ? {
                                              value: Number(filters.room_id),
                                              label: rooms.find((r) => r.id === Number(filters.room_id))?.name || '',
                                          }
                                        : null
                                }
                                options={rooms
                                    .filter((r) => !filters.building_id || r.building_id === Number(filters.building_id))
                                    .map((r) => ({ value: r.id, label: r.name }))}
                                onChange={(opt) => updateFilter('room_id', opt ? Number(opt.value) : null)}
                                placeholder="Select room..."
                                isDisabled={!filters.building_id}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t pt-4">
                        <button
                            onClick={() => {
                                const reset = { ...defaultFilters };
                                setFilters(reset);
                                setAppliedFilters(reset);
                                router.get(route('reports.transfer'), reset, {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                            className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Clear Filters
                        </button>

                        <button
                            onClick={() => {
                                setAppliedFilters(filters);
                                router.get(route('reports.transfer'), filters, {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                            className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                            <Filter className="h-4 w-4" />
                            Apply Filters
                        </button>

                        {/* Export Summary */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
                                    style={{ backgroundColor: '#155dfc' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0d47d9')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#155dfc')}
                                >
                                    <FileDown className="h-4 w-4" />
                                    Export Summary
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-44 p-2">
                                <p className="text-black-500 px-2 pb-2 text-xs font-medium">Download as</p>
                                <div className="mb-2 border-t"></div>

                                <button
                                    onClick={() => {
                                        const url = route('reports.transfer.export.pdf', appliedFilters);
                                        window.open(url, '_blank');
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                    <FileText className="h-4 w-4 text-red-600" />
                                    PDF
                                </button>
                                <button
                                    onClick={() => {
                                        const url = route('reports.transfer.export.excel', appliedFilters);
                                        window.open(url, '_blank');
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                    Excel
                                </button>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Chart + Table */}
                <Card className="rounded-2xl shadow-md">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Transfer Status Distribution</CardTitle>

                        {/* ✅ Same toggle UI as Asset Inventory List */}
                        <div className="mt-2 flex gap-2 sm:mt-0">
                            <div className="inline-flex rounded-md shadow-sm">
                                <button
                                    onClick={() => setViewMode('chart')}
                                    className={`border px-4 py-2 text-sm font-medium ${
                                        viewMode === 'chart'
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    } rounded-l-md`}
                                >
                                    Chart
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`border-t border-b px-4 py-2 text-sm font-medium ${
                                        viewMode === 'table'
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    } rounded-r-md`}
                                >
                                    Table
                                </button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="h-[400px]">
                        {viewMode === 'chart' ? (
                            chartSummary.total === 0 ? (
                                <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                                    <p className="text-lg font-semibold">No Data Available</p>
                                    <p className="text-sm">Try adjusting your filters to see results.</p>
                                </div>
                            ) : (
                                <TransferStatusChart data={monthlyStatusTrends} height="h-[350px]" />
                            )
                        ) : transfers.length === 0 ? (
                            <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                                <p className="text-lg font-semibold">No Data Available</p>
                                <p className="text-sm">Try adjusting your filters to see results.</p>
                            </div>
                        ) : (
                            <DetailedTransfersTable transfers={transfers} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
