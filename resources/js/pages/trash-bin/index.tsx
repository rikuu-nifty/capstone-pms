import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import Pagination, { PageInfo } from '@/components/Pagination';
import { formatDateTime, formatEnums, ucwords } from '@/types/custom-index';
import { Inbox, Calendar, Truck, Archive, Globe, Database, Building, Users } from 'lucide-react';
import SortDropdown from '@/components/filters/SortDropdown';
import { Input } from '@/components/ui/input';
import type { SortDir } from '@/components/filters/SortDropdown';
import TrashFilterDropdown from '@/components/filters/TrashFilterDropdown';

interface TrashRecord {
    id: number;
    deleted_at: string;
    asset_name?: string;
    inventory_schedule?: string;
    remarks?: string;
    description?: string;
    requester_name?: string;
    name?: string;
    code?: string;
    title?: string;
    [key: string]: unknown;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
}

type TrashBinProps = {
    // Forms
    inventory_lists: PaginatedData<TrashRecord>;
    inventory_schedulings: PaginatedData<TrashRecord>;
    transfers: PaginatedData<TrashRecord>;
    turnover_disposals: PaginatedData<TrashRecord>;
    off_campuses: PaginatedData<TrashRecord>;

    // Assets
    asset_models: PaginatedData<TrashRecord>;
    categories: PaginatedData<TrashRecord>;
    assignments: PaginatedData<TrashRecord>;
    equipment_codes: PaginatedData<TrashRecord>;

    // Institutional Setup
    buildings: PaginatedData<TrashRecord>;
    building_rooms: PaginatedData<TrashRecord>;
    personnels: PaginatedData<TrashRecord>;
    unit_or_departments: PaginatedData<TrashRecord>;

    // User Management
    users: PaginatedData<TrashRecord>;
    roles: PaginatedData<TrashRecord>;
    signatories: PaginatedData<TrashRecord>;

    filters: {
        date_filter: string;
        start?: string;
        end?: string;
        per_page: number;

        search?: string;
        sort?: string;
        dir?: SortDir;

        category_id?: string | number;
        month?: string | number;
        purpose?: string | number;
        type?: string | number;
        name?: string | number;
        building_id?: string | number;
        unit_id?: string | number;
        current_org_id?: string | number;
        receiving_org_id?: string | number;
        current_building_id?: string | number;
        receiving_building_id?: string | number;
        scheduled_date?: string | number;
        issuing_office_id?: string | number;
    };

    totals: {
        forms: {
            inventory_lists: number;
            inventory_schedulings: number;
            transfers: number;
            turnovers: number;
            disposals: number;
            off_campus_official: number;
            off_campus_repair: number;
        };
        assets: {
            categories: number;
            equipment_codes: number;
            asset_models: number;
            assignments: number;
        };
        institutional: {
            unit_or_departments: number;
            buildings: number;
            building_rooms: number;
            personnels: number;
        };
        usermgmt: {
            users: number;
            roles: number;
        };
    };

    filterSources: {
        categories: { id: number; name: string }[];
        equipment_categories: { id: number; name: string }[];
        asset_model_categories: { id: number; name: string }[];
        buildings: { id: number; name: string }[];
        units: { id: number; name: string }[];
        rooms: { id: number; name: string }[];
    };
};

interface Building {
    name: string;
    code: string;
}

interface BuildingRoom {
    name: string;
    building?: Building;
}

interface UnitOrDepartment {
    name: string;
}

interface TransferRecord extends TrashRecord {
    current_organization?: UnitOrDepartment;
    current_building_room?: BuildingRoom;
    receiving_organization?: UnitOrDepartment;
    receiving_building_room?: BuildingRoom;
    scheduled_date?: string;
}

