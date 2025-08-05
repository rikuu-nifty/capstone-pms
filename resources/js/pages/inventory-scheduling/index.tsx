import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Eye, Filter, Grid, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Scheduling',
        href: '/inventory-scheduling',
    },
];

export type Building = {
    id: number;
    name: string;
    code: string | number;
    description: string;
};

export type BuildingRoom = {
    id: number;
    building_id: number;
    room: string | number;
    description: string;
};

export type UnitOrDepartment = {
    id: number;
    name: string;
    code: string | number;
    description: string;
};

export type User = {
    id: number;
    name: string;
    email: string;
};

export type Scheduled = {
    id: number;
    building: Building | null;
    building_room?: BuildingRoom | null;
    unit_or_department: UnitOrDepartment | null;
    user?: User | null;
    designated_employee?: User | null;
    assigned_by?: User | null;
    inventory_schedule: string;
    actual_date_of_schedule: string;
    checked_by: string;
    verified_by: string;
    received_by: string;
    status: string;
};

export type InventorySchedulingFormData = {
    building_id: number | string;
    building_room_id: number | string;
    unit_or_department_id: number | string;
    user_id: number | string;
    designated_employee: number | string;
    assigned_by: number | string;
    inventory_schedule: string;
    actual_date_of_schedule: string;
    checked_by: string;
    verified_by: string;
    received_by: string;
    status: string;
    description: string;
};

export default function InventorySchedulingIndex({
    schedules = [],
    buildings = [],
    buildingRooms = [],
    unitOrDepartments = [],
}: {
    schedules: Scheduled[];
    buildings: Building[];
    buildingRooms: BuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
}) {
    // data, setData, post, processing, errors, reset, clearErrors
    const { data, setData, post, reset, processing, errors } = useForm<InventorySchedulingFormData>({
        building_id: '',
        building_room_id: '',
        unit_or_department_id: '',
        user_id: '',
        designated_employee: '',
        assigned_by: '',
        inventory_schedule: '',
        actual_date_of_schedule: '',
        checked_by: '',
        verified_by: '',
        received_by: '',
        status: '',
        description: '',
    });

    const [search, setSearch] = useState('');
    const [showAddScheduleInventory, setShowAddScheduleInventory] = useState(false);

    // Filter for Rooms
    const filteredRooms = buildingRooms.filter((room) => room.building_id === Number(data.building_id));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inventory-scheduling', {
            onSuccess: () => {
                reset();
                setShowAddScheduleInventory(false);
            },
        });
        console.log('Form Submitted', data);
    };

    const filtered = schedules.filter((item) =>
        `${item.building?.name ?? ''} ${item.unit_or_department?.name ?? ''} ${item.status}`.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Scheduling" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Inventory Scheduling</h1>
                        <p className="text-sm text-muted-foreground">Manage and monitor scheduled inventory checks by room and department.</p>
                        <Input
                            type="text"
                            placeholder="Search by building, department, or status..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Grid className="mr-1 h-4 w-4" /> Category
                        </Button>
                        <Button variant="outline">
                            <Filter className="mr-1 h-4 w-4" /> Filter
                        </Button>
                        <Button className="cursor-pointer" onClick={() => setShowAddScheduleInventory(true)}>
                            <PlusCircle className="mr-1 h-4 w-4" /> Schedule Inventory
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead>Building</TableHead>
                                <TableHead>Unit/Dept/Laboratories</TableHead>
                                <TableHead>Inventory Schedule</TableHead>
                                <TableHead>Actual Date of Inventory</TableHead>
                                <TableHead>Checked By</TableHead>
                                <TableHead>Verified By</TableHead>
                                <TableHead>Received By</TableHead>
                                <TableHead className="w-[120px] text-center">Status</TableHead>
                                <TableHead className="w-[120px] text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filtered.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.building?.name ?? '-'}</TableCell>
                                    <TableCell>{item.unit_or_department?.name ?? '-'}</TableCell>
                                    <TableCell>{item.inventory_schedule}</TableCell>
                                    <TableCell>{item.actual_date_of_schedule}</TableCell>
                                    <TableCell>{item.checked_by}</TableCell>
                                    <TableCell>{item.verified_by}</TableCell>
                                    <TableCell>{item.received_by}</TableCell>
                                    <TableCell className="text-center align-middle">
                                        <Badge
                                            variant={item.status === 'completed' ? 'default' : item.status === 'pending' ? 'secondary' : 'outline'}
                                        >
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="flex justify-center gap-2">
                                        <Button size="icon" variant="ghost">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        <Button size="icon" variant="ghost">
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Side Panel Modal with Slide Effect (Schedule Inventory) */}
            <div className={`fixed inset-0 z-50 flex transition-all duration-300 ease-in-out ${showAddScheduleInventory ? 'visible' : 'invisible'}`}>
                <div
                    className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${showAddScheduleInventory ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setShowAddScheduleInventory(false)}
                ></div>

                {/* Slide-In Panel */}
                <div
                    className={`relative ml-auto w-full max-w-3xl transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900 ${
                        showAddScheduleInventory ? 'translate-x-0' : 'translate-x-full'
                    }`}
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between p-6">
                        <h2 className="text-xl font-semibold">Create Schedule Inventory</h2>
                        <button onClick={() => setShowAddScheduleInventory(false)} className="cursor-pointer text-2xl font-medium">
                            &times;
                        </button>
                    </div>

                    {/* Scrollable Form Section */}
                    <div className="auto overflow-y-auto px-6" style={{ flex: 1 }}>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4 pb-6 text-sm">
                            {/* BUILDING*/}
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Building</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.building_id}
                                    onChange={(e) => setData('building_id', Number(e.target.value))}
                                >
                                    <option value="">Select Building</option>
                                    {buildings.map((building) => (
                                        <option key={building.id} value={building.id}>
                                            {building.name} ({building.code})
                                        </option>
                                    ))}
                                </select>

                                {errors.building_id && <p className="mt-1 text-xs text-red-500">{errors.building_id}</p>}
                            </div>

                            {/* UNIT/DEPARTMENT*/}
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Unit/Department</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.unit_or_department_id}
                                    onChange={(e) => setData('unit_or_department_id', Number(e.target.value))}
                                >
                                    <option value="">Select Unit/Department</option>
                                    {unitOrDepartments.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.code} - {unit.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.unit_or_department_id && <p className="mt-1 text-xs text-red-500">{errors.unit_or_department_id}</p>}
                            </div>

                             {/* BUILING-ROOM*/}
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Room</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.building_room_id}
                                    onChange={(e) => setData('building_room_id', Number(e.target.value))}
                                    disabled={!data.building_id}
                                >
                                    <option value="">Select Room</option>
                                    {filteredRooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            {room.room}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Divider */}
                            <div className="col-span-2 border-t"></div>
                                    <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Actual Date of Schedule</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border p-2"
                                    value={data.actual_date_of_schedule}
                                    onChange={(e) => setData('actual_date_of_schedule', e.target.value)}
                                />

                                {/* wala akong request form dito dapat may error message to */}
                                {errors.actual_date_of_schedule && <p className="mt-1 text-xs text-red-500">{errors.actual_date_of_schedule}</p>}
                            </div>









                            {/* Footer Buttons */}
                            {/* <div className="col-span-2 flex justify-end gap-2 border-t pt-4"> // border t for horizontal-line */}
                              <div className="col-span-2 flex justify-end gap-2  pt-4">
                                <Button variant="secondary" type="button" onClick={() => setShowAddScheduleInventory(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Add Schedule
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
