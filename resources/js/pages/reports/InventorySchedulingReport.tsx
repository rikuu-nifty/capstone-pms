import { PickerInput } from '@/components/picker-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarCheck2,
    ClipboardList,
    Clock,
    FileDown,
    FileSpreadsheet,
    FileText,
    Filter,
    RotateCcw,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import Select from 'react-select';
import { InventorySchedulingStatusChart } from './charts/InventorySchedulingStatusChart';
import DetailedScheduledTable from './DetailedScheduledTable';

type ScheduleRow = {
    id: number;
    department: string;
    building: string;
    room: string;
    sub_area: string | null;
    inventory_month: string;
    actual_date: string | null;
    assets: number;
    status: string;
};

type PageProps = {
    title: string;
    summary: {
        total: number;
        completed: number;
        pending: number;
        pending_review: number;
        overdue: number;
        cancelled: number;
    };
    chartSummary: {
        total: number;
        completed: number;
        pending: number;
        pending_review: number;
        overdue: number;
        cancelled: number;
    };
    monthlyTrends: { ym: string; total: number }[];

    // ✅ schedules is now a plain array
    schedules: ScheduleRow[];

    buildings: { id: number; name: string }[];
    departments: { id: number; name: string }[];
    rooms: { id: number; name: string; building_id: number }[];
    filters: Filters;
};

// 🔹 Default filters type
type Filters = {
    from: string | null;
    to: string | null;
    scheduling_status: string | null;
    building_id: number | null;
    department_id: number | null;
    room_id: number | null; // 👈 this stays
};

// 🔹 Default filter values
const defaultFilters: Filters = {
    from: null,
    to: null,
    scheduling_status: null,
    building_id: null,
    department_id: null,
    room_id: null,
};

export default function InventorySchedulingReport() {
    const { title, summary, chartSummary, buildings, departments, rooms, schedules, filters: initialFilters } = usePage<PageProps>().props;

    const [filters, setFilters] = useState<Filters>(initialFilters ?? defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters ?? defaultFilters);

    const statusOptions = [
        { value: 'Pending_Review', label: 'Pending Review' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Overdue', label: 'Overdue' },
        { value: 'Cancelled', label: 'Cancelled' },
    ];

    // ✅ directly store schedules as plain array
    const [displayedSchedules, setDisplayedSchedules] = useState<ScheduleRow[]>(schedules);

    const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '/reports' },
        { title, href: '/reports/inventory-scheduling' },
    ];

    const summaryCards = [
        { label: 'Total Schedules', value: summary.total, color: 'text-primary', icon: <TrendingUp className="h-5 w-5 text-primary" /> },
        { label: 'Completed', value: summary.completed, color: 'text-green-600', icon: <CalendarCheck2 className="h-5 w-5 text-green-600" /> },
        { label: 'Pending', value: summary.pending, color: 'text-blue-600', icon: <Clock className="h-5 w-5 text-blue-600" /> },
        { label: 'Pending Review', value: summary.pending_review, color: 'text-amber-500', icon: <ClipboardList className="h-6 w-6" /> },
        { label: 'Cancelled', value: summary.cancelled, color: 'text-red-600', icon: <XCircle className="h-5 w-5 text-red-600" /> },
        { label: 'Overdue', value: summary.overdue, color: 'text-[#800000]', icon: <AlertTriangle className="h-5 w-5 text-[#800000]" /> },
    ];
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="space-y-8 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-sm text-muted-foreground">Overview of schedule distribution and monthly activity trends.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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

                {/* Filter Bar */}
                <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* From */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-sm font-medium text-black">From</label>
                            <PickerInput type="date" value={filters.from ?? ''} onChange={(v) => updateFilter('from', v || null)} />
                        </div>

                        {/* To */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-sm font-medium text-black">To</label>
                            <PickerInput type="date" value={filters.to ?? ''} onChange={(v) => updateFilter('to', v || null)} />
                        </div>

                        {/* Status */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-sm font-medium text-black">Status</label>
                            <Select
                                className="w-full"
                                value={
                                    filters.scheduling_status ? (statusOptions.find((opt) => opt.value === filters.scheduling_status) ?? null) : null
                                }
                                options={statusOptions}
                                onChange={(opt) => updateFilter('scheduling_status', opt?.value ?? null)}
                                placeholder="Select status..."
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

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                        {/* Clear Filters */}
                        <button
                            onClick={() => {
                                const reset = { ...defaultFilters };
                                setFilters(reset);
                                setAppliedFilters(reset);

                                router.get(route('reports.inventory-scheduling'), reset, {
                                    preserveState: true,
                                    preserveScroll: true, // ✅ keep current scroll position
                                    onSuccess: (page) => {
                                        setDisplayedSchedules(page.props.schedules as ScheduleRow[]);
                                    },
                                });
                            }}
                            className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Clear Filters
                        </button>

                        {/* Apply Filters */}
                        <button
                            onClick={() => {
                                setAppliedFilters(filters);
                                router.get(route('reports.inventory-scheduling'), filters, {
                                    preserveState: true,
                                    preserveScroll: true, // ✅ keep current scroll position
                                    onSuccess: (page) => {
                                        setDisplayedSchedules(page.props.schedules as ScheduleRow[]);
                                    },
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
                                        const url = route('reports.inventory-scheduling.export.pdf', appliedFilters);
                                        window.open(url, '_blank');
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                    <FileText className="h-4 w-4 text-red-600" />
                                    PDF
                                </button>
                                <button
                                    onClick={() => {
                                        const url = route('reports.inventory-scheduling.export.excel', appliedFilters);
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

                {/* Scheduling Status Distribution */}
                <Card className="rounded-2xl shadow-md">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Scheduling Status Distribution</CardTitle>

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
                                <InventorySchedulingStatusChart
                                    data={[
                                        { label: 'Completed', value: chartSummary.completed },
                                        { label: 'Pending', value: chartSummary.pending },
                                        { label: 'Pending Review', value: chartSummary.pending_review },
                                        { label: 'Cancelled', value: chartSummary.cancelled },
                                        { label: 'Overdue', value: chartSummary.overdue },
                                    ]}
                                    height="h-[350px]"
                                />
                            )
                        ) : (
                            <DetailedScheduledTable schedules={displayedSchedules} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
