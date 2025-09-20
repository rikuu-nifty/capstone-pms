import { PickerInput } from '@/components/picker-input'; // ✅ use PickerInput
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { FileDown, FileSpreadsheet, FileText, Filter, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import Select from 'react-select';
import { Cell, Label, Pie, PieChart, TooltipProps } from 'recharts';
import DetailedAssetsTable from './DetailedAssetsTable';
import NewPurchasedTable from './NewPurchasedTable';

type ChartData = {
    label: string;
    value: number;
};
export type Asset = {
    id: number;
    asset_name: string;
    brand: string;
    model: string;
    category: string;
    department: string;
    building: string;
    room: string;
    supplier: string;
    asset_type: string;
    date_purchased: string;
    unit_cost: number | null; // ✅ now matches backend
    memorandum_no: string | null; // ✅ now matches backend
};

type InventoryListPageProps = {
    chartData: ChartData[];
    assets: Asset[];
    departments: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    suppliers: string[];
    assetTypes: { value: string; label: string }[];
    buildings: { id: number; name: string }[];
    brands: string[];
    reportType: string;
};

export interface PickerInputProps {
    type: string;
    value: string;
    onChange: (value: string) => void;
    className?: string; // ✅ add this line
}

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'Asset Inventory List Report', href: '/reports/inventory-list' },
];

// ✅ Vibrant & bright HSL colors
const BASE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC'];

function generateColor(index: number, total: number): string {
    if (index < BASE_COLORS.length) return BASE_COLORS[index];
    const step = 360 / total;
    const hue = (210 + index * step) % 360;
    return `hsl(${hue}, 80%, 60%)`;
}

// ✅ Custom tooltip with percentage
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const entry = payload[0].payload as ChartData & { total?: number };
        const total = entry.total ?? 0;
        const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
        return (
            <div className="rounded-md border bg-white p-2 text-sm shadow-md">
                <p className="font-medium">{entry.label}</p>
                <p>
                    {entry.value} Assets ({percent}%)
                </p>
            </div>
        );
    }
    return null;
};

// ✅ Keep values machine-friendly
const reportTypes = [
    { value: 'inventory_list', label: 'Asset Inventory List' },
    { value: 'new_purchases', label: 'Summary of Newly Purchased Equipment' },
];

