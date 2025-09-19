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
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
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
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('90d');

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
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - days);

  // Create map of your real data
  const dataMap = new Map<string, ChartData>();
  chartData.forEach((item) => {
    dataMap.set(item.date, {
      date: item.date,
      inventoried: item.inventoried ?? 0,
      scheduled: item.scheduled ?? 0,
      not_inventoried: item.not_inventoried ?? 0,
    });
  });

  // Fill missing days with zeros
  const result: ChartData[] = [];
  for (
    let d = new Date(startDate);
    d <= referenceDate;
    d.setDate(d.getDate() + 1)
  ) {
    const key = d.toISOString().split("T")[0]; // yyyy-mm-dd
    result.push(
      dataMap.get(key) ?? {
        date: key,
        inventoried: 0,
        scheduled: 0,
        not_inventoried: 0,
      }
    );
  }

  return result;
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
                  setTimeRange((v as '7d' | '30d' | '90d') ?? '90d')
                }
              >
                <ShadSelectTrigger className="w-[160px]">
                  <ShadSelectValue placeholder="Last 90 days" />
                </ShadSelectTrigger>
                <ShadSelectContent>
                  <ShadSelectItem value="90d">Last 90 days</ShadSelectItem>
                  <ShadSelectItem value="30d">Last 30 days</ShadSelectItem>
                  <ShadSelectItem value="7d">Last 7 days</ShadSelectItem>
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
                      label: 'Not Inventoried',
                      color: 'var(--chart-1)',
                    },
                    scheduled: {
                      label: 'Scheduled',
                      color: 'var(--chart-2)',
                    },
                    inventoried: {
                      label: 'Inventoried',
                      color: 'var(--chart-3)',
                    },
                  }}
                  className="mx-auto h-[350px] w-full"
                >
                  <AreaChart data={filteredData}>
                    <defs>
  <linearGradient id="fillInventoried" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.8} />
    <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.1} />
  </linearGradient>
  <linearGradient id="fillScheduled" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
  </linearGradient>
  <linearGradient id="fillNotInventoried" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
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
                        const date = new Date(value as string);
                        return date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        });
                      }}
                    />

                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          labelFormatter={(value) =>
                            new Date(value as string).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          }
                        />
                      }
                    />

                    <Area
  dataKey="inventoried"
  type="natural"
  fill="url(#fillInventoried)"
  stroke="var(--chart-3)"   // instead of var(--color-inventoried)
  stackId="a"
/>
<Area
  dataKey="scheduled"
  type="natural"
  fill="url(#fillScheduled)"
  stroke="var(--chart-2)"
  stackId="a"
/>
<Area
  dataKey="not_inventoried"
  type="natural"
  fill="url(#fillNotInventoried)"
  stroke="var(--chart-1)"
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
