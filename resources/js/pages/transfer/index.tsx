import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem} from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, Filter, Pencil, PlusCircle, Trash2 } from 'lucide-react';

import { Transfer } from '@/types/transfer';
import { TransferPageProps } from '@/types/page-props';
import TransferAddModal from './TransferAddModal';
import TransferEditModal from './TransferEditModal';

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

    const [search, setSearch] = useState('');
    const [showAddTransfer, setShowAddTransfer] = useState(false);

    const [showEditTransfer, setShowEditTransfer] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

    const filteredTransfers = transfers.filter((t) =>
        `
            ${t.currentBuildingRoom?.building?.code ?? ''}
            ${t.status} ${t.currentBuildingRoom?.room ?? ''}
            ${t.receivingBuildingRoom?.building?.code ?? ''}
            ${t.receivingBuildingRoom?.room ?? ''}
            ${t.currentOrganization?.code ?? ''}
            ${t.receivingOrganization?.code ?? ''}
        `
            .toLowerCase()
            .includes(search.toLowerCase())
    );

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
                        <Input
                            type="text"
                            placeholder="Search by status, room, or unit/dept..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Filter className="mr-1 h-4 w-4" /> Filter
                        </Button>
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
                                                className="cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                className="cursor-pointer"
                                                onClick={() => 
                                                    // router.get(`/transfers/${transfer.id}`)
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

        </AppLayout>
    );
}
