import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem} from '@/types';
import { Head, useForm } from '@inertiajs/react';
// import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, Filter, Pencil, PlusCircle, Trash2 } from 'lucide-react';
// import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';

import { TransferPageProps } from '@/types/page-props';
import { TransferFormData } from '@/types/transfer';
import AddModal from '@/components/modals/AddModal';

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

export default function TransferIndex({
    transfers = [],
    // assets = [],
    buildings = [],
    buildingRooms = [],
    unitOrDepartments = [],
    users = [],

}: TransferPageProps) {

    const { data, setData, post, processing, errors, reset, clearErrors} = useForm<TransferFormData>({
        current_building_id: 0,
        current_building_room: 0,
        current_organization: 0,
        receiving_building_room: 0,
        receiving_organization: 0,
        designated_employee: 0,
        assigned_by: 0,
        scheduled_date: '',
        actual_transfer_date: '',
        received_by: '',
        status: 'upcoming',
        remarks: '',
    });

    //Search Filters UseState
    const [search, setSearch] = useState('');
    const filteredCurrentRooms = buildingRooms.filter(
        (room) => Number(room.building_id) === Number(data.current_building_id)
    );

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/transfers', {
            onSuccess: () => {
                reset();
                setShowAddTransfer(false);
            },
        });
        console.log('Form Submitted', data);
    };

    const [showAddTransfer, setShowAddTransfer] = useState(false);

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
                                reset();
                                clearErrors();
                                setShowAddTransfer(true);
                            }}
                            className="cursor-pointer"
                        >
                            <PlusCircle className="mr-1 h-4 w-4" /> Add New Transfer
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

            <AddModal
                show={showAddTransfer}
                onClose={() => setShowAddTransfer(false)}
                title="Add New Transfer"
                onSubmit={handleSubmit}
                processing={processing}
            >
                {/* Current Building */}
                <div className="col-span-1">
                    <label className="mb-1 block font-medium">Current Building</label>
                    <select
                        className="w-full rounded-lg border p-2"
                        value={data.current_building_id}
                        onChange={(e) => {
                            setData('current_building_id', Number(e.target.value));
                            setData('current_building_room', 0); // reset room when building changes
                        }}
                    >
                        <option value="">Select Building</option>
                        {buildings.map((building) => (
                            <option key={building.id} value={building.id}>
                                {building.name} ({building.code})
                            </option>
                        ))}
                    </select>
                    {errors.current_building_id && <p className="mt-1 text-xs text-red-500">{errors.current_building_id}</p>}
                </div>
                
                {/* Current Room */}
                <div className="col-span-1">
                    <label className="mb-1 block font-medium">Current Room</label>
                    <select
                        className="w-full rounded-lg border p-2"
                        value={data.current_building_room}
                        onChange={(e) => setData('current_building_room', Number(e.target.value))}
                        disabled={!data.current_building_id}
                    >
                        <option value="">Select Room</option>
                        {filteredCurrentRooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.room}
                            </option>
                        ))}
                    </select>
                    {errors.current_building_room && <p className="mt-1 text-xs text-red-500">{errors.current_building_room}</p>}
                </div>

                {/* Current Unit/Department */}
                <div className="col-span-1">
                    <label className="mb-1 block font-medium">Current Unit/Department</label>
                    <select
                        className="w-full rounded-lg border p-2"
                        value={data.current_organization}
                        onChange={(e) => setData('current_organization', Number(e.target.value))}
                    >
                        <option value="">Select Unit/Dept</option>
                        {unitOrDepartments.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                                {unit.code} - {unit.name}
                            </option>
                        ))}
                    </select>
                    {errors.current_organization && <p className="mt-1 text-xs text-red-500">{errors.current_organization}</p>}
                </div>

                {/* Receiving Location */}
                <div className="col-span-1">
                    <label className="mb-1 block font-medium">Receiving Location</label>
                    <select
                        className="w-full rounded-lg border p-2"
                        value={data.receiving_building_room}
                        onChange={(e) => setData('receiving_building_room', Number(e.target.value))}
                    >
                        <option value="">Select Room</option>
                        {buildingRooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.building?.code ?? '—'} – {room.room}
                            </option>
                        ))}
                    </select>
                    {errors.receiving_building_room && <p className="mt-1 text-xs text-red-500">{errors.receiving_building_room}</p>}
                </div>

                {/* Receiving Unit/Department */}
                <div className="col-span-1">
                    <label className="mb-1 block font-medium">Receiving Unit/Department</label>
                    <select
                        className="w-full rounded-lg border p-2"
                        value={data.receiving_organization}
                        onChange={(e) => setData('receiving_organization', Number(e.target.value))}
                    >
                        <option value="">Select Unit/Dept</option>
                        {unitOrDepartments.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                                {unit.code} - {unit.name}
                            </option>
                        ))}
                    </select>
                    {errors.receiving_organization && <p className="mt-1 text-xs text-red-500">{errors.receiving_organization}</p>}
                </div>

                {/* Designated Employee */}
                <div className="col-span-1">
                    <label className="mb-1 block font-medium">Designated Employee</label>
                    <select
                        className="w-full rounded-lg border p-2"
                        value={data.designated_employee}
                        onChange={(e) => setData('designated_employee', Number(e.target.value))}
                    >
                        <option value="">Select Employee</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                    {errors.designated_employee && <p className="mt-1 text-xs text-red-500">{errors.designated_employee}</p>}
                </div>

                {/* Assigned By */}
                <div className="col-span-1">
                    <label className="mb-1 block font-medium">Assigned By</label>
                    <select
                        className="w-full rounded-lg border p-2"
                        value={data.assigned_by}
                        onChange={(e) => setData('assigned_by', Number(e.target.value))}
                    >
                        <option value="">Select Staff</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                    {errors.assigned_by && <p className="mt-1 text-xs text-red-500">{errors.assigned_by}</p>}
                </div>

                {/* Scheduled Date */}
                <div className="col-span-1">
                    <label className="mb-1 block font-medium">Scheduled Date</label>
                    <input
                        type="date"
                        className="w-full rounded-lg border p-2"
                        value={data.scheduled_date}
                        onChange={(e) => setData('scheduled_date', e.target.value)}
                    />
                    {errors.scheduled_date && <p className="mt-1 text-xs text-red-500">{errors.scheduled_date}</p>}
                </div>

                {/* Actual Transfer Date */}
                <div className="col-span-1">
                    <label className="mb-1 block font-medium">Actual Transfer Date</label>
                    <input
                        type="date"
                        className="w-full rounded-lg border p-2"
                        value={data.actual_transfer_date ?? ''}
                        onChange={(e) => setData('actual_transfer_date', e.target.value)}
                    />
                    {errors.actual_transfer_date && <p className="mt-1 text-xs text-red-500">{errors.actual_transfer_date}</p>}
                </div>

                {/* Status */}
                <div className="col-span-1">
                    <label className="mb-1 block font-medium">Status</label>
                    <select
                        className="w-full rounded-lg border p-2"
                        value={data.status}
                        onChange={(e) =>
                            setData('status', e.target.value as 'upcoming' | 'in_progress' | 'completed' | 'overdue')
                        }
                    >
                        <option value="">Select Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                    </select>
                    {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                </div>

                {/* Remarks */}
                <div className="col-span-2">
                    <label className="mb-1 block font-medium">Remarks</label>
                    <textarea
                        rows={3}
                        className="w-full resize-none rounded-lg border p-2"
                        value={data.remarks ?? ''}
                        onChange={(e) => setData('remarks', e.target.value)}
                    />
                    {errors.remarks && <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>}
                </div>

            </AddModal>

        </AppLayout>
    );
}
