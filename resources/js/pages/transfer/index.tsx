import MetricKpiCard from '@/components/statistics/MetricKpiCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Calendar, CheckCircle2, Eye, Inbox, Pencil, PlusCircle, Timer, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import TransferFilterDropdown from '@/components/filters/TransferFilterDropdown';
import { type TransferFilters } from '@/components/filters/TransferFilterModal';
import TransferSortDropdown, { type SortDir, type SortKey } from '@/components/filters/TransferSortDropdown';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { notifyFiltersCleared } from '@/lib/toast-feedback';

import { formatDate, formatEnums, formatStatusLabel, InventoryList, statusVariantMap, Transfer } from '@/types/custom-index';

import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { TransferPageProps } from '@/types/page-props';
import { TransferTotals } from '@/types/transfer';
import TransferAddModal from './TransferAddModal';
import TransferEditModal from './TransferEditModal';
import TransferViewModal from './TransferViewModal';

import Pagination, { PageInfo } from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Property Transfer',
        href: '/property-transfer',
    },
];

type PagePropsWithViewing = TransferPageProps & {
    viewing?: Transfer | null;
    viewing_assets?: InventoryList[] | null;
};

export default function TransferIndex({
    transfers = [],
    assets = [],
    buildings = [],
    buildingRooms = [],
    unitOrDepartments = [],
    users = [],
    currentUser,
    subAreas,
    totals,
}: TransferPageProps & { totals?: TransferTotals }) {
    const { props } = usePage<PagePropsWithViewing>();
    const successMessage = props.flash?.success;

    const { auth } = usePage().props as unknown as {
        auth: {
            permissions: string[];
        };
    };

    const canCreate = auth.permissions.includes('create-transfers');
    const canEdit = auth.permissions.includes('update-transfers');
    const canDelete = auth.permissions.includes('delete-transfers');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transferToDelete, setTransferToDelete] = useState<Transfer | null>(null);

    const [showAddTransfer, setShowAddTransfer] = useState(false);
    const [showEditTransfer, setShowEditTransfer] = useState(false);
    const [showViewTransfer, setShowViewTransfer] = useState<boolean>(false);

    const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
    const [selectedAssets, setSelectedAssets] = useState<InventoryList[]>([]);

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200);

    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const [page, setPage] = useState(1);
    const page_size = 20;

    const [selected_status, setSelectedStatus] = useState('');
    const [selected_building, setSelectedBuilding] = useState('');
    const [selected_receiving_building, setSelectedReceivingBuilding] = useState('');
    const [selected_org, setSelectedOrg] = useState('');

    useEffect(() => {
        if (!successMessage) return;
    }, [successMessage]);

    const filteredTransfers = useMemo(() => {
        const term = search.trim().toLowerCase();
        return transfers.filter((t) => {
            const haystack = `
            ${t.currentBuildingRoom?.building?.code ?? ''}
            ${t.status} ${t.currentBuildingRoom?.room ?? ''}
            ${t.receivingBuildingRoom?.building?.code ?? ''}
            ${t.receivingBuildingRoom?.room ?? ''}
            ${t.currentOrganization?.code ?? ''}
            ${t.receivingOrganization?.code ?? ''}
            `.toLowerCase();

            const matchesSearch = !term || haystack.includes(term);

            const statusValue = (t.status || '').toString().toLowerCase();
            const matchesStatus = !selected_status || statusValue === selected_status;

            const currentBuilding = t.currentBuildingRoom?.building?.code ?? '';
            const receivingBuilding = t.receivingBuildingRoom?.building?.code ?? '';
            const matchesCurrentBuilding = !selected_building || currentBuilding === selected_building;
            const matchesReceivingBuilding = !selected_receiving_building || receivingBuilding === selected_receiving_building;

            const currentOrg = t.currentOrganization?.code ?? '';
            const receivingOrg = t.receivingOrganization?.code ?? '';
            const matchesOrg = !selected_org || currentOrg === selected_org || receivingOrg === selected_org;

            return matchesSearch && matchesStatus && matchesCurrentBuilding && matchesReceivingBuilding && matchesOrg;
        });
    }, [transfers, search, selected_status, selected_building, selected_receiving_building, selected_org]);

    const sortValue = useMemo<Record<SortKey, (t: Transfer) => number>>(
        () => ({
            id: (t) => Number(t.id) || 0,
            scheduled_date: (t) => Date.parse(t.scheduled_date ?? '') || 0,
            asset_count: (t) => Number(t.asset_count) || 0,
        }),
        [],
    );

    const sortedTransfers = useMemo(() => {
        const get = sortValue[sortKey];
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filteredTransfers].sort((a, b) => {
            const d = get(a) - get(b);
            return (d !== 0 ? d : Number(a.id) - Number(b.id)) * dir;
        });
    }, [filteredTransfers, sortKey, sortDir, sortValue]);

    useEffect(() => {
        setPage(1);
    }, [search, selected_status, selected_building, selected_receiving_building, selected_org, sortKey, sortDir]);

    const start = (page - 1) * page_size;
    const page_items = sortedTransfers.slice(start, start + page_size);

    const applyFilters = (f: TransferFilters) => {
        setSelectedStatus(f.status);
        setSelectedBuilding(f.building);
        setSelectedReceivingBuilding(f.receiving_building);
        setSelectedOrg(f.org);
    };

    const clearFilters = () => {
        setSelectedStatus('');
        setSelectedBuilding('');
        setSelectedReceivingBuilding('');
        setSelectedOrg('');
        notifyFiltersCleared();
    };

    const openViewTransfer = (t: Transfer) => {
        setSelectedTransfer(t);
        setSelectedAssets((t.transferAssets ?? []).map((ta) => ta.asset));
        setShowViewTransfer(true);
    };

    useEffect(() => {
        if (!props.viewing) return;
        openViewTransfer(props.viewing);

        if (props.viewing_assets && props.viewing_assets.length) {
            setSelectedAssets(props.viewing_assets);
        }
    }, [props.viewing, props.viewing_assets]);

    const closeViewTransfer = () => {
        setShowViewTransfer(false);
        setSelectedTransfer(null);
        setSelectedAssets([]);

        if (/^\/?transfers\/\d+\/view\/?$/.test(window.location.pathname)) {
            history.back();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transfers" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Property Transfer</h1>
                    <p className="text-sm text-muted-foreground">List of scheduled and completed asset transfers across AUF departments.</p>
                </div>

                {/* KPI Cards */}
                {totals && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <MetricKpiCard
                            icon={Inbox}
                            label="Pending Review"
                            value={totals.pending_review}
                            detail="Transfers awaiting approval"
                            tone="orange"
                        />
                        <MetricKpiCard
                            icon={Calendar}
                            label="Upcoming (30 Days)"
                            value={totals.upcoming}
                            detail="Scheduled transfers soon"
                            tone="sky"
                        />

                        {/* Overdue */}
                        {/* <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                <Clock className="h-7 w-7 text-red-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Overdue (Last + Current)</div>
                                <div className="text-3xl font-bold">{totals.overdue}</div>
                            </div>
                        </div> */}

                        <MetricKpiCard
                            icon={CheckCircle2}
                            label="Completion Rate"
                            value={`${totals.completion_rate}%`}
                            detail="Completed transfer ratio"
                            tone="green"
                        />
                        <MetricKpiCard
                            icon={Timer}
                            label="Avg Delay (Days)"
                            value={totals.avg_delay_days}
                            detail="Average completion delay"
                            tone="purple"
                        />
                    </div>
                )}

                {/* Search + Filters + Buttons Row */}
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex w-96 items-center gap-2">
                        <Input
                            type="text"
                            placeholder="Search by status, room, or unit/dept..."
                            value={rawSearch}
                            onChange={(e) => setRawSearch(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="flex gap-2">
                        <TransferSortDropdown
                            sortKey={sortKey}
                            sortDir={sortDir}
                            onChange={(key, dir) => {
                                setSortKey(key);
                                setSortDir(dir);
                            }}
                        />

                        <TransferFilterDropdown
                            onApply={applyFilters}
                            onClear={clearFilters}
                            selected_status={selected_status}
                            selected_building={selected_building}
                            selected_receiving_building={selected_receiving_building}
                            selected_org={selected_org}
                            buildings={buildings}
                            unitOrDepartments={unitOrDepartments}
                        />

                        {canCreate && (
                            <Button onClick={() => setShowAddTransfer(true)} className="cursor-pointer">
                                <PlusCircle className="mr-1 h-4 w-4 cursor-pointer" /> Add New Transfer
                            </Button>
                        )}
                    </div>
                </div>

                {/* Active Filters (chips) */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {selected_status && <Badge variant="darkOutline">Status: {formatStatusLabel(selected_status)}</Badge>}
                    {selected_building && <Badge variant="darkOutline">Current: {selected_building}</Badge>}
                    {selected_receiving_building && <Badge variant="darkOutline">Receiving: {selected_receiving_building}</Badge>}
                    {selected_org && <Badge variant="darkOutline">Unit/Dept: {selected_org}</Badge>}
                    {(selected_status || selected_building || selected_receiving_building || selected_org) && (
                        <Button size="sm" variant="destructive" onClick={clearFilters} className="cursor-pointer">
                            Clear filters
                        </Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Asset Count</TableHead>
                                <TableHead className="text-center">Current Location</TableHead>
                                <TableHead className="text-center">Current Unit/Dept</TableHead>
                                <TableHead className="text-center">Receiving Location</TableHead>
                                <TableHead className="text-center">Receiving Unit/Dept</TableHead>
                                <TableHead className="text-center">Scheduled Date</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Designated</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-center">
                            {page_items.length > 0 ? (
                                page_items.map((transfer) => (
                                    <TableRow key={transfer.id}>
                                        <TableCell>{transfer.id}</TableCell>
                                        <TableCell>{transfer.asset_count}</TableCell>
                                        <TableCell>
                                            {formatEnums(transfer.currentBuildingRoom?.building?.code).toUpperCase() ?? '—'} (
                                            {transfer.currentBuildingRoom?.room ?? '—'})
                                        </TableCell>
                                        <TableCell>{formatEnums(transfer.currentOrganization?.code).toUpperCase() ?? '—'}</TableCell>
                                        <TableCell>
                                            {formatEnums(transfer.receivingBuildingRoom?.building?.code).toUpperCase() ?? '—'} (
                                            {transfer.receivingBuildingRoom?.room ?? '—'})
                                        </TableCell>
                                        <TableCell>{formatEnums(transfer.receivingOrganization?.code).toUpperCase() ?? '—'}</TableCell>
                                        <TableCell>{formatDate(transfer.scheduled_date)}</TableCell>

                                        <TableCell>
                                            <Badge variant={statusVariantMap[transfer.status.toLowerCase()] ?? 'secondary'}>
                                                {formatStatusLabel(transfer.status.toLowerCase())}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>{transfer.designatedEmployee?.name ?? '—'}</TableCell>

                                        <TableCell className="flex items-center justify-center gap-2">
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedTransfer(transfer);
                                                        setShowEditTransfer(true);
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setTransferToDelete(transfer);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}

                                            <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                                                <Link href={`/transfers/${transfer.id}/view`} preserveScroll>
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center text-sm text-muted-foreground">
                                        No transfers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <PageInfo page={page} total={sortedTransfers.length} pageSize={page_size} label="Transfer records" />
                    <Pagination page={page} total={sortedTransfers.length} pageSize={page_size} onPageChange={setPage} />
                </div>
            </div>

            <TransferAddModal
                show={showAddTransfer}
                onClose={() => setShowAddTransfer(false)}
                currentUser={currentUser}
                buildings={buildings}
                buildingRooms={buildingRooms}
                unitOrDepartments={unitOrDepartments}
                users={users}
                assets={assets}
                subAreas={subAreas}
            />

            {selectedTransfer && (
                <TransferEditModal
                    show={showEditTransfer}
                    onClose={() => {
                        setShowEditTransfer(false);
                        setSelectedTransfer(null);
                    }}
                    transfer={{ ...selectedTransfer, is_approved: true }}
                    currentUser={currentUser}
                    buildings={buildings}
                    buildingRooms={buildingRooms}
                    unitOrDepartments={unitOrDepartments}
                    users={users}
                    assets={assets}
                    subAreas={subAreas}
                />
            )}

            {selectedTransfer && (
                <TransferViewModal
                    open={showViewTransfer}
                    onClose={closeViewTransfer}
                    transfer={selectedTransfer}
                    assets={selectedAssets}
                    signatories={props.signatories}
                />
            )}

            <DeleteConfirmationModal
                show={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    if (transferToDelete) {
                        router.delete(route('transfers.destroy', transferToDelete.id), {
                            preserveScroll: true,
                            onSuccess: () => {
                                setShowDeleteModal(false);
                                setTransferToDelete(null);
                            },
                        });
                    }
                }}
            />
        </AppLayout>
    );
}
