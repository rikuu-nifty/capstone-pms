import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { PickerInput } from '@/components/picker-input';
import PersonnelAssignmentsTable from './PersonnelAssignmentsTable';
import PersonnelAssignmentsDetailedTable from './PersonnelAssignmentsDetailedTable';
import Select from 'react-select';
import {
    Filter,
    RotateCcw,
    FileDown,
    FileText,
    FileSpreadsheet
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    ResponsiveContainer,
} from 'recharts';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

type PersonnelRow = {
    id: number;
    full_name: string;
    department: string | null;
    status: string;
    current_assets_count: number;
    past_assets_count: number;
};

type PaginationMeta = {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
};

type Paginator<T> = {
    data: T[];
    meta: PaginationMeta;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

type ChartRow = {
    name: string;
    current: number;
    past: number;
};

type AssetRecordRow = {
    assignment_item_id: number;
    asset_name: string;
    category: string | null;
    equipment_code: string | null;
    serial_no: string | null;
    asset_unit_or_department: string | null;
    personnel_name: string;
    previous_personnel_name: string | null;
    date_assigned: string | null;
    current_transfer_status: string | null;
    current_turnover_disposal_status: string | null;
    current_off_campus_status: string | null;
    current_inventory_status: string | null;
};

type PageProps = {
    records: Paginator<PersonnelRow>;
    assetRecords: Paginator<AssetRecordRow>;
    departments: { id: number; name: string }[];
    personnels: { id: number; full_name: string }[];
    categories: { id: number; name: string }[];
    filters: {
        department_id?: number | null;
        status?: string | null;
        from?: string | null;
        to?: string | null;
        personnel_id?: number | null;
        category_id?: number | null;
    };
    chartData: ChartRow[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'Personnel Assignments Report', href: '/reports/personnel-assignments' },
];

export default function PersonnelAssignmentsReport() {
    const firstLoadRef = useRef(true);
    const { 
        records, 
        assetRecords,
        departments,
        personnels,
        categories,
        filters: initialFilters, 
        chartData: initialChartData
    } = usePage<PageProps>().props;

    const defaultFilters = {
        from: null as string | null,
        to: null as string | null,
        department_id: null as number | null,
        status: null as string | null,
        personnel_id: null as number | null,
        category_id: null as number | null,
    };

    const [filters, setFilters] = useState({ ...defaultFilters, ...initialFilters });
    const [appliedFilters, setAppliedFilters] = useState({ ...defaultFilters, ...initialFilters });

    const [chartData, setChartData] = useState<ChartRow[]>(initialChartData);
    const [viewMode, setViewMode] = useState<'chart' | 'summary' | 'detailed'>('chart');

    const [page, setPage] = useState(records.meta.current_page ?? 1);
    const [total, setTotal] = useState(records.meta.total ?? 0);
    const [pageSize, setPageSize] = useState(records.meta.per_page ?? 10);
    const [displayed, setDisplayed] = useState<PersonnelRow[]>(records.data);

    function updateFilter<K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }

    function cleanFilters(obj: typeof filters) {
        const result: Record<string, string | number> = {};
        Object.entries(obj).forEach(([k, v]) => {
            if (v !== null && v !== undefined && v !== '') result[k] = String(v);
        });
        return result;
    }

    function buildQuery(filtersObj: typeof filters): string {
        const params: Record<string, string> = {};
        Object.entries(filtersObj).forEach(([key, value]) => {
            if (value !== null && value !== undefined) params[key] = String(value);
        });
        return new URLSearchParams(params).toString();
    }

    // Refetch when page changes
    useEffect(() => {
        if (firstLoadRef.current) {
            firstLoadRef.current = false;
            return;
        }

        router.get(
            route('reports.personnel-assignments'),
            { ...cleanFilters(appliedFilters), page },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onSuccess: (pageData) => {
                    const paginator = pageData.props.records as Paginator<PersonnelRow>;
                    setDisplayed(paginator.data);
                    setTotal(paginator.meta.total ?? 0);
                    setPageSize(paginator.meta.per_page ?? 10);
                    setChartData(pageData.props.chartData as ChartRow[]);
                },
            }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const chartConfig: ChartConfig = {
        past: { label: 'Past Assignments', color: 'var(--chart-1)' },
        current: { label: 'Current Assignments', color: 'var(--chart-2)' },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personnel Assignments Report" />

            <div className="space-y-6 px-6 py-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold">Personnel Assignments Report</h1>
                    <p className="text-sm text-muted-foreground">
                        Analyze the distribution of current and past asset assignments per personnel.
                    </p>
                </div>

                {/* Filters */}
                <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {/* From Date */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date Assigned (From)
                            </label>
                            <PickerInput
                                type="date"
                                value={filters.from ?? ""}
                                onChange={(v) =>
                                    updateFilter("from", v && v.trim() !== "" ? v : null)
                                }
                            />
                        </div>

                        {/* To Date */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date Assigned (To)
                            </label>
                            <PickerInput
                                type="date"
                                value={filters.to ?? ""}
                                onChange={(v) =>
                                updateFilter("to", v && v.trim() !== "" ? v : null)
                                }
                            />
                        </div>

                        {/* Personnel In Charge */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Personnel In Charge
                            </label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select personnel"
                                value={
                                    filters.personnel_id
                                        ? {
                                            value: filters.personnel_id,
                                            label:
                                                personnels.find((p) => p.id === filters.personnel_id)?.full_name || "",
                                        }
                                        : null
                                }
                                options={personnels.map((p) => ({
                                    value: p.id,
                                    label: p.full_name,
                                }))}
                                onChange={(opt) => updateFilter("personnel_id", opt?.value ?? null)}
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Unit / Department
                            </label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select department"
                                value={
                                filters.department_id
                                    ? {
                                        value: filters.department_id,
                                        label:
                                        departments.find((d) => d.id === filters.department_id)
                                            ?.name || "",
                                    }
                                    : null
                                }
                                options={departments.map((d) => ({
                                value: d.id,
                                label: d.name,
                                }))}
                                onChange={(opt) => updateFilter("department_id", opt?.value ?? null)}
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Personnel Status
                            </label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select status"
                                value={
                                    filters.status
                                        ? {
                                            value: filters.status,
                                            label: filters.status
                                            .replace("_", " ")
                                            .replace(/\b\w/g, (c) => c.toUpperCase()),
                                        }
                                        : null
                                    }
                                    options={[
                                    { value: "active", label: "Active" },
                                    { value: "inactive", label: "Inactive" },
                                    { value: "left_university", label: "Left University" },
                                ]}
                                onChange={(opt) => updateFilter("status", opt?.value ?? null)}
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Asset Category
                            </label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select category"
                                isDisabled={viewMode === 'summary' || viewMode === 'chart'}
                                value={
                                    filters.category_id
                                        ? {
                                            value: filters.category_id,
                                            label:
                                            categories.find((c) => c.id === filters.category_id)?.name || "",
                                        }
                                        : null
                                    }
                                    options={categories.map((c) => ({
                                    value: c.id,
                                    label: c.name,
                                }))}
                                onChange={(opt) => updateFilter("category_id", opt?.value ?? null)}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                        {/* Clear Filters */}
                        <button
                            onClick={() => {
                                setFilters(defaultFilters);
                                setAppliedFilters(defaultFilters);
                                setPage(1);
                                router.get(route('reports.personnel-assignments'), {}, {
                                    preserveState: true,
                                    preserveScroll: true,
                                    replace: true,
                                    onSuccess: (pageData) => {
                                        const paginator = pageData.props.records as Paginator<PersonnelRow>;
                                        setDisplayed(paginator.data);
                                        setTotal(paginator.meta.total ?? 0);
                                        setPageSize(paginator.meta.per_page ?? 10);
                                        setChartData(pageData.props.chartData as ChartRow[]);
                                    },
                                });
                            }}
                            className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Clear Filters
                        </button>

                        {/* Apply Filters */}
                        <button
                            onClick={() => {
                                setPage(1);
                                setAppliedFilters(filters);
                                router.get(
                                    route("reports.personnel-assignments"),
                                    { ...cleanFilters(filters), page: 1 },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                        replace: true,
                                        onSuccess: (pageData) => {
                                            const paginator = pageData.props.records as Paginator<PersonnelRow>;
                                            setDisplayed(paginator.data);
                                            setTotal(paginator.meta.total ?? 0);
                                            setPageSize(paginator.meta.per_page ?? 10);
                                            setChartData(pageData.props.chartData as ChartRow[]);
                                        },
                                    }
                                );
                            }}
                            className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                        >
                            <Filter className="h-4 w-4" />
                            Apply Filters
                        </button>

                        {/* Export Popover */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white cursor-pointer"
                                    style={{ backgroundColor: "#155dfc" }}
                                >
                                    <FileDown className="h-4 w-4" />
                                    Export
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-44 p-2">
                                <p className="px-2 pb-2 text-xs font-medium text-gray-600">
                                    Download as
                                </p>
                                <div className="mb-2 border-t" />
                                <button
                                    onClick={() => {
                                        const query = buildQuery(filters);
                                        const excelRoute =
                                        viewMode === "detailed"
                                            ? route("reports.personnel-assignments.export.detailed.excel")
                                            : route("reports.personnel-assignments.export.excel");
                                        window.open(`${excelRoute}?${query}`, "_blank");
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                    Excel
                                </button>
                                <button
                                    onClick={() => {
                                        const query = buildQuery(filters);
                                        const pdfRoute =
                                        viewMode === "detailed"
                                            ? route("reports.personnel-assignments.export.detailed.pdf")
                                            : route("reports.personnel-assignments.export.pdf");
                                        window.open(`${pdfRoute}?${query}`, "_blank");
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                >
                                    <FileText className="h-4 w-4 text-red-600" />
                                    PDF
                                </button>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Chart + Table */}
                <Card className="rounded-2xl shadow-md">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Personnel Assignment Overview</CardTitle>
                        <div className="mt-2 flex gap-2 sm:mt-0">
                            <div className="inline-flex rounded-md shadow-sm">
                                <button
                                    onClick={() => {
                                        setViewMode('chart');
                                        if (filters.category_id) updateFilter('category_id', null);
                                    }}
                                    className={`border px-4 py-2 text-sm font-medium cursor-pointer ${
                                        viewMode === 'chart'
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    } rounded-l-md`}
                                >
                                    Chart
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode('summary');
                                        if (filters.category_id) updateFilter('category_id', null);
                                    }}
                                    className={`border-t border-b px-4 py-2 text-sm font-medium cursor-pointer ${
                                    viewMode === 'summary'
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Summary
                                </button>
                                <button
                                    onClick={() => setViewMode('detailed')}
                                    className={`border px-4 py-2 text-sm font-medium cursor-pointer ${
                                    viewMode === 'detailed'
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    } rounded-r-md`}
                                >
                                    Detailed
                                </button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="h-[450px]">
                        {viewMode === 'chart' ? (
                            <ChartContainer config={chartConfig} className="mx-auto aspect-[4/3] max-h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(v) => (v.length > 12 ? v.slice(0, 12) + '…' : v)}
                                        />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />

                                        <Bar dataKey="past" fill="var(--chart-1)" radius={4} />
                                        <Bar dataKey="current" fill="var(--chart-2)" radius={4} />

                                        <ChartLegend content={<ChartLegendContent />} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : viewMode === 'summary' ? (
                            <PersonnelAssignmentsTable
                                records={displayed}
                                page={page}
                                total={total}
                                pageSize={pageSize}
                                onPageChange={(newPage) => setPage(newPage)}
                                hasActiveFilters={Object.keys(cleanFilters(appliedFilters)).length > 0}
                            />
                        ) : (
                            <PersonnelAssignmentsDetailedTable
                                records={assetRecords.data}
                                page={assetRecords.meta.current_page}
                                total={assetRecords.meta.total}
                                pageSize={assetRecords.meta.per_page}
                                onPageChange={(newPage) => setPage(newPage)}
                                hasActiveFilters={Object.keys(cleanFilters(appliedFilters)).length > 0}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