export default function InventoryListReport() {
    const {
        chartData,
        departments,
        categories,
        suppliers,
        assetTypes,
        buildings,
        brands,
        assets: initialAssets,
    } = usePage<InventoryListPageProps>().props;

    // ✅ Toggle between chart and table
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

    // ✅ Local state for assets that updates only on Apply
    const [displayedAssets, setDisplayedAssets] = useState(initialAssets);

    // ✅ Default filters
    const defaultFilters = {
        from: null as string | null,
        to: null as string | null,
        department_id: null as number | null,
        category_id: null as number | null,
        asset_type: null as string | null,
        building_id: null as number | null,
        supplier: null as string | null,
        condition: null as string | null,
        brand: null as string | null,
        report_type: null as string | null, // ✅ default safe value
    };

    // ✅ Filters state (live editing)
    const [filters, setFilters] = useState(defaultFilters);

    // ✅ Applied filters (only update on "Apply Filters")
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

    function updateFilter<K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }

    // ✅ Total assets (no grouping)
    const totalAssets = chartData.reduce((acc, curr) => acc + curr.value, 0);

    // ✅ Keep backend order as-is
    const unsortedChartData = chartData.map((d) => ({ ...d, total: totalAssets }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Asset Inventory List Report" />

            <div className="space-y-6 px-6 py-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold">Asset Inventory List Report</h1>
                    <p className="text-sm text-muted-foreground">Analysis of Assets by Category.</p>
                </div>

                {/* ✅ Improved & Polished Filter Bar */}
                <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-black">Report Type</label>
                        <Select
                            className="w-full"
                            options={reportTypes}
                            value={
                                filters.report_type ? reportTypes.find((r) => r.value === filters.report_type) : null // ✅ empty state = placeholder
                            }
                            onChange={(opt) => updateFilter('report_type', opt?.value ?? null)} // ✅ no default
                            placeholder="Select report type..." // ✅ show placeholder when null
                        />
                    </div>

                    {/* --- Filters Grid --- */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {/* Date Range */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">From</label>
                            <PickerInput
                                type="date"
                                value={filters.from ?? ''}
                                onChange={(v) => updateFilter('from', v && v.trim() !== '' ? v : null)}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">To</label>
                            <PickerInput type="date" value={filters.to ?? ''} onChange={(v) => updateFilter('to', v && v.trim() !== '' ? v : null)} />
                        </div>

                        {/* Building */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">Building</label>
                            <Select
                                className="w-full"
                                value={
                                    filters.building_id
                                        ? {
                                              value: filters.building_id,
                                              label: buildings.find((b) => b.id === filters.building_id)?.name || '',
                                          }
                                        : null
                                }
                                options={buildings.map((b) => ({ value: b.id, label: b.name }))}
                                onChange={(opt) => updateFilter('building_id', opt?.value ?? null)}
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="text-black-700 mb-1 block text-sm font-medium">Unit / Department</label>
                            <Select
                                className="w-full"
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

                        {/* Brand */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">Brand</label>
                            <Select
                                className="w-full"
                                value={filters.brand ? { value: filters.brand, label: filters.brand } : null}
                                options={brands.map((b) => ({ value: b, label: b }))}
                                onChange={(opt) => updateFilter('brand', opt?.value ?? null)}
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">Category</label>
                            <Select
                                className="w-full"
                                value={
                                    filters.category_id
                                        ? {
                                              value: filters.category_id,
                                              label: categories.find((c) => c.id === filters.category_id)?.name || '',
                                          }
                                        : null
                                }
                                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                                onChange={(opt) => updateFilter('category_id', opt?.value ?? null)}
                            />
                        </div>

                        {/* Asset Type */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Asset Type</label>
                            <Select
                                className="w-full"
                                value={filters.asset_type ? (assetTypes.find((a) => a.value === filters.asset_type) ?? null) : null}
                                options={assetTypes}
                                onChange={(opt) => updateFilter('asset_type', opt?.value ?? null)}
                            />
                        </div>

                        {/* Supplier */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-black">Supplier</label>
                            <Select
                                className="w-full"
                                value={filters.supplier ? { value: filters.supplier, label: filters.supplier } : null}
                                options={suppliers.map((s) => ({ value: s, label: s }))}
                                onChange={(opt) => updateFilter('supplier', opt?.value ?? null)}
                            />
                        </div>
                    </div>

                    {/* --- Action Buttons --- */}
                    <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                        {/* Clear Filters */}
                        <button
                            onClick={() => {
                                const reset = { ...defaultFilters, report_type: null }; // ✅ force report_type null
                                setFilters(reset); // reset live filters
                                setAppliedFilters(reset); // reset applied filters

                                router.get(route('reports.inventory-list'), reset, {
                                    preserveState: true,
                                    preserveScroll: true, // ✅ keep current scroll position
                                    onSuccess: (page) => {
                                        // ✅ reset table to all assets
                                        setDisplayedAssets(page.props.assets as Asset[]);
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
                                setAppliedFilters(filters); // ✅ lock filters
                                router.get(route('reports.inventory-list'), filters, {
                                    preserveState: true,
                                    preserveScroll: true, // ✅ keep current scroll position
                                    onSuccess: (page) => {
                                        // ✅ update displayedAssets only when request completes
                                        setDisplayedAssets(page.props.assets as Asset[]);
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
                                {/* Export to PDF */}
                                <button
                                    onClick={() => {
                                        const url = route('reports.inventory-list.export.pdf', appliedFilters);
                                        window.open(url, '_blank'); // 👈 open in new tab
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                    <FileText className="h-4 w-4 text-red-600" />
                                    PDF
                                </button>

                                {/* Export to Excel */}
                                <button
                                    onClick={() => {
                                        const url = route('reports.inventory-list.export.excel', appliedFilters);
                                        window.open(url, '_blank'); // 👈 open in new tab instead of forcing download
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

                {/* Chart + Table Card */}
                <Card className="rounded-2xl shadow-md">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>
                            {appliedFilters.report_type === 'new_purchases' ? 'Summary of Newly Purchased Equipment' : 'Assets Inventory List'}
                        </CardTitle>
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
                    <CardContent className="h-96">
                        {viewMode === 'chart' ? (
                            totalAssets === 0 ? (
                                <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                                    <p className="text-lg font-semibold">No Data Available</p>
                                    <p className="text-sm">Try adjusting your filters to see results.</p>
                                </div>
                            ) : (
                                <>
                                    {/* ✅ Chart View */}
                                    <ChartContainer
                                        config={{ assets: { label: 'Assets' }, category: { label: 'Category' } }}
                                        className="mx-auto aspect-square max-h-[350px]"
                                    >
                                        <PieChart>
                                            <ChartTooltip cursor={false} content={<CustomTooltip active={false} payload={[]} />} />
                                            <Pie
                                                data={unsortedChartData}
                                                dataKey="value"
                                                nameKey="label"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={120}
                                                label={false}
                                                stroke="none"
                                            >
                                                {unsortedChartData.map((_, index) => (
                                                    <Cell key={index} fill={generateColor(index, unsortedChartData.length)} />
                                                ))}
                                                <Label
                                                    content={({ viewBox }) => {
                                                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                            return (
                                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
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

                                    {/* ✅ Manual Legend */}
                                    <div className="mt--5 flex flex-wrap justify-center gap-4 text-sm">
                                        {unsortedChartData.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span
                                                    className="h-3 w-3 rounded-sm"
                                                    style={{ backgroundColor: generateColor(index, unsortedChartData.length) }}
                                                />
                                                <span className="text-gray-700">{entry.label}</span>
                                                <span className="font-medium text-gray-900">{entry.value.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )
                        ) : (
                            // ✅ Table View (switch based on report type)
                            <>
                                {displayedAssets.length === 0 ? (
                                    <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                                        <p className="text-lg font-semibold">No Data Available</p>
                                        <p className="text-sm">Try adjusting your filters to see results.</p>
                                    </div>
                                ) : appliedFilters.report_type === 'new_purchases' ? (
                                    <NewPurchasedTable key="new" assets={displayedAssets} />
                                ) : (
                                    <DetailedAssetsTable key="detailed" assets={displayedAssets} />
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
