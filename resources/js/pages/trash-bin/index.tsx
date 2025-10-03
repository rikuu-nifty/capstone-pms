import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import Pagination, { PageInfo } from '@/components/Pagination';
import { formatDateTime } from '@/types/custom-index';

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

const groups = {
    forms: [
        { key: 'inventory_lists', label: 'Inventory Lists' },
        { key: 'inventory_schedulings', label: 'Inventory Schedulings' },
        { key: 'transfers', label: 'Transfers' },
        { key: 'turnover_disposals', label: 'Turnover/Disposals' },
        { key: 'off_campuses', label: 'Off-Campuses' },
    ],
    assets: [
        { key: 'asset_models', label: 'Models' },
        { key: 'categories', label: 'Categories' },
        { key: 'assignments', label: 'Assignments' },
        { key: 'equipment_codes', label: 'Equipment Codes' },
    ],
    institutional: [
        { key: 'buildings', label: 'Buildings' },
        { key: 'personnels', label: 'Personnels' },
        { key: 'unit_or_departments', label: 'Units & Departments' },
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
    return `Inventory Scheduling for ${monthName} ${year}`;
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
                                <TableHead className="text-center">Record ID</TableHead>
                                <TableHead className="text-center">Record Name</TableHead>
                                <TableHead className="text-center">Date Deleted</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-center">
                            {activeData?.data?.length ? (
                                activeData.data.map((row: TrashRecord) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{formatRecordName(row, activeTab)}</TableCell>
                                    <TableCell>{formatDateTime(row.deleted_at)}</TableCell>
                                    <TableCell>
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
