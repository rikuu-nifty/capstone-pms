import { useState, useEffect } from 'react';
import { PickerInput } from '@/components/picker-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { FileDown, FileSpreadsheet, FileText, Filter, RotateCcw } from 'lucide-react';
import Select from 'react-select';
import { Cell, Label, Pie, PieChart, TooltipProps } from 'recharts';
import InventorySheetTable from './InventorySheetTable';

// Chart + Data Types
type ChartData = { label: string; value: number };
export type AssetRow = {
    id: number;
    asset_name: string;
    asset_type: string;
    sub_area: string | null;
    quantity: number;
    status: string;
    inventory_status: string; // scheduled | inventoried | not_inventoried
    memorandum_no?: string | null;
    supplier?: string | null;
    date_purchased?: string | null;
    unit_cost?: number | null;
    inventoried_at?: string | null;
    serial_no?: string | null;
};

type PaginationLinks = {
    first?: string | null;
    last?: string | null;
    next?: string | null;
    prev?: string | null;
};

type PaginationMeta = {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
};

type Paginator<T> = {
    data: T[];
    links: PaginationLinks;
    meta: PaginationMeta;
};

type InventorySheetPageProps = {
    chartData: ChartData[];
    assets: {
        data: AssetRow[];
        meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
        };
        links: {
        url: string | null;
        label: string;
        active: boolean;
        }[];
    };
    buildings: { id: number; name: string }[];
    departments: { id: number; name: string }[];
    rooms: { id: number; room: string; building_id: number }[];
    subAreas: { id: number; name: string; building_room_id: number }[];
};

// 🔹 Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'Inventory Sheet Report', href: '/reports/inventory-sheet' },
];

// 🔹 Chart Colors
const BASE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC'];
function generateColor(index: number, total: number): string {
    if (index < BASE_COLORS.length) return BASE_COLORS[index];
    const step = 360 / total;
    const hue = (210 + index * step) % 360;
    return `hsl(${hue}, 80%, 60%)`;
}

const STATUS_LABELS: Record<string, string> = {
    not_inventoried: 'Not Inventoried',
    scheduled: 'Scheduled',
    inventoried: 'Inventoried',
};

function formatStatusLabel(label: string): string {
    return (
        STATUS_LABELS[label.toLowerCase()] ??
        label.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    );
}

// 🔹 Tooltip
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const entry = payload[0].payload as ChartData & { total?: number };
        const total = entry.total ?? 0;
        const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
        return (
        <div className="rounded-md border bg-white p-2 text-sm shadow-md">
            <p className="font-medium">{formatStatusLabel(entry.label)}</p>
            <p>
            {entry.value} Assets ({percent}%)
            </p>
        </div>
        );
    }
    return null;
};

