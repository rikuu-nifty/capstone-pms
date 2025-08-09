import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem} from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { Eye, Filter, Pencil, PlusCircle, Trash2 } from 'lucide-react';

import useDebouncedValue from '@/hooks/useDebouncedValue';
import TransferFilterModal, { type TransferFilters } from '@/components/filters/TransferFilterModal';
import TransferFilterDropdown from '@/components/filters/TransferFilterDropdown';

import { Transfer } from '@/types/transfer';
import { TransferPageProps } from '@/types/page-props';
import TransferAddModal from './TransferAddModal';
import TransferEditModal from './TransferEditModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transfers',
        href: '/transfers',
    },
];

const statusVariantMap: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'destructive'> = {
    upcoming: 'secondary',
    in_progress: 'success',
    overdue: 'destructive',
    completed: 'primary',
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

function formatStatusLabel(status: string): string {
  return status
    .split('_')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export default function TransferIndex({
    transfers = [],
    assets = [],
    buildings = [],
    buildingRooms = [],
    unitOrDepartments = [],
    users = [],
    currentUser,

}: TransferPageProps) {

    const { props } = usePage<TransferPageProps>();
    const successMessage = props.flash?.success;

    // const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transferToDelete, setTransferToDelete] = useState<Transfer | null>(null);

    // const [search, setSearch] = useState('');

    const [showAddTransfer, setShowAddTransfer] = useState(false);
    const [showEditTransfer, setShowEditTransfer] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200);

    const [page, setPage] = useState(1);
    const page_size = 20;

    const [selected_status, setSelectedStatus] = useState('');
    const [selected_building, setSelectedBuilding] = useState('');
    const [selected_receiving_building, setSelectedReceivingBuilding] = useState('');
    const [selected_org, setSelectedOrg] = useState('');

    const [showFilterModal, setShowFilterModal] = useState(false);

     const buildingCodes = useMemo(
        () => Array.from(new Set(buildings.map((b: any) => b.code).filter(Boolean))).sort(),
        [buildings]
    );

    const orgCodes = useMemo(
        () => Array.from(new Set(unitOrDepartments.map((u: any) => u.code).filter(Boolean))).sort(),
        [unitOrDepartments]
    );

    // const filteredTransfers = transfers.filter((t) =>
    //     `
    //         ${t.currentBuildingRoom?.building?.code ?? ''}
    //         ${t.status} ${t.currentBuildingRoom?.room ?? ''}
    //         ${t.receivingBuildingRoom?.building?.code ?? ''}
    //         ${t.receivingBuildingRoom?.room ?? ''}
    //         ${t.currentOrganization?.code ?? ''}
    //         ${t.receivingOrganization?.code ?? ''}
    //     `
    //         .toLowerCase()
    //         .includes(search.toLowerCase())
    // );

    // useEffect(() => {
    //     if (successMessage) {
    //         setShowModal(true);
    //         setTimeout(() => setShowModal(false), 3000);
    //     }
    // }, [successMessage]);

    useEffect(() => {
        if (!successMessage) return;
        setShowModal(true);
        const id = window.setTimeout(() => setShowModal(false), 3000);
        return () => window.clearTimeout(id);
    }, [successMessage]);

    useEffect(() => {
    if (!successMessage) return;
    setShowModal(true);
    const id = window.setTimeout(() => setShowModal(false), 3000);
    return () => window.clearTimeout(id);
  }, [successMessage]);

  // Filtering (memoized)
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
        const matchesReceivingBuilding =
            !selected_receiving_building || receivingBuilding === selected_receiving_building;

        const currentOrg = t.currentOrganization?.code ?? '';
        const receivingOrg = t.receivingOrganization?.code ?? '';
        const matchesOrg =
            !selected_org || currentOrg === selected_org || receivingOrg === selected_org;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesCurrentBuilding &&
            matchesReceivingBuilding &&
            matchesOrg
        );
        });
  }, [transfers, search, selected_status, selected_building, selected_receiving_building, selected_org]);

  // Reset page when filters/search change
    useEffect(() => {
        setPage(1);
    }, [search, selected_status, selected_building, selected_receiving_building, selected_org]);

    const page_count = Math.max(1, Math.ceil(filteredTransfers.length / page_size));
    const start = (page - 1) * page_size;
    const page_items = filteredTransfers.slice(start, start + page_size);

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
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transfers" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Transfers</h1>
                        <p className="text-sm text-muted-foreground">
                            List of scheduled and completed asset transfers across AUF departments.
                        </p>
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="Search by status, room, or unit/dept..."
                                value={search}
                                onChange={(e) => setRawSearch(e.target.value)}
                                className="max-w-xs"
                            />
                        </div>

                    <div className="text-xs text-muted-foreground">
                        Showing {filteredTransfers.length ? start + 1 : 0}–{Math.min(start + page_size, filteredTransfers.length)} of {filteredTransfers.length} filtered transfers
                    </div>

                    {/* Active filter chips */}
                    <div className="flex flex-wrap gap-2 pt-1">
                        {selected_status && <Badge variant="darkOutline">Status: {formatStatusLabel(selected_status)}</Badge>}
                        {selected_building && <Badge variant="darkOutline">Current: {selected_building}</Badge>}
                        {selected_receiving_building && <Badge variant="darkOutline">Receiving: {selected_receiving_building}</Badge>}
                        {selected_org && <Badge variant="darkOutline">Unit/Dept: {selected_org}</Badge>}
                        {(selected_status || selected_building || selected_receiving_building || selected_org) && (
                            <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={clearFilters}
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                </div>
                    
                    <div className="flex gap-2">
                        {/* <Filter className="mr-1 h-4 w-4" /> Filter */}
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
                        <Button
                            onClick={() => {
                                setShowAddTransfer(true);
                            }}
                            className="cursor-pointer"
                        >
                            <PlusCircle className="mr-1 h-4 w-4 cursor-pointer" /> Add New Transfer
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg overflow-x-auto border">
                    <Table>
                        <TableHeader >
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Asset Count</TableHead>
                                <TableHead className="text-center">Current Location</TableHead>
                                <TableHead className="text-center">Current Unit/Dept</TableHead>
                                <TableHead className="text-center">Receiving Location</TableHead>
                                <TableHead className="text-center">Receiving Unit/Dept</TableHead>
                                <TableHead className="text-center">Scheduled Date</TableHead>
                                <TableHead className="text-center">Actual Date</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Designated</TableHead>
                                <TableHead className="text-center">Assigned By</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-center">
                            {filteredTransfers.length > 0 ? (
                                filteredTransfers.map((transfer) => (
                                    <TableRow key={transfer.id}>
                                        <TableCell>{transfer.id}</TableCell>
                                        <TableCell>{transfer.asset_count}</TableCell>
                                        <TableCell>{transfer.currentBuildingRoom?.building?.code ?? '—'} ({transfer.currentBuildingRoom?.room ?? '—'})</TableCell>
                                        <TableCell>{transfer.currentOrganization?.code ?? '—'}</TableCell>
                                        <TableCell>{transfer.currentBuildingRoom?.building?.code ?? '—'} ({transfer.receivingBuildingRoom?.room ?? '—'})</TableCell>
                                        <TableCell>{transfer.receivingOrganization?.code ?? '—'}</TableCell>
                                        <TableCell>{formatDate(transfer.scheduled_date)}</TableCell>
                                        <TableCell>
                                            {transfer.actual_transfer_date ? formatDate(transfer.actual_transfer_date) : '—'}
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant={statusVariantMap[transfer.status.toLowerCase()] ?? 'secondary'}>
                                                {formatStatusLabel(transfer.status.toLowerCase())}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>{transfer.designatedEmployee?.name ?? '—'}</TableCell>
                                        <TableCell>{transfer.assignedBy?.name ?? '—'}</TableCell>
                                        
                                        <TableCell className="flex gap-2">
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
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                className="cursor-pointer"
                                                onClick={() => 
                                                    router.visit(`/transfers/${transfer.id}/view`)
                                                }
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                                        No transfers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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
            />

            {selectedTransfer && (
                <TransferEditModal
                    show={showEditTransfer}
                    onClose={() => {
                        setShowEditTransfer(false);
                        setSelectedTransfer(null);
                        setTimeout(() => setSelectedTransfer(null), 3000);
                    }}
                    transfer={selectedTransfer}
                    currentUser={currentUser}
                    buildings={buildings}
                    buildingRooms={buildingRooms}
                    unitOrDepartments={unitOrDepartments}
                    users={users}
                    assets={assets}
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
