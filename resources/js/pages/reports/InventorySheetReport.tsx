import React, { useState, useEffect } from 'react';
import { PickerInput } from '@/components/picker-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { FileDown, FileSpreadsheet, FileText, Filter, RotateCcw } from 'lucide-react';
import Select from 'react-select';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from '@/components/ui/select';
import InventorySheetTable from './InventorySheetTable';

// ---------------------- Types ----------------------
type ChartData = {
  date: string;             // e.g. "2024-06-01"
  inventoried: number;      // count of inventoried assets
  scheduled: number;        // count of scheduled assets
  not_inventoried: number;  // count of not inventoried assets
};

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
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
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
    meta: PaginationMeta;
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

// ---------------------- UI Data ----------------------
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Reports', href: '/reports' },
  { title: 'Inventory Sheet Report', href: '/reports/inventory-sheet' },
];

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

// --- Helpers for semester/annual labels ---
function getWeekKey(d: Date): string {
  const year = d.getFullYear();
  const start = new Date(year, 0, 1);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86400000) + 1;
  const week = Math.ceil(dayOfYear / 7);
  return `${year}-W${week}`;
}

function formatWeekRangeFromKey(key: string): string {
  // key like "2025-W3" -> "Week 3 (Jan 15 – Jan 21, 2025)"
  const [yearStr, wStr] = key.split('-W');
  const year = Number(yearStr);
  const week = Number(wStr);

  const start = new Date(year, 0, 1);
  start.setDate(1 + (week - 1) * 7);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startLbl = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endLbl = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `Week ${week} (${startLbl} – ${endLbl})`;
}


