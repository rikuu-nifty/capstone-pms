import { PickerInput } from '@/components/picker-input';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { DeleteScheduleModal } from '@/pages/inventory-scheduling/delete-inventory-scheduling';
import { EditInventorySchedulingModal } from '@/pages/inventory-scheduling/edit-inventory-scheduling';
import { ViewScheduleModal } from '@/pages/inventory-scheduling/view-inventory-scheduling';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { type VariantProps } from 'class-variance-authority';
import { Eye, Filter, Grid, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Scheduling',
        href: '/inventory-scheduling',
    },
];

export type ApprovalStep = {
    id: number;
    code: string; // "vp_admin", "pmo_head"
    status: 'pending' | 'approved' | 'rejected';
    acted_at?: string | null;
    actor?: { id: number; name: string } | null;
};

export type Approval = {
    id: number;
    form_type: string;
    status: 'pending_review' | 'approved' | 'rejected';
    steps: ApprovalStep[];
};

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
    role_name?: string;
};

// export type Account = {
//     id: number;
//     user_id: number;
//     fname: string;
//     lname: string;
//     email: string;
// };

export type Signatory = {
    role_key: string;
    name: string;
    title: string;
};

export type PagePropsWithViewing = {
    viewing?: Scheduled | null;
    auth: {
        user: User;
    };
    signatories: Record<string, Signatory>; // 👈 added
};

export type Scheduled = {
    id: number;
    prepared_by?: User | null; // 👈 add this
    building: Building | null;
    building_room?: BuildingRoom | null;
    unit_or_department: UnitOrDepartment | null;
    user?: User | null;
    designated_employee?: User | null;
    assigned_by?: User | null;
    inventory_schedule: string;
    actual_date_of_inventory: string;
    checked_by: string;
    verified_by: string;
    received_by: string;
    scheduling_status: string;
    description: string;
    approvals?: Approval[]; // 👈 add this
};

export type InventorySchedulingFormData = {
    building_id: number | string;
    building_room_id: number | string;
    unit_or_department_id: number | string;
    user_id: number | string;
    designated_employee: number | string;
    assigned_by: number | string;
    inventory_schedule: string;
    actual_date_of_inventory: string;
    checked_by: string;
    verified_by: string;
    received_by: string;
    scheduling_status: string;
    description: string;
};

