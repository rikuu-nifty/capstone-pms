import React, { useState, useEffect } from "react"
import AppLayout from "@/layouts/app-layout"
import { type BreadcrumbItem } from "@/types"
import { Head, router, usePage } from "@inertiajs/react"
import { route } from "ziggy-js"
import { PickerInput } from "@/components/picker-input"
import Select from "react-select"
import { Filter, RotateCcw, FileDown, FileSpreadsheet, FileText } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import TurnoverDisposalTable from "./TurnoverDisposalTable"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export type RecordRow = {
    id: number
    type: string
    issuing_office: string
    receiving_office?: string | null
    asset_count: number
    document_date: string
    status: string
    remarks?: string | null
}

type PaginationMeta = {
    current_page: number
    from: number | null
    last_page: number
    path: string
    per_page: number
    to: number | null
    total: number
}

type Paginator<T> = {
    data: T[]
    meta: PaginationMeta
    links: {
        url: string | null
        label: string
        active: boolean
    }[]
}

type PageProps = {
    records: Paginator<RecordRow>
    buildings: { id: number; name: string }[]
    departments: { id: number; name: string }[]
    rooms: { id: number; name: string; building_id: number }[]
    filters: {
        from?: string | null
        to?: string | null
        status?: string | null
        department_id?: number | null
        building_id?: number | null
        room_id?: number | null
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Reports", href: "/reports" },
    { title: "Turnover/Disposal Report", href: "/reports/turnover-disposal" },
]

export default function TurnoverDisposalReport() {
    const firstLoadRef = React.useRef(true)
    
    const { records, buildings, departments, rooms, filters: initialFilters } =
        usePage<PageProps>().props

    const [page, setPage] = useState(records.meta.current_page ?? 1)
    const [total, setTotal] = useState(records.meta.total ?? 0)
    const [pageSize, setPageSize] = useState(records.meta.per_page ?? 10)
    const [displayed, setDisplayed] = useState<RecordRow[]>(records.data)

    const defaultFilters = {
        from: null as string | null,
        to: null as string | null,
        status: null as string | null,
        department_id: null as number | null,
        building_id: null as number | null,
        room_id: null as number | null,
    }
    const [filters, setFilters] = useState({ ...defaultFilters, ...initialFilters })
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('table')

    function updateFilter<K extends keyof typeof filters>(
        key: K,
        value: (typeof filters)[K]
    ) {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const filteredRooms = filters.building_id
        ? rooms.filter((r) => r.building_id === filters.building_id)
        : rooms

    function buildQuery(filtersObj: typeof defaultFilters): string {
        const params: Record<string, string> = {}
        Object.entries(filtersObj).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            params[key] = String(value)
        }
        })
        return new URLSearchParams(params).toString()
    }

    function cleanFilters(obj: typeof filters) {
    const result: Record<string, string | number> = {}
    Object.entries(obj).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') result[k] = String(v)
    })
    return result
    }

    // Refetch when page changes
    useEffect(() => {
    if (firstLoadRef.current) {
        firstLoadRef.current = false
        return
    }

    router.get(
        route('reports.turnover-disposal'),
        { ...cleanFilters(filters), page },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

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

                {/* Status */}
                <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Status
                </label>
                <Select
                    className="w-full"
                    isClearable
                    value={
                    filters.status
                        ? {
                            value: filters.status,
                            label: filters.status.replace("_", " "),
                        }
                        : null
                    }
                    options={[
                    { value: "pending_review", label: "Pending Review" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                    { value: "cancelled", label: "Cancelled" },
                    { value: "completed", label: "Completed" },
                    ]}
                    onChange={(opt) => updateFilter("status", opt?.value ?? null)}
                />
                </div>

                {/* Department */}
                <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Department
                </label>
                <Select
                    className="w-full"
                    isClearable
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
                    onChange={(opt) =>
                    updateFilter("department_id", opt?.value ?? null)
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
                    isClearable
                    value={
                    filters.building_id
                        ? {
                            value: filters.building_id,
                            label:
                            buildings.find((b) => b.id === filters.building_id)
                                ?.name || "",
                        }
                        : null
                    }
                    options={buildings.map((b) => ({
                    value: b.id,
                    label: b.name,
                    }))}
                    onChange={(opt) => {
                    updateFilter("building_id", opt?.value ?? null)
                    updateFilter("room_id", null)
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
                    isClearable
                    value={
                    filters.room_id
                        ? {
                            value: filters.room_id,
                            label:
                            rooms.find((r) => r.id === filters.room_id)?.name ||
                            "",
                        }
                        : null
                    }
                    options={filteredRooms.map((r) => ({
                    value: r.id,
                    label: r.name,
                    }))}
                    onChange={(opt) => updateFilter("room_id", opt?.value ?? null)}
                    isDisabled={!filters.building_id}
                />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                {/* Clear */}
                <button
                onClick={() => {
                    setFilters(defaultFilters)
                    setPage(1)
                    router.get(route('reports.turnover-disposal'), {}, {  // ✅ no params
                    preserveState: true,
                    replace: true,
                    })
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
                    router.get(
                    route('reports.turnover-disposal'),
                    { ...cleanFilters(filters), page: 1 },             // ✅ only non-empty
                    { preserveState: true, replace: true }
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
                    <button
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
                    </button>
                    <button
                    onClick={() => {
                        const query = buildQuery(filters)
                        window.open(
                        route("reports.turnover-disposal.export.pdf") +
                            "?" +
                            query,
                        "_blank"
                        )
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
                <div className="flex h-full items-center justify-center text-gray-500">
                    {/* Placeholder until we add RadarChart */}
                    <p>No chart yet – coming soon</p>
                </div>
                ) : (
                <TurnoverDisposalTable
                    records={displayed}
                    page={page}
                    total={total}
                    pageSize={pageSize}
                    onPageChange={(newPage) => setPage(newPage)}
                />
                )}
            </CardContent>
            </Card>

            {/* <pre className="mt-4 rounded bg-gray-100 p-2 text-xs text-black overflow-x-auto">
                {JSON.stringify(testPage, null, 2)}
            </pre> */}
        </div>
        </AppLayout>
        
    )
}