// ---------------------- Component ----------------------
export default function InventorySheetReport() {
  const { chartData, assets, buildings, departments, rooms, subAreas } =
    usePage<InventorySheetPageProps>().props;

  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const [page, setPage] = useState(assets?.meta?.current_page ?? 1);
  const [total, setTotal] = useState(assets?.meta?.total ?? 0);
  const [pageSize, setPageSize] = useState(assets?.meta?.per_page ?? 25);
  const [displayedAssets, setDisplayedAssets] = useState<AssetRow[]>(assets.data);

  // Time-range for chart (front-end filter)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '18w' | '1y'>('90d');

  // Filters (server-side)
  const defaultFilters = {
    from: null as string | null,
    to: null as string | null,
    building_id: null as number | null,
    department_id: null as number | null,
    room_id: null as number | null,
    sub_area_id: null as number | null,
    inventory_status: null as string | null,
  };
  const [filters, setFilters] = useState(defaultFilters);

  function updateFilter<K extends keyof typeof filters>(
    key: K,
    value: (typeof filters)[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const filteredRooms = filters.building_id
    ? rooms.filter((r) => r.building_id === filters.building_id)
    : rooms;

  const filteredSubAreas = filters.room_id
    ? subAreas.filter((s) => s.building_room_id === filters.room_id)
    : subAreas;

  function buildQuery(filtersObj: typeof defaultFilters): string {
    const params: Record<string, string> = {};
    Object.entries(filtersObj).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params[key] = String(value);
      }
    });
    return new URLSearchParams(params).toString();
  }

  // Re-fetch paginated table data when page changes (keeps existing filters)
  useEffect(() => {
    router.get(
      route('reports.inventory-sheet'),
      { ...filters, page },
      {
        preserveState: true,
        onSuccess: (pageData) => {
          const paginator = pageData.props.assets as Paginator<AssetRow>;
          setDisplayedAssets(paginator.data);
          setPage(paginator.meta.current_page ?? 1);
          setTotal(paginator.meta.total ?? 0);
          setPageSize(paginator.meta.per_page ?? 25);
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ---------- Chart: time-range filtered data ----------
const filteredData: ChartData[] = React.useMemo(() => {
  if (!chartData || chartData.length === 0) return [];

  const referenceDate = new Date();

  let days = 0;
  if (timeRange === '7d') days = 7;
  else if (timeRange === '30d') days = 30;
  else if (timeRange === '90d') days = 90;
  else if (timeRange === '18w') days = 18 * 7; // 126
  else if (timeRange === '1y') days = 365;

  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - days);

  // keep only what we need, and sort ascending for stable grouping
  const inRange = chartData
    .filter((item) => {
      const d = new Date(item.date);
      return d >= startDate && d <= referenceDate;
    })
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));

  // ----- Semester: group by week -----
  if (timeRange === '18w') {
    const grouped: Record<string, ChartData> = {};
    for (const item of inRange) {
      const key = getWeekKey(new Date(item.date)); // "YYYY-WN"
      if (!grouped[key]) {
        grouped[key] = { date: key, inventoried: 0, scheduled: 0, not_inventoried: 0 };
      }
      grouped[key].inventoried += item.inventoried ?? 0;
      grouped[key].scheduled += item.scheduled ?? 0;
      grouped[key].not_inventoried += item.not_inventoried ?? 0;
    }
    return Object.values(grouped);
  }

  // ----- Annual: group by month -----
  if (timeRange === '1y') {
    const grouped: Record<string, ChartData> = {};
    for (const item of inRange) {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // "YYYY-MM"
      if (!grouped[key]) {
        grouped[key] = { date: key, inventoried: 0, scheduled: 0, not_inventoried: 0 };
      }
      grouped[key].inventoried += item.inventoried ?? 0;
      grouped[key].scheduled += item.scheduled ?? 0;
      grouped[key].not_inventoried += item.not_inventoried ?? 0;
    }
    return Object.values(grouped);
  }

  // ----- Daily (7d/30d/90d): keep your original fill logic -----
  const dataMap = new Map(
    chartData.map((item) => [
      new Date(item.date).toISOString().split('T')[0],
      {
        date: new Date(item.date).toISOString().split('T')[0],
        inventoried: item.inventoried ?? 0,
        scheduled: item.scheduled ?? 0,
        not_inventoried: item.not_inventoried ?? 0,
      },
    ])
  );

  const filled: ChartData[] = [];
  const start = new Date(referenceDate);
  start.setDate(referenceDate.getDate() - days);

  for (let d = new Date(start); d <= referenceDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0];
    filled.push(
      dataMap.get(key) || { date: key, inventoried: 0, scheduled: 0, not_inventoried: 0 }
    );
  }

  return filled;
}, [chartData, timeRange]);


  // Sum to detect "all zero" cases gracefully
  const chartHasAnyValues =
    filteredData.some(
      (d) =>
        (d.inventoried || 0) +
          (d.scheduled || 0) +
          (d.not_inventoried || 0) >
        0
    );

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
                onChange={(v) =>
                  updateFilter('from', v && v.trim() !== '' ? v : null)
                }
              />
            </div>

            {/* To */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                To
              </label>
              <PickerInput
                type="date"
                value={filters.to ?? ''}
                onChange={(v) =>
                  updateFilter('to', v && v.trim() !== '' ? v : null)
                }
              />
            </div>

            {/* Inventory Status */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Inventory Status
              </label>
              <Select
                className="w-full"
                value={
                  filters.inventory_status
                    ? {
                        value: filters.inventory_status,
                        label: formatStatusLabel(filters.inventory_status),
                      }
                    : null
                }
                options={[
                  { value: 'not_inventoried', label: 'Not Inventoried' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'inventoried', label: 'Inventoried' },
                ]}
                onChange={(opt) =>
                  updateFilter('inventory_status', opt?.value ?? null)
                }
                isClearable
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
                          departments.find(
                            (d) => d.id === filters.department_id
                          )?.name || '',
                      }
                    : null
                }
                options={departments.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
                onChange={(opt) =>
                  updateFilter('department_id', opt?.value ?? null)
                }
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
                          buildings.find((b) => b.id === filters.building_id)
                            ?.name || '',
                      }
                    : null
                }
                options={buildings.map((b) => ({
                  value: b.id,
                  label: b.name,
                }))}
                onChange={(opt) => {
                  updateFilter('building_id', opt?.value ?? null);
                  updateFilter('room_id', null);
                  updateFilter('sub_area_id', null);
                }}
              />
            </div>

            {/* Room */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Room
              </label>
              <Select
                className="w-full"
                value={
                  filters.room_id
                    ? {
                        value: filters.room_id,
                        label:
                          rooms.find((r) => r.id === filters.room_id)?.room ||
                          '',
                      }
                    : null
                }
                options={filteredRooms.map((r) => ({
                  value: r.id,
                  label: r.room,
                }))}
                onChange={(opt) => {
                  updateFilter('room_id', opt?.value ?? null);
                  updateFilter('sub_area_id', null);
                }}
                isDisabled={!filters.building_id}
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
                          subAreas.find((s) => s.id === filters.sub_area_id)
                            ?.name || '',
                      }
                    : null
                }
                options={filteredSubAreas.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                onChange={(opt) =>
                  updateFilter('sub_area_id', opt?.value ?? null)
                }
                isDisabled={!filters.room_id}
              />
            </div>
          </div>

          {/* --- Action Buttons --- */}
          <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
            {/* Clear Filters */}
            <button
              onClick={() => {
                const resetFilters = {
                  ...defaultFilters,
                  date_basis: 'inventoried' as
                    | 'inventoried'
                    | 'purchased'
                    | 'both',
                };
                setFilters(resetFilters);
                setPage(1);

                router.get(
                  route('reports.inventory-sheet'),
                  { ...resetFilters, page: 1 },
                  {
                    preserveState: true,
                    onSuccess: (pageData) => {
                      const paginator =
                        pageData.props.assets as InventorySheetPageProps['assets'];
                      setDisplayedAssets(paginator.data);
                      setPage(paginator.meta.current_page ?? 1);
                      setTotal(paginator.meta.total ?? 0);
                      setPageSize(paginator.meta.per_page ?? 25);
                    },
                  }
                );
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
                router.get(
                  route('reports.inventory-sheet'),
                  { ...filters, page: 1 },
                  {
                    preserveState: true,
                    onSuccess: (pageData) => {
                      const paginator =
                        pageData.props.assets as InventorySheetPageProps['assets'];
                      setDisplayedAssets(paginator.data);
                      setPage(paginator.meta.current_page ?? 1);
                      setTotal(paginator.meta.total ?? 0);
                      setPageSize(paginator.meta.per_page ?? 25);
                    },
                  }
                );
              }}
              className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              Apply Filters
            </button>

            {/* Export */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white cursor-pointer"
                  style={{ backgroundColor: '#155dfc' }}
                >
                  <FileDown className="h-4 w-4" />
                  Export Summary
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
                    window.open(
                      route('reports.inventory-sheet.export.excel') +
                        '?' +
                        query,
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
                      route('reports.inventory-sheet.export.pdf') +
                        '?' +
                        query,
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
            <div className="mt-2 flex gap-2 sm:mt-0 items-center">
              {/* Time Range Dropdown (client-side) */}
              <ShadSelect
                value={timeRange}
                onValueChange={(v) =>
                    setTimeRange((v as '7d' | '30d' | '90d' | '18w' | '1y') ?? '90d')
                }
                >
                <ShadSelectTrigger className="min-w-[220px]">
                    <ShadSelectValue placeholder="Select range" />
                </ShadSelectTrigger>
                <ShadSelectContent>
                    <ShadSelectItem value="90d">Last 90 days</ShadSelectItem>
                    <ShadSelectItem value="30d">Last 30 days</ShadSelectItem>
                    <ShadSelectItem value="7d">Last 7 days</ShadSelectItem>
                    <ShadSelectItem value="18w">Last Semester (18 weeks)</ShadSelectItem>
                    <ShadSelectItem value="1y">Last Year</ShadSelectItem>
                </ShadSelectContent>
                </ShadSelect>


              {/* View toggle */}
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
              filteredData.length === 0 || !chartHasAnyValues ? (
                <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                  <p className="text-lg font-semibold">No Data Available</p>
                  <p className="text-sm">Try adjusting your filters to see results.</p>
                </div>
              ) : (
                <ChartContainer
                    config={{
                        not_inventoried: {
                        label: "Not Inventoried",
                        color: "#f59e0b", // orange
                        },
                        inventoried: {
                        label: "Inventoried",
                        color: "#00A86B", // green
                        },
                        scheduled: {
                        label: "Scheduled",
                        color: "#3b82f6", // blue
                        },
                    }}
                  className="mx-auto h-[350px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillNotInventoried" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillInventoried" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00A86B" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#00A86B" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillScheduled" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={32}
                        tickFormatter={(value) => {
                        const v = String(value);

                        if (timeRange === '18w') {
                            // "YYYY-WN" -> "Week N"
                            const wk = v.split('-W')[1];
                            return wk ? `Week ${wk}` : v;
                        }

                        if (timeRange === '1y') {
                            // "YYYY-MM" -> "Jan", "Feb", ...
                            const [y, m] = v.split('-');
                            return new Date(Number(y), Number(m) - 1).toLocaleString('en-US', { month: 'short' });
                        }

                        // daily
                        const date = new Date(v);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                    />

                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        allowDecimals={false}   // only integer ticks
                        label={{
                            value: "Total Assets",
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: "middle", fontSize: 12, fill: "#6b7280" },
                        }}
                    />

                    {/* Tooltip with colored indicators */}
                    <ChartTooltip
                        cursor={false}
                        content={
                            <ChartTooltipContent
                                indicator="dot"
                                labelFormatter={(value) => {
  const v = String(value);

  if (timeRange === '18w') {
    // Week label with date range
    return formatWeekRangeFromKey(v);
  }

  if (timeRange === '1y') {
    // "YYYY-MM" -> "September 2025"
    const [y, m] = v.split('-');
    const monthName = new Date(Number(y), Number(m) - 1).toLocaleString('en-US', { month: 'long' });
    return `${monthName} ${y}`;
  }

  // daily -> "September 18, 2025"
  const d = new Date(v);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}}

                            />
                        }
                    />

                    {/* Stacking order: bottom → top */}
                    <Area
                        dataKey="not_inventoried"
                        type="monotone"
                        fill="url(#fillNotInventoried)"
                        stroke="#f59e0b"
                        stackId="a"
                    />
                    <Area
                        dataKey="inventoried"
                        type="monotone"
                        fill="url(#fillInventoried)"
                        stroke="#00A86B"
                        stackId="a"
                    />
                    <Area
                        dataKey="scheduled"
                        type="monotone"
                        fill="url(#fillScheduled)"
                        stroke="#3b82f6"
                        stackId="a"
                    />

                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
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
