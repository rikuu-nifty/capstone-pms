import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem} from '@/types';
import { Head } from '@inertiajs/react';
// import { useForm } from '@inertiajs/react';
import { useState } from 'react';
// import { Eye, Filter, Grid, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';

import { Transfer } from '@/types/transfer';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transfers',
        href: '/transfers',
    },
];

const statusVariantMap: Record<string, 'default' | 'primary' | 'secondary' | 'outline' | 'destructive'> = {
    upcoming: 'primary',
    in_progress: 'outline',
    overdue: 'destructive',
    completed: 'secondary',
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

export type TransferFormData = {
    current_building_room: number;
    current_organization: number;
    receiving_building_room: number;
    receiving_organization: number;
    designated_employee: number;
    assigned_by: number;
    scheduled_date: string;
    actual_transfer_date: string | null;
    received_by: number | null;
    status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
    remarks: string | null;
}

export default function TransferIndex( {transfers = []}: { 
    transfers: Transfer[] 
}) {

    //Search Filters
    const [search, setSearch] = useState('');
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
                    <Button
                        /* onClick = {() => {
                        
                        }}
                        */
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Schedule Transfer
                    </Button>
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
                                {/* <TableHead className="text-center">Remarks</TableHead> */}
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
                                        {/* <TableCell>{transfer.remarks ?? '—'}</TableCell> */}
                                        
                                        <TableCell className="flex gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
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
        </AppLayout>
    );
}
