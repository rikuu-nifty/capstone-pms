import { PickerInput } from '@/components/picker-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ClipboardList, FileDown, FileSpreadsheet, FileText, Filter, RotateCcw, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { useState } from 'react';
// Keep react-select for filters
import ReactSelect from 'react-select';

// Use shadcn/ui for chart mode toggle
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select as ShadSelect } from '@/components/ui/select';

import OffCampusStatusChart from './charts/OffCampusStatusChart';
import DetailedOffCampusTable from './DetailedOffCampusTable';

type OffCampus = {
    id: number;
    requester_name: string;
    department: string | null;
    purpose: string;
    date_issued: string;
    return_date: string | null;
    status: string;
    quantity: number;
    units: string;
    remarks: string | null;
    approved_by: string | null;
};

type Filters = {
    from: string | null;
    to: string | null;
    status: string | null;
    department_id: number | null;
    requester_name: string | null;
};

const defaultFilters: Filters = {
    from: null,
    to: null,
    status: null,
    department_id: null,
    requester_name: null,
};

// ✅ Centralized status label mapping
export const STATUS_LABELS: Record<string, string> = {
    pending_review: 'Pending Review',
    pending_return: 'Pending Return',
    returned: 'Returned',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
    missing: 'Missing',
};

type PageProps = {
    title: string;
    records: OffCampus[];
    summary: Record<string, number>;
    statusSummary: Record<string, number>;
    purposeSummary: Record<string, number>;
    filters: Filters;
    departments: { id: number; name: string }[];
};

export default function OffCampusReport() {
    const { title, records, statusSummary, purposeSummary, summary, filters: initialFilters, departments } = usePage<PageProps>().props;

    const [filters, setFilters] = useState<Filters>(initialFilters ?? defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters ?? defaultFilters);

    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
    const [chartMode, setChartMode] = useState<'status' | 'purpose'>('status');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '/reports' },
        { title, href: '/reports/off-campus' },
    ];

    const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    //   // ✅ Build summary cards based on statusSummary
    // const totalRequests =
    //     (statusSummary.pending_review ?? 0) +
    //     (statusSummary.pending_return ?? 0) +
    //     (statusSummary.returned ?? 0) +
    //     (statusSummary.overdue ?? 0) +
    //     (statusSummary.cancelled ?? 0);

    // ✅ KPI cards use unfiltered summary (from backend)
    const summaryCards = [
        {
            label: 'Total Requests',
            value: summary.total ?? 0,
            color: 'text-primary',
            icon: <TrendingUp className="h-5 w-5 text-primary" />,
        },
        {
            label: 'Returned',
            value: summary.returned ?? 0,
            color: 'text-green-600',
            icon: <FileText className="h-6 w-6 text-green-600" />,
        },
        {
            label: 'Pending Return',
            value: summary.pending_return ?? 0,
            color: 'text-blue-600',
            icon: <FileDown className="h-6 w-6 text-blue-600" />,
        },
        {
            label: 'Pending Review',
            value: summary.pending_review ?? 0,
            color: 'text-amber-500',
            icon: <ClipboardList className="h-6 w-6 text-amber-500" />,
        },
        {
            label: 'Cancelled',
            value: summary.cancelled ?? 0,
            color: 'text-red-600',
            icon: <XCircle className="h-5 w-5 text-red-600" />,
        },
        {
            label: 'Overdue',
            value: summary.overdue ?? 0,
            color: 'text-[#800000]',
            icon: <AlertTriangle className="h-5 w-5 text-[#800000]" />,
        },
       
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="space-y-8 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-sm text-muted-foreground">Comprehensive overview of off-campus requests categorized by status and purpose.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
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
                        {/* From */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">From</label>
                            <PickerInput type="date" value={filters.from ?? ''} onChange={(v) => updateFilter('from', v || null)} />
                        </div>
                        {/* To */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">To</label>
                            <PickerInput type="date" value={filters.to ?? ''} onChange={(v) => updateFilter('to', v || null)} />
                        </div>
                        {/* Status */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">Status</label>
                            <ReactSelect
                                className="w-full"
                                value={filters.status ? { value: filters.status, label: STATUS_LABELS[filters.status] } : null}
                                options={Object.keys(STATUS_LABELS).map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
                                onChange={(opt) => updateFilter('status', opt?.value ?? null)}
                            />
                        </div>

                        {/* Department */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-sm font-medium text-black">Unit / Department</label>
                            <ReactSelect
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

                        {/* Requester Name */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">Requester Name</label>
                            <input
                                type="text"
                                value={filters.requester_name ?? ''}
                                onChange={(e) => updateFilter('requester_name', e.target.value || null)}
                                className="w-full rounded border p-2"
                                placeholder="Enter requester name..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 border-t pt-4">
                        <button
                            onClick={() => {
                                const reset = { ...defaultFilters };
                                setFilters(reset);
                                setAppliedFilters(reset);
                                router.get(route('reports.off-campus'), reset, { preserveState: true, preserveScroll: true });
                            }}
                            className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Clear Filters
                        </button>
                        <button
                            onClick={() => {
                                setAppliedFilters(filters);
                                router.get(route('reports.off-campus'), filters, { preserveState: true, preserveScroll: true });
                            }}
                            className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                            <Filter className="h-4 w-4" />
                            Apply Filters
                        </button>
                        {/* Export */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
                                    style={{ backgroundColor: '#155dfc' }}
                                >
                                    <FileDown className="h-4 w-4" />
                                    Export Summary
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-44 p-2">
                                <p className="px-2 pb-2 text-xs font-medium text-gray-600">Download as</p>
                                <div className="mb-2 border-t"></div>
                                <button
                                    onClick={() => window.open(route('reports.off-campus.export.pdf', appliedFilters))}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                    <FileText className="h-4 w-4 text-red-600" />
                                    PDF
                                </button>
                                <button
                                    onClick={() => window.open(route('reports.off-campus.export.excel', appliedFilters))}
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
                        <CardTitle>Off-Campus Distribution</CardTitle>

                        <div className="mt-2 flex gap-2 sm:mt-0">
                            {/* Chart Mode dropdown */}
                            <div className="w-40">
                                <ShadSelect value={chartMode} onValueChange={(v) => setChartMode(v as 'status' | 'purpose')}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="status">Status</SelectItem>
                                        <SelectItem value="purpose">Purpose</SelectItem>
                                    </SelectContent>
                                </ShadSelect>
                            </div>
                            {/* Chart/Table toggle */}
                            <div className="mr-4 inline-flex rounded-md shadow-sm">
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
                            Object.values(statusSummary).reduce((a, b) => a + b, 0) === 0 ? (
                                <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                                    <p className="text-lg font-semibold">No Data Available</p>
                                    <p className="text-sm">Try adjusting your filters to see results.</p>
                                </div>
                            ) : (
                                <OffCampusStatusChart chartMode={chartMode} statusSummary={statusSummary} purposeSummary={purposeSummary} />
                            )
                        ) : records.length === 0 ? (
                            <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                                <p className="text-lg font-semibold">No Data Available</p>
                                <p className="text-sm">Try adjusting your filters to see results.</p>
                            </div>
                        ) : (
                            <DetailedOffCampusTable records={records} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