const groups = {
    forms: [
        { key: 'inventory_lists', label: 'Inventory Lists' },
        { key: 'inventory_schedulings', label: 'Inventory Schedulings' },
        { key: 'transfers', label: 'Transfers' },
        { key: 'turnover_disposals', label: 'Turnover/Disposals' },
        { key: 'off_campuses', label: 'Off-Campuses' },
    ],
    assets: [
        { key: 'categories', label: 'Categories' },
        { key: 'equipment_codes', label: 'Equipment Codes' },
        { key: 'asset_models', label: 'Models' },
        { key: 'assignments', label: 'Assignments' },
    ],
    institutional: [
        { key: 'unit_or_departments', label: 'Units & Departments' },
        { key: 'buildings', label: 'Buildings' },
        { key: 'building_rooms', label: 'Rooms' },
        { key: 'personnels', label: 'Personnels' },
        
    ],
    usermgmt: [
        { key: 'users', label: 'Users' },
        { key: 'roles', label: 'Roles' },
        { key: 'signatories', label: 'Signatories' },
    ],
} as const;

const formatRecordName = (row: TrashRecord, tab: string) => {
    if (tab === 'inventory_schedulings' && row.inventory_schedule) {
        const [year, month] = row.inventory_schedule.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        const monthName = date.toLocaleString('en-US', { month: 'long' });
        
        return (
            <>
            Inventory Scheduling for <strong>{monthName}, {year}</strong>
            </>
        );
    }

    if (tab === 'transfers') {
        const transfer = row as TransferRecord;

        const fromUnit = transfer.current_organization?.name ?? '';
        const fromBuilding = transfer.current_building_room?.building?.code ?? '';
        // const fromRoom = transfer.current_building_room?.name ?? '';

        const toUnit = transfer.receiving_organization?.name ?? '';
        const toBuilding = transfer.receiving_building_room?.building?.code ?? '';
        // const toRoom = transfer.receiving_building_room?.name ?? '';

        let scheduled = 'unscheduled';
        if (transfer.scheduled_date) {
            const dt = new Date(transfer.scheduled_date);
            if (!isNaN(dt.getTime())) {
                scheduled = dt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
            }
        }

        return (
            <>
                Transfer from <strong>{fromUnit}</strong> ({formatEnums(fromBuilding)}) to{" "}
                <strong>{toUnit}</strong> ({formatEnums(toBuilding)}) scheduled for <strong>{scheduled}</strong>
            </>
        );
    }

    if (tab === 'turnover_disposals') {
        const td = row as TrashRecord & {
            type?: string;
            personnel?: { full_name: string };
            issuing_office?: { name: string };
        };

        // const typeLabel = td.type ? (td.type).toUpperCase() : 'Turnover/Disposal';
        const typeLabel = td.type ?? 'Turnover/Disposal';
        const personnelName = td.personnel?.full_name ?? 'Unknown Personnel';
        const issuingOffice = td.issuing_office?.name ?? 'Unknown Office';

        return (
            <>
                <strong>{ucwords(typeLabel)}</strong> request by <strong>{personnelName}</strong> from <strong>{issuingOffice}</strong>
            </>
        );
    }

    if (tab === 'off_campuses') {
        const oc = row as TrashRecord & {
            requester_name?: string;
            remarks?: string;
            college_or_unit?: { name: string };
        };

        const requester = (oc.requester_name) ?? 'Unknown Requester';
        const college = oc.college_or_unit?.name ?? 'Unknown Unit';
        const reason = oc.remarks ?? 'unspecified reason';

        return (
            <>
                Off Campus request by <strong>{ucwords(requester)}</strong> from <strong>{college}</strong> for <strong>{formatEnums(reason)}</strong>
            </>
        );
    }

    if (tab === 'asset_models') {
        const am = row as TrashRecord & { model?: string; brand?: string };

        const model = am.model ?? 'Unknown Model';
        const brand = am.brand ?? '';

        return (
            <>
                <strong>{model}</strong> {brand && <span>({brand})</span>}
            </>
        );
    }

    if (tab === 'categories') {
        const cat = row as TrashRecord & { name?: string };

        const categoryName = cat.name ?? 'Unknown Category';

        return (
            <>
                {categoryName}
            </>
        );
    }

    if (tab === 'assignments') {
        const aa = row as TrashRecord & {
            personnel?: { full_name?: string };
            date_assigned?: string;
        };

        const assignedTo = aa.personnel?.full_name ?? 'Unknown Personnel';

        let dateAssigned = 'Unknown Date';
        if (aa.date_assigned) {
            const dt = new Date(aa.date_assigned);
            if (!isNaN(dt.getTime())) {
                dateAssigned = dt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
            }
        }

        return (
            <>
                Assignment record assigned to <strong>{assignedTo}</strong> on <strong>{dateAssigned}</strong>
            </>
        );
    }

    if (tab === 'unit_or_departments') {
        const unit = row as TrashRecord & { name?: string; code?: string };

        const name = unit.name ?? 'Unknown Unit';
        const code = unit.code ? `[${formatEnums(unit.code).toUpperCase()}]` : '';

        return (
            <>
                {name} <strong>{code}</strong>
            </>
        );
    }

    if (tab === 'buildings') {
        const building = row as TrashRecord & { name?: string; code?: string };

        const name = building.name ?? 'Unknown Building';
        const code = building.code ? `[${formatEnums(building.code).toUpperCase()}]` : '';

        return (
            <>
                {name} <strong>{code}</strong>
            </>
        );
    }

    if (tab === 'building_rooms') {
        const room = row as TrashRecord & { room?: string; building?: { name?: string; code?: string } };

        const roomName = room.room ?? 'Unknown Room';
        const buildingName = room.building?.name ?? 'Unknown Building';
        const buildingCode = room.building?.code ? `[${formatEnums(room.building.code).toUpperCase()}]` : '';

        return (
            <>
                <strong>{roomName}</strong> in {buildingName} <strong>{buildingCode}</strong>
            </>
        );
    }

    if (tab === 'personnels') {
        const p = row as TrashRecord & {
            full_name?: string;
            position?: string;
            unit_or_department?: { name?: string };
        };

        const fullName = p.full_name ?? 'Unknown Personnel';
        const position = p.position ?? 'Unknown Position';
        const unit = p.unit_or_department?.name ?? 'Unknown Unit';

        return (
            <>
                <strong>{fullName}</strong> — {position} of <strong>{unit}</strong>
            </>
        );
    }

    if (tab === 'users') {
        const user = row as TrashRecord & {
            name?: string; // username
            role?: { name?: string };
            unit_or_department?: { name?: string };
        };

        const username = user.name ?? 'Unknown User';
        const role = user.role?.name ?? 'Unassigned';
        const unit = user.unit_or_department?.name;

        return (
            <>
                <strong>{username}</strong> [{role}]
                {unit && <> of <strong>{unit}</strong></>}
            </>
        );
    }

    if (tab === 'roles') {
        const role = row as TrashRecord & { name?: string };

        const roleName = role.name ?? 'Unknown';
        return (
            <>
                <strong>{roleName}</strong> role
            </>
        );
    }

    // Fallback for other modules: pick first available field
    return (
        row.asset_name ||
        row.inventory_schedule ||
        row.remarks ||
        row.description ||
        row.requester_name ||
        row.name ||
        row.code ||
        row.title ||
        '—'
    );
};

