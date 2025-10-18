import React, { useState, useEffect } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { PickerInput } from "@/components/picker-input";
import Select from "react-select";
import { Filter, RotateCcw, FileDown, FileSpreadsheet, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import TurnoverDisposalTable from "./TurnoverDisposalTable";
import DonationSummaryTable from "./DonationSummaryTable";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";

export type RecordRow = {
    // id: number;
    turnover_disposal_id: number;
    type: string;
    issuing_office: string;
    receiving_office?: string | null;
    asset_id: number | null;
    serial_no: string;
    asset_name: string;
    category: string;
    td_status: string;
    asset_status: string;      // per-asset status
    document_date: string;
    remarks?: string | null;

    turnover_category?: string | null;
    is_donation?: boolean | number | null;
}

type PaginationMeta = {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

type Paginator<T> = {
    data: T[];
    meta: PaginationMeta;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

type ChartRow = {
    month: string
    turnover: number
    disposal: number
}

type PageProps = {
    records: Paginator<RecordRow>;
    departments: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    filters: {
        from?: string | null;
        to?: string | null;
        status?: string | null;
        issuing_office_id?: number | null;
        receiving_office_id?: number | null;
        category_id?: number | null;
        type?: string | null;
        turnover_category?: string | null;
        is_donation?: string | null;   
    };
    chartData: ChartRow[];

    donationSummary: {
        record_id: number;
        document_date: string;
        description: string | null;
        issuing_office: string | null;
        quantity: number;
        turnover_category: string | null;
        remarks: string | null;
        total_cost: number;

        receiving_office: string | null;
        external_recipient: string | null;
    }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Reports", href: "/reports" },
    { title: "Turnover/Disposal Report", href: "/reports/turnover-disposal" },
]

export default function TurnoverDisposalReport() {
    const firstLoadRef = React.useRef(true);
    
    const {
        records,
        departments,
        categories,
        filters: initialFilters,
        chartData: initialChartData,
        donationSummary,
    } = usePage<PageProps>().props;
    const [chartData, setChartData] = useState(initialChartData);

    const chartConfig = {
        turnover: { label: "Turnover", color: "var(--chart-1)" },
        disposal: { label: "Disposal", color: "var(--chart-2)" },
    } satisfies ChartConfig;

    const [page, setPage] = useState(records.meta.current_page ?? 1);
    const [total, setTotal] = useState(records.meta.total ?? 0);
    const [pageSize, setPageSize] = useState(records.meta.per_page ?? 10);
    const [displayed, setDisplayed] = useState<RecordRow[]>(records.data);

    const defaultFilters = {
        from: null as string | null,
        to: null as string | null,
        status: null as string | null,
        issuing_office_id: null as number | null,
        receiving_office_id: null as number | null,
        category_id: null as number | null,
        type: null as string | null,
        turnover_category: null as string | null,
    };
    const [filters, setFilters] = useState({ ...defaultFilters, ...initialFilters });
    const [appliedFilters, setAppliedFilters] = useState({ ...defaultFilters, ...initialFilters });

    // const [viewMode, setViewMode] = useState<'chart' | 'table'>('table');
    const [viewMode, setViewMode] = useState<'chart' | 'table' | 'donations'>('table');

    function updateFilter<K extends keyof typeof filters>(
        key: K,
        value: (typeof filters)[K]
    ) {
        setFilters((prev) => ({ ...prev, [key]: value }))
    };

    function buildQuery(filtersObj: typeof defaultFilters): string {
        const params: Record<string, string> = {}
        Object.entries(filtersObj).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                params[key] = String(value);
            }
        })
        return new URLSearchParams(params).toString();
    };

    function cleanFilters(obj: typeof filters) {
        const result: Record<string, string | number> = {}
        Object.entries(obj).forEach(([k, v]) => {
            if (v !== null && v !== undefined && v !== '') result[k] = String(v);
        })
        return result;
    };

    // Refetch when page changes
    useEffect(() => {
        if (firstLoadRef.current) {
            firstLoadRef.current = false;
            return;
        }

        router.get(
            route('reports.turnover-disposal'),
            { ...cleanFilters(appliedFilters), page },
            {
                preserveState: true,
                replace: true,
                onSuccess: (pageData) => {
                    const paginator = pageData.props.records as Paginator<RecordRow>
                    setDisplayed(paginator.data);
                    setTotal(paginator.meta.total ?? 0);
                    setPageSize(paginator.meta.per_page ?? 10);

                    setChartData(pageData.props.chartData as ChartRow[]);
                },
            }
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // Compute trend vs last month
    const currentMonthIndex = new Date().getMonth(); // 0 = January
    const thisMonth = chartData[currentMonthIndex];
    const lastMonth = chartData[currentMonthIndex - 1];

    let trendLabel: string | null = null;
    let TrendIcon: React.ElementType = Minus;
    let trendColor = "text-muted-foreground";

    if (thisMonth && lastMonth) {
        const thisTotal = (thisMonth.turnover ?? 0) + (thisMonth.disposal ?? 0);
        const lastTotal = (lastMonth.turnover ?? 0) + (lastMonth.disposal ?? 0);

        if (lastTotal > 0) {
            const change = ((thisTotal - lastTotal) / lastTotal) * 100;

            if (change > 0) {
            trendLabel = `Completed turnovers/disposals increased by ${change.toFixed(1)}% this month`;
            TrendIcon = TrendingUp;
            trendColor = "text-green-600";
            } else if (change < 0) {
            trendLabel = `Completed turnovers/disposals decreased by ${Math.abs(change).toFixed(1)}% this month`;
            TrendIcon = TrendingDown;
            trendColor = "text-red-600";
            } else {
            trendLabel = "No change in completed turnovers/disposals this month";
            TrendIcon = Minus;
            }
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Turnover/Disposal Report" />

            <div className="space-y-6 px-6 py-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold">Turnover/Disposal Report</h1>
                    <p className="text-sm text-muted-foreground">
                        View detailed records of turnovers and disposals.
                    </p>
                </div>

                {/* Filters */}
                <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        
                        {/* From */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                From
                            </label>
                            <PickerInput
                                type="date"
                                value={filters.from ?? ""}
                                onChange={(v) =>
                                    updateFilter("from", v && v.trim() !== "" ? v : null)
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
                                value={filters.to ?? ""}
                                onChange={(v) =>
                                    updateFilter("to", v && v.trim() !== "" ? v : null)
                                }
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Type
                            </label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select type"
                                value={
                                    filters.type
                                        ? { value: filters.type, label: filters.type.charAt(0).toUpperCase() + filters.type.slice(1) }
                                        : null
                                }
                                options={[
                                    { value: "turnover", label: "Turnover" },
                                    { value: "disposal", label: "Disposal" },
                                ]}
                                onChange={(opt) => updateFilter("type", opt?.value ?? null)}
                            />
                        </div>
                        
                        {/* Status */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select an asset type"
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
                                        { value: "pending_review", label: "Pending Review" },
                                        { value: "approved", label: "Approved" },
                                        { value: "rejected", label: "Rejected" },
                                        { value: "cancelled", label: "Cancelled" },
                                        { value: "completed", label: "Completed" },
                                    ]
                                }
                                onChange={(opt) => updateFilter("status", opt?.value ?? null)}
                            />
                        </div>

                        {/* Issuing Office */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Issuing Office
                            </label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select an issuing unit/office"
                                value={
                                filters.issuing_office_id
                                    ? {
                                        value: filters.issuing_office_id,
                                        label: departments.find((d) => d.id === filters.issuing_office_id)?.name || "",
                                    }
                                    : null
                                }
                                options={departments.map((d) => ({
                                    value: d.id,
                                    label: d.name,
                                }))}
                                onChange={(opt) =>
                                    updateFilter("issuing_office_id", opt?.value ?? null)
                                }
                            />
                        </div>

                        {/* Receiving Office */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Receiving Office
                            </label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select a receiving unit/office"
                                value={
                                filters.receiving_office_id
                                    ? {
                                        value: filters.receiving_office_id,
                                        label: departments.find((d) => d.id === filters.receiving_office_id)?.name || "",
                                    }
                                    : null
                                }
                                options={departments.map((d) => ({
                                    value: d.id,
                                    label: d.name,
                                }))}
                                onChange={(opt) =>
                                    updateFilter("receiving_office_id", opt?.value ?? null)
                                }
                            />
                        </div>

                        {/* Asset Category */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Asset Category
                            </label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select a category"
                                value={
                                filters.category_id
                                    ? {
                                        value: filters.category_id,
                                        label: categories.find((c: { id: number; name: string }) => c.id === filters.category_id)?.name || "",
                                    }
                                    : null
                                }
                                options={categories.map((c: { id: number; name: string }) => ({
                                value: c.id,
                                label: c.name,
                                }))}
                                onChange={(opt) => updateFilter("category_id", opt?.value ?? null)}
                            />
                        </div>

                        
                        {/* Turnover Category */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Turnover Category
                            </label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select a turnover category"
                                value={
                                filters.turnover_category
                                    ? {
                                        value: filters.turnover_category,
                                        label: filters.turnover_category
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, (c) => c.toUpperCase()),
                                    }
                                    : null
                                }
                                options={[
                                { value: "sharps", label: "Sharps" },
                                { value: "breakages", label: "Breakages" },
                                { value: "chemical", label: "Chemical" },
                                { value: "hazardous", label: "Hazardous" },
                                { value: "non_hazardous", label: "Non Hazardous" },
                                ]}
                                onChange={(opt) => updateFilter("turnover_category", opt?.value ?? null)}
                            />
                        </div>

                        {/* For Donation */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                For Donation
                            </label>
                            <Select
                                className="w-full"
                                isClearable
                                placeholder="Select donation status"
                                value={
                                filters.is_donation !== null && filters.is_donation !== undefined
                                    ? {
                                        value: filters.is_donation,
                                        label: filters.is_donation === "1" ? "Yes" : "No",
                                    }
                                    : null
                                }
                                options={[
                                { value: "1", label: "Yes" },
                                { value: "0", label: "No" },
                                ]}
                                onChange={(opt) => updateFilter("is_donation", opt?.value ?? null)}
                            />
                        </div>
                        
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                        <button
                            onClick={() => {
                                setFilters(defaultFilters)
                                setAppliedFilters(defaultFilters)
                                setPage(1)
                                router.get(
                                    route('reports.turnover-disposal'),
                                    {}, // no filters
                                    {
                                        preserveState: true,
                                        replace: true,
                                        onSuccess: (pageData) => {
                                            const paginator = pageData.props.records as Paginator<RecordRow>
                                            setDisplayed(paginator.data)
                                            setTotal(paginator.meta.total ?? 0)
                                            setPageSize(paginator.meta.per_page ?? 10)
                                        },
                                    }
                                )
                            }}
                            className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Clear Filters
                        </button>


                        {/* Apply */}
                        <button
                            onClick={() => {
                                setPage(1)
                                setAppliedFilters(filters)
                                router.get(
                                    route('reports.turnover-disposal'),
                                    { ...cleanFilters(filters), page: 1 },
                                    {
                                        preserveState: true,
                                        replace: true,
                                        onSuccess: (pageData) => {
                                            const paginator = pageData.props.records as Paginator<RecordRow>
                                            setDisplayed(paginator.data)
                                            setTotal(paginator.meta.total ?? 0)
                                            setPageSize(paginator.meta.per_page ?? 10)
                                        },
                                    }
                                )
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
                                {/* <button
                                    onClick={() => {
                                        const query = buildQuery(filters)
                                        window.open(
                                        route("reports.turnover-disposal.export.excel") +
                                            "?" +
                                            query,
                                        "_blank"
                                        )
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                    Excel
                                </button> */}
                                <button
                                    onClick={() => {
                                        const query = buildQuery(filters);
                                        const excelRoute =
                                        viewMode === "donations"
                                            ? route("reports.turnover-disposal.export.donations.excel")
                                            : route("reports.turnover-disposal.export.excel");

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
                                            viewMode === "donations"
                                                ? route("reports.turnover-disposal.export.donations.pdf")
                                                : route("reports.turnover-disposal.export.pdf");

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

                {/* Chart + Table Card */}
                <Card className="rounded-2xl shadow-md">                
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Turnover / Disposal Records</CardTitle>
                        <div className="mt-2 flex gap-2 sm:mt-0">
                            {/* <div className="inline-flex rounded-md shadow-sm">
                                <button
                                    onClick={() => {
                                        setViewMode("chart");
                                        // refreshData(page); // reload data + chart
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
                                        setViewMode("table");
                                        // refreshData(page);
                                    }}
                                    className={`border-t border-b px-4 py-2 text-sm font-medium cursor-pointer ${
                                        viewMode === 'table'
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    } rounded-r-md`}
                                >
                                    Table
                                </button>
                            </div> */}
                            <div className="inline-flex rounded-md shadow-sm">
                                <button
                                    onClick={() => setViewMode("chart")}
                                    className={`border px-4 py-2 text-sm font-medium cursor-pointer ${
                                    viewMode === 'chart'
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    } rounded-l-md`}
                                >
                                    Chart
                                </button>

                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`border-t border-b px-4 py-2 text-sm font-medium cursor-pointer ${
                                    viewMode === 'table'
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    General
                                </button>

                                <button
                                    onClick={() => setViewMode("donations")}
                                    className={`border px-4 py-2 text-sm font-medium cursor-pointer ${
                                    viewMode === 'donations'
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    } rounded-r-md`}
                                >
                                    Donations
                                </button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="h-96">
                        {viewMode === 'chart' ? (
                            <ChartContainer
                                config={chartConfig}
                                className="mx-auto aspect-square max-h-[380px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart
                                        data={chartData}
                                        // margin={{ top: -20, right: 40, bottom: -20, left: 40 }}
                                    >
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                        <PolarAngleAxis dataKey="month" />
                                        <PolarGrid />
                                        {/* <PolarRadiusAxis /> */}
                                        
                                        <Radar
                                            name="Disposal"
                                            dataKey="disposal"
                                            stroke={chartConfig.disposal.color}
                                            fill={chartConfig.disposal.color}
                                            fillOpacity={0.5}
                                        />
                                        
                                        <Radar
                                            name="Turnover"
                                            dataKey="turnover"
                                            stroke={chartConfig.turnover.color}
                                            fill={chartConfig.turnover.color}
                                            fillOpacity={0.6}
                                        />

                                        <ChartLegend content={<ChartLegendContent />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </ChartContainer>

                        // ) : (
                        ) : viewMode === 'table' ? (
                            <TurnoverDisposalTable
                                records={displayed}
                                page={page}
                                total={total}
                                pageSize={pageSize}
                                onPageChange={(newPage) => setPage(newPage)}
                                hasActiveFilters={Object.keys(cleanFilters(appliedFilters)).length > 0}
                            />
                            ) : (
                                <DonationSummaryTable 
                                    donationSummary={donationSummary}
                                />
                            )}
                        {/* )} */}
                    </CardContent>
                    {viewMode === 'chart' && (
                        <CardFooter className="flex-col gap-2 pt-4 text-sm">
                            {trendLabel ? (
                                <div className={`flex items-center gap-2 leading-none font-medium ${trendColor}`}>
                                {trendLabel} <TrendIcon className="h-4 w-4" />
                                </div>
                            ) : (
                                <div className="text-muted-foreground">No data to compare</div>
                            )}
                            <div className="text-muted-foreground flex items-center gap-2 leading-none">
                                January – {new Date().toLocaleString("default", { month: "long" })} {new Date().getFullYear()}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </AppLayout>
        
    )
}