export default function InventorySheetReport() {
    const { chartData, assets, buildings, departments, rooms, subAreas } =
        usePage<InventorySheetPageProps>().props;

    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

    const [page, setPage] = useState(assets?.meta?.current_page ?? 1);
    const [total, setTotal] = useState(assets?.meta?.total ?? 0);
    const [pageSize, setPageSize] = useState(assets?.meta?.per_page ?? 25);

    const [displayedAssets, setDisplayedAssets] = useState<AssetRow[]>(assets.data);

    const defaultFilters = {
        from: null as string | null,
        to: null as string | null,
        building_id: null as number | null,
        department_id: null as number | null,
        room_id: null as number | null,
        sub_area_id: null as number | null,
    };
    const [filters, setFilters] = useState(defaultFilters);

    function updateFilter<K extends keyof typeof filters>(
        key: K,
        value: (typeof filters)[K]
    ) {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }

    function buildQuery(filters: typeof defaultFilters): string {
        const params: Record<string, string> = {};
        Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            params[key] = String(value);
        }
        });
        return new URLSearchParams(params).toString();
    }

    // const requireSubAreaToFetch = false;

    useEffect(() => {
        router.get(
            route('reports.inventory-sheet'),
            { ...filters, page },
            {
                preserveState: true,
                onSuccess: (pageData) => {
                    const paginator = pageData.props.assets as Paginator<AssetRow>;
                    setDisplayedAssets(paginator.data);
                    setPage(paginator.meta.current_page);
                    setTotal(paginator.meta.total);
                    setPageSize(paginator.meta.per_page);
                },
            }
        );
    }, [filters, page,]);

    const totalAssets = chartData.reduce((acc, curr) => acc + curr.value, 0);
    const unsortedChartData = chartData.map((d) => ({ ...d, total: totalAssets }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Sheet Report" />

            <div className="space-y-6 px-6 py-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold">Inventory Sheet Report</h1>
                    <p className="text-sm text-muted-foreground">
                        Generate detailed per-room/per-building inventory sheets.
                    </p>
                </div>

                {/* ✅ Filter Bar */}
                <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {/* From */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                From
                            </label>
                            <PickerInput
                                type="date"
                                value={filters.from ?? ''}
                                onChange={(v) => updateFilter('from', v && v.trim() !== '' ? v : null)}
                            />
                        </div>
                        {/* To */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">To</label>
                            <PickerInput
                                type="date"
                                value={filters.to ?? ''}
                                onChange={(v) => updateFilter('to', v && v.trim() !== '' ? v : null)}
                            />
                        </div>

                        {/* Building */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Building
                            </label>
                            <Select
                                className="w-full"
                                value={
                                filters.building_id
                                    ? {
                                        value: filters.building_id,
                                        label:
                                        buildings.find((b) => b.id === filters.building_id)?.name || '',
                                    }
                                    : null
                                }
                                options={buildings.map((b) => ({ value: b.id, label: b.name }))}
                                onChange={(opt) => updateFilter('building_id', opt?.value ?? null)}
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Unit / Department
                            </label>
                            <Select
                                className="w-full"
                                value={
                                filters.department_id
                                    ? {
                                        value: filters.department_id,
                                        label:
                                        departments.find((d) => d.id === filters.department_id)?.name ||
                                        '',
                                    }
                                    : null
                                }
                                options={departments.map((d) => ({ value: d.id, label: d.name }))}
                                onChange={(opt) => updateFilter('department_id', opt?.value ?? null)}
                            />
                        </div>

                        {/* Room */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Room</label>
                            <Select
                                className="w-full"
                                value={
                                filters.room_id
                                    ? {
                                        value: filters.room_id,
                                        label: rooms.find((r) => r.id === filters.room_id)?.room || '',
                                    }
                                    : null
                                }
                                options={rooms.map((r) => ({ value: r.id, label: r.room }))}
                                onChange={(opt) => updateFilter('room_id', opt?.value ?? null)}
                            />
                        </div>

                        {/* Sub-Area */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Sub-Area
                            </label>
                            <Select
                                className="w-full"
                                value={
                                filters.sub_area_id
                                    ? {
                                        value: filters.sub_area_id,
                                        label:
                                        subAreas.find((s) => s.id === filters.sub_area_id)?.name || '',
                                    }
                                    : null
                                }
                                options={subAreas.map((s) => ({ value: s.id, label: s.name }))}
                                onChange={(opt) => updateFilter('sub_area_id', opt?.value ?? null)}
                            />
                        </div>
                    </div>

                    {/* --- Action Buttons --- */}
                    <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                        <button
                            onClick={() => {
                                setFilters(defaultFilters);
                                router.get(route('reports.inventory-sheet'), defaultFilters, {
                                    preserveState: true,
                                    onSuccess: (pageData) => {
                                        const paginator = pageData.props.assets as InventorySheetPageProps['assets'];
                                        setDisplayedAssets(paginator.data);
                                    },
                                });
                            }}
                            className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Clear Filters
                        </button>

                        <button
                                onClick={() => {
                                    router.get(route('reports.inventory-sheet'), filters, {
                                        preserveState: true,
                                        onSuccess: (pageData) => {
                                            const paginator = pageData.props.assets as InventorySheetPageProps['assets'];
                                            setDisplayedAssets(paginator.data);
                                        },
                                    });
                                }}
                                className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                            >
                                <Filter className="h-4 w-4" />
                                Apply Filters
                        </button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white cursor-pointer"
                                    style={{ backgroundColor: '#155dfc' }}
                                >
                                    <FileDown className="h-4 w-4" />
                                    Export
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-44 p-2">
                                <p className="px-2 pb-2 text-xs font-medium text-gray-600">Download as</p>
                                    <div className="mb-2 border-t"></div>

                                    <button
                                    onClick={() => {
                                        const query = buildQuery(filters);
                                        window.open(
                                        route('reports.inventory-sheet.export.excel') + '?' + query,
                                        '_blank'
                                        );
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                    Excel
                                </button>

                                <button
                                    onClick={() => {
                                        const query = buildQuery(filters);
                                        window.open(
                                        route('reports.inventory-sheet.export.pdf') + '?' + query,
                                        '_blank'
                                        );
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

                {/* Chart + Table Card */}
                <Card className="rounded-2xl shadow-md">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Inventory Sheets</CardTitle>
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
                <CardContent className="h-96">
                    {viewMode === 'chart' ? (
                    totalAssets === 0 ? (
                        <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                        <p className="text-lg font-semibold">No Data Available</p>
                        <p className="text-sm">Try adjusting your filters to see results.</p>
                        </div>
                    ) : (
                        <>
                        <ChartContainer
                            config={{ assets: { label: 'Assets' } }}
                            className="mx-auto aspect-square max-h-[350px]"
                        >
                            <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<CustomTooltip active={false} payload={[]} />}
                            />
                            <Pie
                                data={unsortedChartData}
                                dataKey="value"
                                nameKey="label"
                                innerRadius={80}
                                outerRadius={120}
                                stroke="none"
                            >
                                {unsortedChartData.map((_, index) => (
                                <Cell
                                    key={index}
                                    fill={generateColor(index, unsortedChartData.length)}
                                />
                                ))}
                                <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                    return (
                                        <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        >
                                        <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="fill-foreground text-3xl font-bold"
                                        >
                                            {totalAssets.toLocaleString()}
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground text-sm"
                                        >
                                            Total Assets
                                        </tspan>
                                        </text>
                                    );
                                    }
                                }}
                                />
                            </Pie>
                            </PieChart>
                        </ChartContainer>
                        <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm">
                            {unsortedChartData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span
                                className="h-3 w-3 rounded-sm"
                                style={{
                                    backgroundColor: generateColor(
                                    index,
                                    unsortedChartData.length
                                    ),
                                }}
                                />
                                <span className="text-gray-700">
                                {formatStatusLabel(entry.label)}
                                </span>
                                <span className="font-medium text-gray-900">
                                {entry.value.toLocaleString()}
                                </span>
                            </div>
                            ))}
                        </div>
                        </>
                    )
                    ) : (
                    <InventorySheetTable
                        assets={displayedAssets}
                        page={page}
                        total={total}
                        pageSize={pageSize}
                        onPageChange={(newPage) => {
                        setPage(newPage);
                        router.get(
                            route('reports.inventory-sheet'),
                            { ...filters, page: newPage },
                            { preserveState: true, preserveScroll: true }
                        );
                        }}
                    />
                    )}
                </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