export default function TrashBinIndex(props: TrashBinProps) {
    const [activeGroup, setActiveGroup] = useState<keyof typeof groups>('forms');
    const [activeTab, setActiveTab] = useState<string>(groups.forms[0].key);

    const [localFilters, setLocalFilters] = useState(props.filters);

    const { totals } = props;

    const dataMap: Record<string, PaginatedData<TrashRecord>> = {
        // Forms
        inventory_lists: props.inventory_lists,
        inventory_schedulings: props.inventory_schedulings,
        transfers: props.transfers,
        turnover_disposals: props.turnover_disposals,
        off_campuses: props.off_campuses,

        // Assets
        asset_models: props.asset_models,
        categories: props.categories,
        assignments: props.assignments,
        equipment_codes: props.equipment_codes,

        // Institutional Setup
        buildings: props.buildings,
        building_rooms: props.building_rooms,
        personnels: props.personnels,
        unit_or_departments: props.unit_or_departments,

        // User Management
        users: props.users,
        roles: props.roles,
        signatories: props.signatories,
    };
    const activeData = dataMap[activeTab];

    const restoreMap: Record<string, string> = {
        inventory_lists: 'inventory-list',
        inventory_schedulings: 'inventory-schedule',
        transfers: 'transfer',
        turnover_disposals: 'turnover-disposal',
        off_campuses: 'off-campus',
        asset_models: 'asset-model',
        categories: 'category',
        assignments: 'assignment',
        equipment_codes: 'equipment-code',
        buildings: 'building',
        building_rooms: 'building-room',
        personnels: 'personnel',
        unit_or_departments: 'unit-or-department',
        users: 'user',
        roles: 'role',
        signatories: 'signatory',
    };

    const handleRestore = (type: string, id: number) => {
        const mappedType = restoreMap[type];
        if (!mappedType) return;
        router.post(`/trash-bin/restore/${mappedType}/${id}`, {}, { preserveScroll: true });
    };

    const formatLabel = (key: string) => {
        const words = key.replace(/_/g, ' ').split(' ');
        const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return `${capitalized} records`;
    };

    const [search, setSearch] = useState(props.filters.search ?? '');
    const [sortKey, setSortKey] = useState(props.filters.sort ?? 'id');
    const [sortDir, setSortDir] = useState<SortDir>(props.filters.dir ?? 'desc');

    return (
        <AppLayout>
            <Head title="Trash Bin" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold">Trash Bin</h1>
                    <p className="text-sm text-muted-foreground">Archived records across all modules.</p>
                </div>

                {/* GROUP TABS */}
                <div className="mb-2 flex gap-2 rounded-md bg-muted p-2">
                    {Object.keys(groups).map((g) => (
                        <Button
                            key={g}
                            variant={activeGroup === g ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                                setActiveGroup(g as keyof typeof groups);
                                setActiveTab(groups[g as keyof typeof groups][0].key); // reset to first tab in group
                            }}
                        >
                            {g === 'forms' && 'Forms'}
                            {g === 'assets' && 'Assets'}
                            {g === 'institutional' && 'Institutional Setup'}
                            {g === 'usermgmt' && 'User Management'}
                        </Button>
                    ))}
                </div>

                {/* KPIs Section */}
                {totals && (
                    <div
                        className={`grid gap-3 
                            grid-cols-1 sm:grid-cols-2 
                            ${activeGroup === 'forms' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}
                        `}
                    >
                        {activeGroup === 'forms' && (
                        <>
                            {/* Inventory Lists */}
                            <div className="rounded-2xl border p-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100">
                                    <Inbox className="h-7 w-7 text-sky-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Assets (Inventory Lists)</div>
                                    <div className="text-3xl font-bold">{totals.forms.inventory_lists}</div>
                                </div>
                            </div>

                            {/* Inventory Scheduling */}
                            <div className="rounded-2xl border p-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                    <Calendar className="h-7 w-7 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Inventory Scheduling</div>
                                    <div className="text-3xl font-bold">{totals.forms.inventory_schedulings}</div>
                                </div>
                            </div>

                            {/* Transfers */}
                            <div className="rounded-2xl border p-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                                    <Truck className="h-7 w-7 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Property Transfers</div>
                                    <div className="text-3xl font-bold">{totals.forms.transfers}</div>
                                </div>
                            </div>

                            {/* Turnovers / Disposals */}
                            <div className="rounded-2xl border p-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                    <Archive className="h-7 w-7 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Turnover/Disposals</div>
                                    <div className="text-base font-semibold">
                                        <span className='text-blue-600'>Turnovers:</span> <span className="font-bold text-blue-600">{totals.forms.turnovers}</span> | 
                                        <span className='text-red-600'> Disposals:</span> <span className="font-bold text-red-600">{totals.forms.disposals}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Off Campus */}
                            <div className="rounded-2xl border p-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                    <Globe className="h-7 w-7 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Off-Campus Requests</div>
                                    <div className="text-base font-semibold">
                                        <span className='text-blue-600'>Official Use: </span><span className="font-bold text-blue-600">{totals.forms.off_campus_official}</span> | 
                                        <span className='text-red-600'> Repair: </span><span className="font-bold text-red-600">{totals.forms.off_campus_repair}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                        )}

                        {activeGroup === 'assets' && (
                        <>
                            {Object.entries(totals.assets).map(([key, value], index) => {
                                const iconConfig = [
                                    { Icon: Database, bg: 'bg-amber-100', color: 'text-amber-600' }, // Categories
                                    { Icon: Archive, bg: 'bg-teal-100', color: 'text-teal-600' },   // Equipment Codes
                                    { Icon: Inbox, bg: 'bg-indigo-100', color: 'text-indigo-600' }, // Models
                                    { Icon: Truck, bg: 'bg-rose-100', color: 'text-rose-600' },     // Assignments
                                ][index];
                                const { Icon, bg, color } = iconConfig || {};
                                return (
                                    <div key={key} className="rounded-2xl border p-4 flex items-center gap-3">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bg}`}>
                                            {Icon && <Icon className={`h-7 w-7 ${color}`} />}
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">{ucwords(key.replace('_', ' '))}</div>
                                            <div className="text-3xl font-bold">{value as number}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                        )}

                        {activeGroup === 'institutional' && (
                        <>
                            {Object.entries(totals.institutional).map(([key, value], index) => {
                                const iconConfig = [
                                    { Icon: Building, bg: 'bg-cyan-100', color: 'text-cyan-600' },     // Units
                                    { Icon: Archive, bg: 'bg-lime-100', color: 'text-lime-600' },      // Buildings
                                    { Icon: Database, bg: 'bg-violet-100', color: 'text-violet-600' }, // Rooms
                                    { Icon: Users, bg: 'bg-pink-100', color: 'text-pink-600' },        // Personnels
                                ][index];
                                const { Icon, bg, color } = iconConfig || {};
                                return (
                                    <div key={key} className="rounded-2xl border p-4 flex items-center gap-3">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bg}`}>
                                            {Icon && <Icon className={`h-7 w-7 ${color}`} />}
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">{ucwords(key.replace('_', ' '))}</div>
                                            <div className="text-3xl font-bold">{value as number}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                        )}

                        {activeGroup === 'usermgmt' && (
                        <>
                            {Object.entries(totals.usermgmt).map(([key, value], index) => {
                                const iconConfig = [
                                    { Icon: Users, bg: 'bg-blue-100', color: 'text-blue-600' },       // Users
                                    { Icon: Archive, bg: 'bg-emerald-100', color: 'text-emerald-600' }, // Roles
                                    { Icon: Globe, bg: 'bg-purple-100', color: 'text-purple-600' },   // Signatories
                                ][index];
                                const { Icon, bg, color } = iconConfig || {};
                                return (
                                    <div key={key} className="rounded-2xl border p-4 flex items-center gap-3">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bg}`}>
                                            {Icon && <Icon className={`h-7 w-7 ${color}`} />}
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">{ucwords(key.replace('_', ' '))}</div>
                                            <div className="text-3xl font-bold">{value as number}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Search records..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-[280px]"
                        />
                        <Button
                            onClick={() =>
                                router.get(
                                "/trash-bin",
                                {
                                    ...props.filters,
                                    ...localFilters,
                                    search,
                                    sort: sortKey,
                                    dir: sortDir,
                                    tab: activeTab,
                                },
                                { preserveState: true }
                                )
                            }
                            className="cursor-pointer"
                        >
                            Search
                        </Button>

                        {activeTab === "asset_models" && (
                            <TrashFilterDropdown
                                title="Category"
                                fields={[
                                    {
                                        label: "Category",
                                        type: "select",
                                        options: props.filterSources.asset_model_categories.map((c) => ({
                                        label: c.name,
                                        value: c.id,
                                        })),
                                        value: localFilters.category_id ?? "",
                                        onChange: (val) =>
                                        setLocalFilters((p) => ({ ...p, category_id: val })),
                                    },
                                ]}
                                onApply={() =>
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...localFilters },
                                        { preserveState: true }
                                    )
                                }
                                onClear={() => {
                                    const cleared = { ...localFilters, category_id: "" };
                                    setLocalFilters(cleared);
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...cleared },
                                        { preserveState: true }
                                    );
                                }}
                            />
                        )}

                        {activeTab === "inventory_schedulings" && (
                            <TrashFilterDropdown
                                title="Month"
                                fields={[
                                    {
                                        label: "Month",
                                        type: "select",
                                        options: [
                                        { label: "January", value: "01" },
                                        { label: "February", value: "02" },
                                        { label: "March", value: "03" },
                                        { label: "April", value: "04" },
                                        { label: "May", value: "05" },
                                        { label: "June", value: "06" },
                                        { label: "July", value: "07" },
                                        { label: "August", value: "08" },
                                        { label: "September", value: "09" },
                                        { label: "October", value: "10" },
                                        { label: "November", value: "11" },
                                        { label: "December", value: "12" },
                                        ],
                                        value: localFilters.month ?? "",
                                        onChange: (val) => setLocalFilters((p) => ({ ...p, month: val })),
                                    },
                                ]}
                                onApply={() =>
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...localFilters },
                                        { preserveState: true }
                                    )
                                }
                                onClear={() => {
                                    const cleared = { ...localFilters, month: "" };
                                    setLocalFilters(cleared);
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...cleared },
                                        { preserveState: true }
                                    );
                                }}
                            />
                        )}

                        {activeTab === "transfers" && (
                            <TrashFilterDropdown
                                title="Filters"
                                fields={[
                                    {
                                        label: "Current Organization",
                                        type: "select",
                                        options: props.filterSources.units.map((u) => ({
                                        label: u.name,
                                        value: u.id,
                                        })),
                                        value: localFilters.current_org_id ?? "",
                                        onChange: (val) =>
                                        setLocalFilters((p) => ({ ...p, current_org_id: val })),
                                    },
                                    {
                                        label: "Receiving Organization",
                                        type: "select",
                                        options: props.filterSources.units.map((u) => ({
                                        label: u.name,
                                        value: u.id,
                                        })),
                                        value: localFilters.receiving_org_id ?? "",
                                        onChange: (val) =>
                                        setLocalFilters((p) => ({ ...p, receiving_org_id: val })),
                                    },
                                    {
                                        label: "Current Building",
                                        type: "select",
                                        options: props.filterSources.buildings.map((b) => ({
                                        label: b.name,
                                        value: b.id,
                                        })),
                                        value: localFilters.current_building_id ?? "",
                                        onChange: (val) =>
                                        setLocalFilters((p) => ({ ...p, current_building_id: val })),
                                    },
                                    {
                                        label: "Receiving Building",
                                        type: "select",
                                        options: props.filterSources.buildings.map((b) => ({
                                        label: b.name,
                                        value: b.id,
                                        })),
                                        value: localFilters.receiving_building_id ?? "",
                                        onChange: (val) =>
                                        setLocalFilters((p) => ({ ...p, receiving_building_id: val })),
                                    },
                                    {
                                        label: "Scheduled Date",
                                        type: "date",
                                        value: localFilters.scheduled_date ?? "",
                                        onChange: (val) =>
                                        setLocalFilters((p) => ({ ...p, scheduled_date: val })),
                                    },
                                ]}
                                onApply={() =>
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...localFilters },
                                        { preserveState: true }
                                    )
                                }
                                onClear={() => {
                                    const cleared = {
                                        ...localFilters,
                                        current_org_id: "",
                                        receiving_org_id: "",
                                        current_building_id: "",
                                        receiving_building_id: "",
                                        scheduled_date: "",
                                    };
                                    setLocalFilters(cleared);
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...cleared },
                                        { preserveState: true }
                                    );
                                }}
                            />
                        )}

                        {activeTab === "off_campuses" && (
                            <TrashFilterDropdown
                                title="Purpose"
                                fields={[
                                    {
                                        label: "Purpose",
                                        type: "select",
                                        options: [
                                        { label: "Official Use", value: "official_use" },
                                        { label: "Repair", value: "repair" },
                                        ],
                                        value: localFilters.purpose ?? "",
                                        onChange: (val) =>
                                        setLocalFilters((p) => ({ ...p, purpose: val })),
                                    },
                                ]}
                                onApply={() =>
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...localFilters },
                                        { preserveState: true }
                                    )
                                }
                                onClear={() => {
                                    const cleared = { ...localFilters, purpose: "" };
                                    setLocalFilters(cleared);
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...cleared },
                                        { preserveState: true }
                                    );
                                }}
                            />
                        )}

                        {activeTab === "turnover_disposals" && (
                            <TrashFilterDropdown
                                title="Filters"
                                fields={[
                                    {
                                        label: "Type",
                                        type: "select",
                                        options: [
                                        { label: "Turnover", value: "turnover" },
                                        { label: "Disposal", value: "disposal" },
                                        ],
                                        value: localFilters.type ?? "",
                                        onChange: (val) => setLocalFilters((p) => ({ ...p, type: val })),
                                    },
                                    {
                                        label: "Issuing Office",
                                        type: "select",
                                        options: props.filterSources.units.map((u) => ({
                                        label: u.name,
                                        value: u.id,
                                        })),
                                        value: localFilters.issuing_office_id ?? "",
                                        onChange: (val) =>
                                        setLocalFilters((p) => ({ ...p, issuing_office_id: val })),
                                    },
                                ]}
                                onApply={() =>
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...localFilters },
                                        { preserveState: true }
                                    )
                                }
                                onClear={() => {
                                    const cleared = { ...localFilters, type: "", issuing_office_id: "" };
                                    setLocalFilters(cleared);
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...cleared },
                                        { preserveState: true }
                                    );
                                }}
                            />
                        )}

                        {activeTab === "categories" && (
                            <TrashFilterDropdown
                                title="Category"
                                fields={[
                                    {
                                        label: "Category",
                                        type: "select",
                                        options: props.filterSources.categories.map((c) => ({
                                        label: c.name,
                                        value: c.name,
                                        })),
                                        value: localFilters.name ?? "",
                                        onChange: (val) => setLocalFilters((p) => ({ ...p, name: val })),
                                    },
                                ]}
                                onApply={() =>
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...localFilters },
                                        { preserveState: true }
                                    )
                                }
                                onClear={() => {
                                    const cleared = { ...localFilters, name: "" };
                                    setLocalFilters(cleared);
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...cleared },
                                        { preserveState: true }
                                    );
                                }}
                            />
                        )}

                        {activeTab === "equipment_codes" && (
                            <TrashFilterDropdown
                                title="Category"
                                fields={[
                                    {
                                        label: "Category",
                                        type: "select",
                                        options: props.filterSources.equipment_categories.map((c) => ({
                                        label: c.name,
                                        value: c.id,
                                        })),
                                        value: localFilters.category_id ?? "",
                                        onChange: (val) =>
                                        setLocalFilters((p) => ({ ...p, category_id: val })),
                                    },
                                ]}
                                onApply={() =>
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...localFilters },
                                        { preserveState: true }
                                    )
                                }
                                onClear={() => {
                                    const cleared = { ...localFilters, category_id: "" };
                                    setLocalFilters(cleared);
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...cleared },
                                        { preserveState: true }
                                    );
                                }}
                            />
                        )}

                        {activeTab === "building_rooms" && (
                            <TrashFilterDropdown
                                title="Building"
                                fields={[
                                    {
                                        label: "Building",
                                        type: "select",
                                        options: props.filterSources.buildings.map((b) => ({
                                        label: b.name,
                                        value: b.id,
                                        })),
                                        value: localFilters.building_id ?? "",
                                        onChange: (val) =>
                                        setLocalFilters((p) => ({ ...p, building_id: val })),
                                    },
                                ]}
                                onApply={() =>
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...localFilters },
                                        { preserveState: true }
                                    )
                                }
                                onClear={() => {
                                    const cleared = { ...localFilters, building_id: "" };
                                    setLocalFilters(cleared);
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...cleared },
                                        { preserveState: true }
                                    );
                                }}
                            />
                        )}

                        {activeTab === "personnels" && (
                            <TrashFilterDropdown
                                title="Unit/Department"
                                fields={[
                                    {
                                        label: "Unit/Department",
                                        type: "select",
                                        options: props.filterSources.units.map((u) => ({
                                        label: u.name,
                                        value: u.id,
                                        })),
                                        value: localFilters.unit_id ?? "",
                                        onChange: (val) =>
                                        setLocalFilters((p) => ({ ...p, unit_id: val })),
                                    },
                                ]}
                                onApply={() =>
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...localFilters },
                                        { preserveState: true }
                                    )
                                }
                                onClear={() => {
                                    const cleared = { ...localFilters, unit_id: "" };
                                    setLocalFilters(cleared);
                                    router.get(
                                        "/trash-bin",
                                        { ...props.filters, ...cleared },
                                        { preserveState: true }
                                    );
                                }}
                            />
                        )}
                    </div>

                    <SortDropdown
                        sortKey={sortKey}
                        sortDir={sortDir}
                        options={[
                            { value: "id", label: "ID" },
                            { value: "deleted_at", label: "Deleted Date" },
                            { value: "name", label: "Record Name" },
                            { value: "code", label: "Code" },
                        ]}
                        onChange={(key, dir) => {
                            setSortKey(key);
                            setSortDir(dir);
                            router.get(
                                "/trash-bin",
                                { ...props.filters, ...localFilters, search, sort: key, dir, tab: activeTab },
                                { preserveState: true }
                            );
                        }}
                    />
                </div>
                
                <div className="flex gap-1 border-b">
                    {groups[activeGroup].map((m) => (
                        <button
                            key={m.key}
                            onClick={() => setActiveTab(m.key)}
                            className={`cursor-pointer
                                px-4 py-2 text-sm font-medium transition-colors border-b-2 rounded-t-md ${
                                activeTab === m.key
                                ? 'text-blue-800 border-blue-600 bg-blue-100/60'
                                : 'text-primary border-transparent hover:border-blue-400 hover:bg-blue-50/60'
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* Active Module Table */}
                <div className="rounded-lg border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="text-center w-[80px]">Record ID</TableHead>
                                <TableHead className="text-center w-[400px]">Record Name</TableHead>
                                <TableHead className="text-center w-[180px]">Date Deleted</TableHead>
                                <TableHead className="text-center w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-center">
                            {activeData?.data?.length ? (
                                activeData.data.map((row: TrashRecord) => (
                                <TableRow key={row.id}>
                                    <TableCell className="max-w-[80px]">{row.id}</TableCell>
                                    <TableCell className="max-w-[400px] whitespace-normal break-words">{formatRecordName(row, activeTab)}</TableCell>
                                    <TableCell className="max-w-[180px]">{formatDateTime(row.deleted_at)}</TableCell>
                                    <TableCell className="max-w-[120px]">
                                        <div className="flex justify-center gap-2">
                                            <Button 
                                                onClick={() => handleRestore(activeTab, row.id)}
                                                className="cursor-pointer"
                                            >
                                                Restore
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {activeData && (
                    <div className="flex justify-between items-center">
                        <PageInfo
                            page={activeData.current_page}
                            total={activeData.total}
                            pageSize={activeData.per_page}
                            label={formatLabel(activeTab)}
                        />
                        <Pagination
                            page={activeData.current_page}
                            total={activeData.total}
                            pageSize={activeData.per_page}
                            onPageChange={(p) => router.get('/trash-bin', { ...props.filters, page: p }, { preserveState: true })
                        }
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