export default function InventorySchedulingIndex({
    schedules = [],
    buildings = [],
    buildingRooms = [],
    unitOrDepartments = [],
    users = [],
}: {
    schedules: Scheduled[];
    buildings: Building[];
    buildingRooms: BuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
    users: User[];
}) {
    const { props } = usePage<PagePropsWithViewing>();
    const { signatories } = props; // 👈 extract signatories
    const currentUser = props.auth.user;

    const { data, setData, post, reset, processing, errors } = useForm<InventorySchedulingFormData>({
        building_id: '',
        building_room_id: '',
        unit_or_department_id: '',
        user_id: '',
        designated_employee: '',
        assigned_by: currentUser?.id ?? '',
        inventory_schedule: '',
        actual_date_of_inventory: '',
        checked_by: '',
        verified_by: '',
        received_by: '',

        scheduling_status: 'Pending_Review',
        description: '',
    });

    const [search, setSearch] = useState('');
    const [showAddScheduleInventory, setShowAddScheduleInventory] = useState(false);

    // Filter for Rooms
    const filteredRooms = buildingRooms.filter((room) => room.building_id === Number(data.building_id));

    const [selectedSchedule, setSelectedSchedule] = useState<Scheduled | null>(null);

    // For Modal (Edit)
    const [editModalVisible, setEditModalVisible] = useState(false);

    // For Modal (Delete)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // For Modal (View)
    const [viewModalVisible, setViewModalVisible] = useState(false);

    useEffect(() => {
        if (!props.viewing) return;
        setSelectedSchedule(props.viewing);
        setViewModalVisible(true);
    }, [props.viewing]);

    const closeView = () => {
        setViewModalVisible(false);
        setSelectedSchedule(null);

        if (/^\/?inventory-scheduling\/\d+\/view\/?$/.test(window.location.pathname)) {
            if (window.history.length > 1) {
                history.back();
            } else {
                router.visit(route('inventory-scheduling.index'), { replace: true, preserveScroll: true });
            }
        }
    };

    const handleActualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const d = e.target.value;
        setData('actual_date_of_inventory', d);
        if (d) {
            const [yyyy, mm] = d.split('-');
            setData('inventory_schedule', `${yyyy}-${mm}`);
        } else {
            setData('inventory_schedule', '');
        }
    };

    const setActualDateFromValue = (d: string) => {
        handleActualDateChange({ target: { value: d } } as unknown as React.ChangeEvent<HTMLInputElement>);
    };
    //Date Format for Month Only
    const formatMonth = (ym?: string) => {
        if (!ym) return '-';
        const d = new Date(`${ym}-01T00:00:00`);
        if (Number.isNaN(d.getTime())) return ym; // fallback if malformed
        // month only:
        return d.toLocaleString('en-US', { month: 'long' }); // "August"
        // if you want "August 2025":
        // return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    };

    // For Date  MM-DD-YYYY
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

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
        `${item.building?.name ?? ''} ${item.unit_or_department?.name ?? ''}`.toLowerCase().includes(search.toLowerCase()),
    );

    const schedulingStatusMap: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
        Pending_Review: 'Pending_Review',
        Pending: 'Pending',
        Completed: 'Completed',
        Overdue: 'Overdue',
        Cancelled: 'Cancelled',
    };

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
                    <Table className="w-full table-auto">
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="min-w-[160px] text-center">Building</TableHead>
                                <TableHead className="min-w-[260px] text-center">Unit/Dept/Laboratories</TableHead>
                                <TableHead className="min-w-[140px] text-center">Inventory Schedule</TableHead>
                                <TableHead className="min-w-[180px] text-center">Actual Date of Inventory</TableHead>
                                <TableHead className="w-[140px] text-center">Checked By</TableHead>
                                <TableHead className="w-[140px] text-center">Verified By</TableHead>
                                <TableHead className="w-[140px] text-center">Inventory Copy Received By</TableHead>
                                <TableHead className="min-w-[120px] text-center">Status</TableHead>
                                <TableHead className="min-w-[140px] text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filtered.map((item) => (
                                <TableRow key={item.id} className="text-center">
                                    <TableCell className="whitespace-nowrap">{item.id}</TableCell>
                                    <TableCell className="whitespace-nowrap">{item.building?.name ?? '—'}</TableCell>

                                    {/* truncate long department names, keep header aligned */}
                                    <TableCell>
                                        <span
                                            className="block overflow-hidden text-ellipsis whitespace-nowrap"
                                            title={
                                                item.unit_or_department ? `${item.unit_or_department.name} (${item.unit_or_department.code})` : '—'
                                            }
                                        >
                                            {item.unit_or_department ? `${item.unit_or_department.name} (${item.unit_or_department.code})` : '—'}
                                        </span>
                                    </TableCell>

                                    {/* prevent wrap so months don't split */}
                                    <TableCell className="whitespace-nowrap">{formatMonth(item.inventory_schedule) ?? '—'}</TableCell>

                                    <TableCell className="whitespace-nowrap">{formatDate(item.actual_date_of_inventory) ?? '—'}</TableCell>

                                    <TableCell className="w-[140px] whitespace-nowrap">{item.checked_by ?? '—'}</TableCell>
                                    <TableCell className="w-[140px] whitespace-nowrap">{item.verified_by ?? '—'}</TableCell>
                                    <TableCell className="w-[140px] whitespace-nowrap">{item.received_by ?? '—'}</TableCell>

                                    <TableCell className="text-center align-middle">
                                        <Badge variant={schedulingStatusMap[item.scheduling_status] ?? 'default'}>
                                            {item.scheduling_status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    setSelectedSchedule(item);
                                                    setEditModalVisible(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    setSelectedSchedule(item);
                                                    setDeleteModalVisible(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>

                                            {/* <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                    setSelectedSchedule(item);
                                    setViewModalVisible(true);
                                }}
                            >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </Button> */}

                                            <Button size="icon" variant="ghost" asChild>
                                                <Link href={route('inventory-scheduling.view', item.id)} preserveScroll>
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {editModalVisible && selectedSchedule && (
                <EditInventorySchedulingModal
                    schedule={selectedSchedule}
                    onClose={() => {
                        setEditModalVisible(false);
                        setSelectedSchedule(null);
                    }}
                    buildings={buildings}
                    buildingRooms={buildingRooms}
                    unitOrDepartments={unitOrDepartments}
                    users={users}
                    statusOptions={['Completed', 'Pending', 'Overdue', 'Cancelled', 'Pending_Review']}
                />
            )}

            {deleteModalVisible && selectedSchedule && (
                <DeleteScheduleModal
                    schedule={selectedSchedule}
                    onClose={() => {
                        setDeleteModalVisible(false);
                        setSelectedSchedule(null);
                    }}
                    onDelete={(id) => {
                        router.delete(`/inventory-scheduling/${id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setDeleteModalVisible(false);
                                setSelectedSchedule(null);
                            },
                            onError: (err) => {
                                console.error('Failed to delete schedule:', err);
                            },
                        });
                    }}
                />
            )}

            {/* {viewModalVisible && selectedSchedule && (
                <ViewScheduleModal
                    schedule={selectedSchedule}
                    onClose={() => {
                        setViewModalVisible(false);
                        setSelectedSchedule(null);
                    }}
                />
            )} */}

            {viewModalVisible && selectedSchedule && (
                <ViewScheduleModal
                    schedule={selectedSchedule}
                    onClose={closeView}
                    signatories={signatories} // 👈 fixed
                />
            )}

            {/* Side Panel Modal with Slide Effect (Schedule Inventory) */}
            <div className={`fixed inset-0 z-50 flex transition-all duration-300 ease-in-out ${showAddScheduleInventory ? 'visible' : 'invisible'}`}>
                <div
                    className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${showAddScheduleInventory ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setShowAddScheduleInventory(false)}
                ></div>

                {/* Slide-In Panel */}
                <div
                    className={`relative ml-auto flex h-screen w-full max-w-3xl transform flex-col overflow-hidden bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900 ${
                        showAddScheduleInventory ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Header */}
                    <div className="mb-4 flex shrink-0 items-center justify-between p-6">
                        <h2 className="text-xl font-semibold">Create Schedule Inventory</h2>
                        <button onClick={() => setShowAddScheduleInventory(false)} className="cursor-pointer text-2xl font-medium">
                            &times;
                        </button>
                    </div>

                    {/* Scrollable content — fields start at the top */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            {/* BUILDING */}
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

                            {/* UNIT/DEPARTMENT */}
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
                                            {unit.name} ({unit.code})
                                        </option>
                                    ))}
                                </select>
                                {errors.unit_or_department_id && <p className="mt-1 text-xs text-red-500">{errors.unit_or_department_id}</p>}
                            </div>

                            {/* ROOM */}
                            <div className="col-span-2">
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

                            {/* SPACE */}
                            <div className="col-span-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                {/* ACTUAL DATE OF SCHEDULE */}
                                <div className="col-span-1 pt-0.5">
                                    <label className="mb-1 block font-medium">Actual Date of Inventory</label>
                                    <PickerInput
                                        type="date"
                                        value={data.actual_date_of_inventory}
                                        onChange={setActualDateFromValue} // <- passes a string
                                    />
                                    {errors.actual_date_of_inventory && (
                                        <p className="mt-1 text-xs text-red-500">{errors.actual_date_of_inventory}</p>
                                    )}
                                </div>

                                {/* INVENTORY SCHEDULE (month only) */}
                                <div className="col-span-1 pt-0.5">
                                    <label className="mb-1 block font-medium">Inventory Schedule</label>
                                    <PickerInput
                                        type="month" // 👈 month picker
                                        value={data.inventory_schedule || ''} // expects "YYYY-MM"
                                        onChange={(v) => setData('inventory_schedule', v)}
                                    />
                                    {errors.inventory_schedule && <p className="mt-1 text-xs text-red-500">{errors.inventory_schedule}</p>}
                                </div>

                                {/* STATUS */}
                                <div className="col-span-1 pt-0.5">
                                    <label className="mb-1 block font-medium">Scheduling Status</label>
                                    <select
                                        className="w-full rounded-lg border p-2"
                                        value={data.scheduling_status}
                                        onChange={(e) => setData('scheduling_status', e.target.value)}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Pending_Review">Pending Review</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Overdue">Overdue</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    {errors.scheduling_status && <p className="mt-1 text-xs text-red-500">{errors.scheduling_status}</p>}
                                </div>

                                {/* ASSIGNED-BY {user_id}*/}
                                {/* <div className="col-span-1 pt-0.5">
                                    <label className="mb-1 block font-medium">Assigned By</label>
                                    <select
                                        className="w-full rounded-lg border p-2"
                                        value={data.assigned_by}
                                        onChange={(e) => setData('assigned_by', Number(e.target.value))}
                                    >
                                        <option value="">Select User</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assigned_by && <p className="mt-1 text-xs text-red-500">{errors.assigned_by}</p>}
                                </div> */}

                                {/* DESIGNATED-EMPLOYEE */}
                                {/* <div className="col-span-1 pt-0.5">
                                    <label className="mb-1 block font-medium">Designated Employee</label>
                                    <select
                                        className="w-full rounded-lg border p-2"
                                        value={data.designated_employee}
                                        onChange={(e) => setData('designated_employee', Number(e.target.value))}
                                    >
                                        <option value="">Select User</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.designated_employee && <p className="mt-1 text-xs text-red-500">{errors.designated_employee}</p>}
                                </div> */}

                                {/* CHECKED BY */}
                                <div className="col-span-1 pt-0.5">
                                    <label className="mb-1 block font-medium">Checked By</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border p-2"
                                        placeholder="Full Name of Checker"
                                        value={data.checked_by}
                                        onChange={(e) => setData('checked_by', e.target.value)}
                                    />
                                    {errors.checked_by && <p className="mt-1 text-xs text-red-500">{errors.checked_by}</p>}
                                </div>

                                {/* RECEIVED BY */}
                                <div className="col-span-1 pt-0.5">
                                    <label className="mb-1 block font-medium">Received By</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border p-2"
                                        placeholder="Full Name of Receiver"
                                        value={data.received_by}
                                        onChange={(e) => setData('received_by', e.target.value)}
                                    />
                                    {errors.received_by && <p className="mt-1 text-xs text-red-500">{errors.received_by}</p>}
                                </div>

                                {/* VERIFIED BY */}
                                <div className="col-span-1 pt-0.5">
                                    <label className="mb-1 block font-medium">Verified By</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border p-2"
                                        placeholder="Full Name of Verifier"
                                        value={data.verified_by}
                                        onChange={(e) => setData('verified_by', e.target.value)}
                                    />
                                    {errors.verified_by && <p className="mt-1 text-xs text-red-500">{errors.verified_by}</p>}
                                </div>
                            </div>

                            <div className="col-span-2 border-t"></div>
                            <div className="col-span-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                {/* DESCRIPTION */}
                                <div className="col-span-2">
                                    <label className="mb-1 block font-medium">Remarks</label>
                                    <textarea
                                        rows={15}
                                        className="w-full resize-none rounded-lg border p-2"
                                        placeholder="Enter Remarks"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="flex justify-end gap-2 border-t p-4">
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() => {
                                reset();
                                setShowAddScheduleInventory(false);
                            }}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>

                        <Button type="submit" onClick={handleSubmit} className="cursor-pointer" disabled={processing}>
                            Add Schedule
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
