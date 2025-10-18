import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Input } from '@/components/ui/input';
import Select from 'react-select';
import {
  Filter,
  RotateCcw,
  FileDown,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  FileSpreadsheet
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
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
import Pagination, { PageInfo } from '@/components/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
type PageProps = {
    records: Paginator<PersonnelRow>;
    departments: { id: number; name: string }[];
    filters: {
        department_id?: number | null;
        status?: string | null;
        from?: string | null;
        to?: string | null;
    };
    chartData: ChartRow[];
};


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'Personnel Assignments Report', href: '/reports/personnel-assignments' },
];

export default function PersonnelAssignmentsReport() {
    const firstLoadRef = useRef(true);
    const { records, departments, filters: initialFilters, chartData: initialChartData } =
        usePage<PageProps>().props;

    const [filters, setFilters] = useState({ ...initialFilters });
    const [appliedFilters, setAppliedFilters] = useState({ ...initialFilters });
    const [chartData, setChartData] = useState<ChartRow[]>(initialChartData);
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

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

    // Trend logic
    const currentTotal = chartData.reduce((sum, d) => sum + d.current, 0);
    const pastTotal = chartData.reduce((sum, d) => sum + d.past, 0);

    let trendLabel: string | null = null;
    let TrendIcon: React.ElementType = Minus;
    let trendColor = 'text-muted-foreground';

    if (pastTotal > 0) {
        const change = ((currentTotal - pastTotal) / pastTotal) * 100;
        if (change > 0) {
        trendLabel = `Current assignments increased by ${change.toFixed(1)}%`;
        TrendIcon = TrendingUp;
        trendColor = 'text-green-600';
        } else if (change < 0) {
        trendLabel = `Current assignments decreased by ${Math.abs(change).toFixed(1)}%`;
        TrendIcon = TrendingDown;
        trendColor = 'text-red-600';
        } else {
        trendLabel = 'No change in total assignments';
        }
    }

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
                        
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">From Date</label>
                            <Input
                                type="date"
                                value={filters.from || ''}
                                onChange={(e) => updateFilter('from', e.target.value || null)}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">To Date</label>
                            <Input
                                type="date"
                                value={filters.to || ''}
                                onChange={(e) => updateFilter('to', e.target.value || null)}
                            />
                        </div>
                        
                        {/* Department */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Department</label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select department"
                                value={
                                filters.department_id
                                    ? {
                                        value: filters.department_id,
                                        label: departments.find((d) => d.id === filters.department_id)?.name || '',
                                    }
                                    : null
                                }
                                options={departments.map((d) => ({ value: d.id, label: d.name }))}
                                onChange={(opt) => updateFilter('department_id', opt?.value ?? null)}
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Personnel Status</label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select status"
                                value={
                                filters.status
                                    ? {
                                        value: filters.status,
                                        label: filters.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                                    }
                                    : null
                                }
                                options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'left_university', label: 'Left University' },
                                ]}
                                onChange={(opt) => updateFilter('status', opt?.value ?? null)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                        <button
                            onClick={() => {
                                setFilters({});
                                setAppliedFilters({});
                                setPage(1);
                                router.get(route('reports.personnel-assignments'), {}, {
                                preserveState: true,
                                replace: true,
                                });
                            }}
                            className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Clear Filters
                        </button>

                        <button
                            onClick={() => {
                                setPage(1);
                                setAppliedFilters(filters);
                                router.get(
                                route('reports.personnel-assignments'),
                                { ...cleanFilters(filters), page: 1 },
                                { preserveState: true, replace: true }
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
                                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                                >
                                    <FileDown className="h-4 w-4" />
                                    Export
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-44 p-2">
                                <p className="px-2 pb-2 text-xs font-medium text-gray-600">Download as</p>
                                <div className="mb-2 border-t" />
                                <button
                                    onClick={() => {
                                        const query = buildQuery(filters);
                                        window.open(`${route('reports.personnel-assignments.export.excel')}?${query}`, '_blank');
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                    Excel
                                </button>
                                <button
                                    onClick={() => {
                                        const query = buildQuery(filters);
                                        window.open(`${route('reports.personnel-assignments.export.pdf')}?${query}`, '_blank');
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
                        onClick={() => setViewMode('chart')}
                        className={`border px-4 py-2 text-sm font-medium cursor-pointer ${
                            viewMode === 'chart'
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        } rounded-l-md`}
                        >
                        Chart
                        </button>
                        <button
                        onClick={() => setViewMode('table')}
                        className={`border-t border-b px-4 py-2 text-sm font-medium cursor-pointer ${
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
                                    tickFormatter={(v) => v.split(' ')[0]}
                                />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />

                                <Bar dataKey="past" fill="var(--chart-1)" radius={4} />
                                <Bar dataKey="current" fill="var(--chart-2)" radius={4} />
                                <ChartLegend content={<ChartLegendContent />} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    ) : (
                    <div className="flex h-full flex-col rounded-md border">
                        <div className="flex-1 overflow-y-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="text-center w-[150px]">Personnel</TableHead>
                                <TableHead className="text-center">Department</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Past Assets</TableHead>
                                <TableHead className="text-center">Current Assets</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayed.map((p) => (
                                    <TableRow key={p.id} className="text-center">
                                        <TableCell className="font-medium">{p.full_name}</TableCell>
                                        <TableCell>{p.department || '—'}</TableCell>
                                        <TableCell>{p.status.replace('_', ' ')}</TableCell>
                                        <TableCell className="text-blue-600 font-medium">{p.past_assets_count}</TableCell>
                                        <TableCell className="text-green-600 font-medium">{p.current_assets_count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                        <div className="flex items-center justify-between border-t p-3">
                            <PageInfo page={page} total={total} pageSize={pageSize} label="records" />
                            <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
                        </div>
                    </div>
                    )}
                </CardContent>

                {viewMode === 'chart' && (
                    <CardFooter className="flex-col gap-2 pt-4 text-sm">
                    {trendLabel ? (
                        <div className={`flex items-center gap-2 leading-none font-medium ${trendColor}`}>
                        {trendLabel} <TrendIcon className="h-4 w-4" />
                        </div>
                    ) : (
                        <div className="text-muted-foreground">No trend data available</div>
                    )}
                    </CardFooter>
                )}
                </Card>
            </div>
        </AppLayout>
    );
}
