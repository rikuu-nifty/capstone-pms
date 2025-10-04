import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import Pagination, { PageInfo } from '@/components/Pagination';
import { formatDateTime, formatEnums, ucwords } from '@/types/custom-index';

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
    form_approvals: PaginatedData<TrashRecord>;
    signatories: PaginatedData<TrashRecord>;

    filters: {
        date_filter: string;
        start?: string;
        end?: string;
        per_page: number;
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
        { key: 'form_approvals', label: 'Form Approval' },
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
        form_approvals: props.form_approvals,
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
        form_approvals: 'form-approval',
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

    return (
        <AppLayout>
            <Head title="Trash Bin" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold">Trash Bin</h1>
                    <p className="text-sm text-muted-foreground">Archived records across all modules.</p>
                </div>

                {/* Group Tabs */}
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
