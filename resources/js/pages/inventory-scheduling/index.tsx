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
import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Asset } from '../inventory-list';
import { Clock, CalendarClock, Ban, Timer } from 'lucide-react';
import { formatNumber } from '@/types/custom-index';

import { formatDate, type Building, type SubArea } from '@/types/custom-index';
import { validateScheduleForm } from '@/types/validateScheduleForm';
import BuildingItem from './BuildingItem';
import UnitItem from './UnitItem';
import WarningModal from './WarningModal';

import Pagination, { PageInfo } from '@/components/Pagination';
import InventorySchedulingFilterDropdown from '@/components/filters/InventorySchedulingFilterDropdown';

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

// export type Building = {
//     id: number;
//     name: string;
//     code: string | number;
//     description: string;
// };

// export type BuildingRoom = {
//     id: number;
//     building_id: number;
//     room: string | number;
//     description: string;
// };

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

    role?: {
        id: number;
        name: string;
        code: string;
    } | null;
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
    signatories: Record<string, Signatory>;
    totals?: SchedulingTotals;
};

export type ScheduledAsset = {
    id: number;
    inventory_list_id: number;
    inventory_status: string;
    remarks?: string;
    inventoried_at?: string;
    asset: Asset;
};

export type Scheduled = {
    id: number;
    prepared_by?: User | null;
    user?: User | null;
    designated_employee?: User | null;
    assigned_by?: User | null;

    // legacy version - single association
    building: Building | null;
    building_room?: SchedulingBuildingRoom | null;
    unit_or_department: UnitOrDepartment | null;

    inventory_schedule: string;
    actual_date_of_inventory: string;
    checked_by: string;
    verified_by: string;
    received_by: string;
    scheduling_status: string;
    description: string;

    approvals?: Approval[];
    isFullyApproved?: boolean;

    // new pivot associations
    buildings?: Building[];
    rooms?: SchedulingBuildingRoom[];
    sub_areas?: SubArea[];
    units?: UnitOrDepartment[];

    assets_count?: number;
    scope_type: 'unit' | 'building';

    assets?: ScheduledAsset[];
};

export type SchedulingBuildingRoom = {
    id: number;
    building_id: number;
    room: string | number;
    description?: string;
    sub_areas?: SubArea[];
};

export type InventorySchedulingFormData = {
    scope_type: 'unit' | 'building';
    unit_ids: number[];
    building_ids: number[];
    room_ids: number[];
    sub_area_ids: number[];

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

    scheduled_assets: number[];
};

export type SchedulingTotals = {
    on_time_completion_rate: number;
    overdue_last_month: number;
    pending_next_30_days: number;
    cancellation_rate: number;
    avg_delay_days: number;
};

export default function InventorySchedulingIndex({
    schedules = [],
    assets = [], // default empty array
    buildings = [],
    buildingRooms = [],
    unitOrDepartments = [],
    users = [],
}: {
    schedules: Scheduled[];
    viewing?: Scheduled; // may exist when opening View modal
    assets?: Asset[]; // fixed type         // new, will be passed for view modal
    buildings: Building[];
    buildingRooms: SchedulingBuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
    users: User[];
}) {
    const { props } = usePage<PagePropsWithViewing>();
    const { signatories, totals } = props; // extract signatories
    const currentUser = props.auth.user;

    const { data, setData, post, reset, processing, errors, setError, clearErrors } = useForm<InventorySchedulingFormData>({
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

        scope_type: 'unit',
        unit_ids: [],
        building_ids: [],
        room_ids: [],
        sub_area_ids: [],
        scheduled_assets: [],
    });

    const [search, setSearch] = useState('');
    const [showAddScheduleInventory, setShowAddScheduleInventory] = useState(false);

    // Filter for Rooms
    // const filteredRooms = buildingRooms.filter((room) => room.building_id === Number(data.building_id));

    const [selectedSchedule, setSelectedSchedule] = useState<Scheduled | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);

    const [warningVisible, setWarningVisible] = useState(false);
    const [warningMessage, setWarningMessage] = useState<React.ReactNode>('');
    const [warningDetails, setWarningDetails] = useState<string[]>([]);

    const [selected_status, setSelectedStatus] = useState('');
    const [selected_inventory_month, setSelectedInventoryMonth] = useState('');
    const [selected_actual_date, setSelectedActualDate] = useState('');

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => {
        setPage(1);
    }, [search]);
    
    useEffect(() => {
        if (!props.viewing) return;
        setSelectedSchedule(props.viewing);
        setViewModalVisible(true);
    }, [props.viewing]);

    const applyFilters = (f: { status: string; inventory_month: string; actual_date: string }) => {
        setSelectedStatus(f.status);
        setSelectedInventoryMonth(f.inventory_month);
        setSelectedActualDate(f.actual_date);
    };

    const clearFilters = () => {
        setSelectedStatus('');
        setSelectedInventoryMonth('');
        setSelectedActualDate('');
    };

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
    // const formatDate = (dateStr: string) => {
    //     if (!dateStr) return '';
    //     return new Date(dateStr).toLocaleDateString('en-US', {
    //         year: 'numeric',
    //         month: 'long',
    //         day: 'numeric',
    //     });
    // };
    const [unitSelections, setUnitSelections] = useState({
        unit_ids: [] as number[],
        building_ids: [] as number[],
        room_ids: [] as number[],
        sub_area_ids: [] as number[],
        expanded: [] as number[], // ✅ track expanded unit IDs
    });

    const [buildingSelections, setBuildingSelections] = useState({
        building_ids: [] as number[],
        room_ids: [] as number[],
        sub_area_ids: [] as number[],
        expanded: [] as number[], // ✅ track expanded building IDs
    });

    const [expandedUnits, setExpandedUnits] = useState<number[]>([]);
    const [expandedBuildings, setExpandedBuildings] = useState<number[]>([]);
    const [pendingSubmit, setPendingSubmit] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanRoomIds = (data.room_ids ?? []).filter((id) => !!id);

        if (data.scope_type === 'unit') {
            if (data.unit_ids.length === 0) {
                setError('unit_ids', 'You must select at least one unit/department.');
                return;
            }

            // validate that at least one room belongs to chosen units
            const unitRoomIds = buildingRooms
                .filter((r) =>
                    assets.some((a) => a.unit_or_department_id && data.unit_ids.includes(a.unit_or_department_id) && a.building_room_id === r.id),
                )
                .map((r) => r.id);

            const hasUnitRoom = cleanRoomIds.some((rid) => unitRoomIds.includes(rid));
            if (!hasUnitRoom) {
                setError('room_ids', 'You must select at least one room from the chosen unit(s).');
                return;
            }
        }

        if (data.scope_type === 'building') {
            if (data.building_ids.length === 0) {
                setError('building_ids', 'You must select at least one building.');
                return;
            }
            if (cleanRoomIds.length === 0) {
                setError('room_ids', 'You must select at least one room for the selected building(s).');
                return;
            }
        }

        clearErrors('unit_ids');
        clearErrors('building_ids');
        clearErrors('room_ids');

        const result = validateScheduleForm(data, assets, unitOrDepartments, buildings, buildingRooms);

        if (!result.valid) {
            setWarningMessage(result.message ?? 'Validation warning.');
            setWarningDetails(result.details ?? []);
            setWarningVisible(true);
            setPendingSubmit(true); // remember we need to proceed
            return;
        }

        doSubmit();
    };

    const doSubmit = () => {
        post('/inventory-scheduling', {
            onSuccess: () => {
                reset();
                setShowAddScheduleInventory(false);
            },
        });
    };

    // const filtered = schedules.filter((item) =>
    //     `${item.building?.name ?? ''} ${item.unit_or_department?.name ?? ''}`.toLowerCase().includes(search.toLowerCase()),
    // );

    const filtered = schedules.filter((item) => {
        const haystack = `
            ${item.id}
            ${item.checked_by ?? ''}
            ${item.verified_by ?? ''}
            ${item.scheduling_status ?? ''}
        `.toLowerCase();

        const matchesSearch = !search || haystack.includes(search.toLowerCase());
        const matchesStatus = !selected_status || item.scheduling_status === selected_status;

        // compare YYYY-MM with inventory_schedule
        const matchesMonth =
            !selected_inventory_month ||
            item.inventory_schedule?.startsWith(selected_inventory_month);

        // compare YYYY-MM-DD with actual_date_of_inventory
        const matchesActualDate =
            !selected_actual_date ||
            item.actual_date_of_inventory === selected_actual_date;

        return matchesSearch && matchesStatus && matchesMonth && matchesActualDate;
    });

    const schedulingStatusMap: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
        Pending_Review: 'Pending_Review',
        Pending: 'Pending',
        Completed: 'Completed',
        Overdue: 'Overdue',
        Cancelled: 'Cancelled',
    };
    
    const start = (page - 1) * PAGE_SIZE;
    const page_items = filtered.slice(start, start + PAGE_SIZE);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Scheduling" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Inventory Scheduling</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and monitor scheduled inventory checks by room and department.
                    </p>
                </div>

                {totals && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                        {/* On-Time Completion */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <Clock className="h-7 w-7 text-green-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">On-Time Completion (This Month)</div>
                                <div className="text-3xl font-bold">{totals.on_time_completion_rate}%</div>
                            </div>
                        </div>

                        {/* Overdue Last Month */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                <CalendarClock className="h-7 w-7 text-red-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Last Month's Overdue</div>
                                <div className="text-3xl font-bold">{formatNumber(totals.overdue_last_month)}</div>
                            </div>
                        </div>

                        {/* Pending Next 30 Days */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100">
                                <Clock className="h-7 w-7 text-sky-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Pending (Next 30 Days)</div>
                                <div className="text-3xl font-bold">{formatNumber(totals.pending_next_30_days)}</div>
                            </div>
                        </div>

                        {/* Cancellation Rate */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                                <Ban className="h-7 w-7 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Cancellation Rate</div>
                                <div className="text-3xl font-bold">{totals.cancellation_rate}%</div>
                            </div>
                        </div>

                        {/* Average Delay */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                <Timer className="h-7 w-7 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Avg Delay (Days)</div>
                                <div className="text-3xl font-bold">{totals.avg_delay_days} days</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 w-96">
                        <Input
                        type="text"
                        placeholder="Search by building, department, or status..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-xs"
                        />
                    </div>

                    <div className="flex gap-2">
                        <InventorySchedulingFilterDropdown
                            onApply={applyFilters}
                            onClear={clearFilters}
                            selected_status={selected_status}
                            selected_inventory_month={selected_inventory_month}
                            selected_actual_date={selected_actual_date}
                        />

                        <Button onClick={() => setShowAddScheduleInventory(true)} className="cursor-pointer">
                            <PlusCircle className="mr-1 h-4 w-4" /> Schedule Inventory
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table className="w-full table-auto">
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Inventory Schedule</TableHead>
                                <TableHead className="text-center">Actual Date of Inventory</TableHead>
                                <TableHead className="text-center">Checked By</TableHead>
                                <TableHead className="text-center">Verified By</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {/* {filtered.map((item) => ( */}
                             {page_items.length > 0 ? (
                                page_items.map((item) => (
                                <TableRow key={item.id} className="text-center">
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {formatMonth(item.inventory_schedule) || '—'}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {item.actual_date_of_inventory
                                            ? formatDate(item.actual_date_of_inventory)
                                            : '—'}
                                    </TableCell>
                                    <TableCell>{item.checked_by || '—'}</TableCell>
                                    <TableCell>{item.verified_by || '—'}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={schedulingStatusMap[item.scheduling_status] ?? 'default'}
                                        >
                                            {item.scheduling_status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>

                                    {/* Actions */}
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

                                            <Button size="icon" variant="ghost" asChild>
                                                <Link
                                                    href={route('inventory-scheduling.view', item.id)}
                                                    preserveScroll
                                                >
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                                    No schedules found.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between mt-3">
                    <PageInfo
                        page={page}
                        total={filtered.length}
                        pageSize={PAGE_SIZE}
                        label="Inventory Schedule records"
                    />
                    <Pagination
                        page={page}
                        total={filtered.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
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
                    // statusOptions={['Completed', 'Pending', 'Overdue', 'Cancelled', 'Pending_Review']}
                    statusOptions={
                        selectedSchedule.scheduling_status === 'Pending_Review'
                        ? ['Pending_Review'] // only show this if it hasn’t been approved
                        : ['Pending', 'Overdue', 'Completed', 'Cancelled'] // no Pending_Review allowed
                    }
                    assets={assets}
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

            {viewModalVisible && selectedSchedule && (
                <ViewScheduleModal
                    schedule={selectedSchedule}
                    assets={assets ?? []} // pass assets safely
                    // onClose={closeView}
                    signatories={signatories}
                    onClose={() => {
                        closeView();
                        setTimeout(() => {
                            router.visit(route('inventory-scheduling.index'), {
                                replace: true,
                                preserveScroll: true,
                                preserveState: false,
                            });
                        }, 200);
                    }}
                />
            )}

            {/* Side Panel Modal with Slide Effect (Schedule Inventory) */}
            <div className={`fixed inset-0 z-50 flex transition-all duration-300 ease-in-out ${showAddScheduleInventory ? 'visible' : 'invisible'}`}>
                {/* Overlay */}
                <div
                    className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${showAddScheduleInventory ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => {
                        reset();
                        setShowAddScheduleInventory(false);
                    }}
                />

                <div
                    className={`relative ml-auto flex h-screen w-full max-w-3xl transform flex-col overflow-hidden bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900 ${
                        showAddScheduleInventory ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Header */}
                    <div className="mb-4 flex shrink-0 items-center justify-between p-6">
                        <h2 className="text-xl font-semibold">Create Inventory Scheduling </h2>
                        <button onClick={() => setShowAddScheduleInventory(false)} className="cursor-pointer text-2xl font-medium">
                            &times;
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto px-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            {/* Scope Type */}
                            <div className="col-span-2">
                                <label className="mb-2 block font-medium">Scope Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* By Units / Departments */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Save building selections + expanded buildings
                                            setBuildingSelections({
                                                building_ids: data.building_ids,
                                                room_ids: data.room_ids,
                                                sub_area_ids: data.sub_area_ids,
                                                expanded: expandedBuildings, // ✅ save current expanded buildings
                                            });

                                            // Restore unit selections + expanded units
                                            setData((prev) => ({
                                                ...prev,
                                                scope_type: 'unit',
                                                unit_ids: unitSelections.unit_ids,
                                                building_ids: unitSelections.building_ids,
                                                room_ids: unitSelections.room_ids,
                                                sub_area_ids: unitSelections.sub_area_ids,
                                            }));
                                            setExpandedUnits(unitSelections.expanded ?? []); // ✅ restore expanded units

                                            clearErrors('unit_ids');
                                            clearErrors('building_ids');
                                            clearErrors('room_ids');
                                        }}
                                        className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-medium transition ${
                                            data.scope_type === 'unit'
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        By Units / Departments
                                    </button>

                                    {/* By Buildings */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Save unit selections + expanded units
                                            setUnitSelections({
                                                unit_ids: data.unit_ids,
                                                building_ids: data.building_ids,
                                                room_ids: data.room_ids,
                                                sub_area_ids: data.sub_area_ids,
                                                expanded: expandedUnits, // ✅ save current expanded units
                                            });

                                            // Restore building selections + expanded buildings
                                            setData((prev) => ({
                                                ...prev,
                                                scope_type: 'building',
                                                building_ids: buildingSelections.building_ids,
                                                room_ids: buildingSelections.room_ids,
                                                sub_area_ids: buildingSelections.sub_area_ids,
                                                unit_ids: [], // usually empty when scoping by building
                                            }));
                                            setExpandedBuildings(buildingSelections.expanded ?? []); // ✅ restore expanded buildings

                                            clearErrors('unit_ids');
                                            clearErrors('building_ids');
                                            clearErrors('room_ids');
                                        }}
                                        className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-medium transition ${
                                            data.scope_type === 'building'
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        By Buildings
                                    </button>
                                </div>
                            </div>

                            {/* Units Section */}
                            {data.scope_type === 'unit' && (
                                <div className="col-span-2 flex flex-col gap-4">
                                    <label className="block font-medium">Units Selection</label>

                                    <Select
                                        className="w-full"
                                        options={unitOrDepartments
                                            .filter((u) => !data.unit_ids.includes(u.id))
                                            .map((u) => ({
                                                value: u.id,
                                                label: `${u.name} (${u.code})`,
                                            }))}
                                        placeholder="Add another unit..."
                                        value={null}
                                        onChange={(selected) => {
                                            if (selected) {
                                                const id = Number(selected.value);
                                                if (!data.unit_ids.includes(id)) {
                                                    // collect buildings, rooms, subareas tied to this unit
                                                    const unitAssets = assets.filter((a) => a.unit_or_department?.id === id);

                                                    const unitBuildingIds = [
                                                        ...new Set(unitAssets.map((a) => a.building?.id).filter((b): b is number => !!b)),
                                                    ];

                                                    const unitRoomIds = [
                                                        ...new Set(unitAssets.map((a) => a.building_room_id).filter((r): r is number => !!r)),
                                                    ];

                                                    const unitSubAreaIds = [
                                                        ...new Set(unitAssets.map((a) => a.sub_area_id).filter((sa): sa is number => !!sa)),
                                                    ];

                                                    setData({
                                                        ...data,
                                                        unit_ids: [...data.unit_ids, id],
                                                        building_ids: [...new Set([...data.building_ids, ...unitBuildingIds])],
                                                        room_ids: [...new Set([...data.room_ids, ...unitRoomIds])],
                                                        sub_area_ids: [...new Set([...data.sub_area_ids, ...unitSubAreaIds])],
                                                    });
                                                }
                                            }
                                        }}
                                    />
                                    {errors.unit_ids && <p className="mt-1 text-xs text-red-500">{String(errors.unit_ids)}</p>}

                                    {data.unit_ids.map((uid) => {
                                        const unit = unitOrDepartments.find((u) => u.id === uid);
                                        if (!unit) return null;

                                        const unitAssets = assets.filter((a) => a.unit_or_department?.id === uid);

                                        // derive related buildings
                                        const unitBuildings: Building[] = [
                                            ...new Map(
                                                unitAssets
                                                    .map((a) => a.building)
                                                    .filter((b): b is Building => b !== null && b !== undefined)
                                                    .map((b) => [b.id, b]),
                                            ).values(),
                                        ];

                                        // derive related rooms
                                        const unitRooms: SchedulingBuildingRoom[] = [
                                            ...new Map(
                                                unitAssets
                                                    .map((a) => a.building_room as unknown as SchedulingBuildingRoom | null)
                                                    .filter((r): r is SchedulingBuildingRoom => r !== null && r !== undefined)
                                                    .map((r) => [r.id, r]),
                                            ).values(),
                                        ];

                                        // derive related subareas
                                        const unitSubAreas: SubArea[] = [
                                            ...new Map(
                                                unitAssets
                                                    .map((a) => a.sub_area)
                                                    .filter((sa): sa is SubArea => sa !== null && sa !== undefined)
                                                    .map((sa) => [sa.id, sa]),
                                            ).values(),
                                        ];

                                        return (
                                            <UnitItem
                                                key={uid}
                                                unit={unit}
                                                assets={unitAssets}
                                                buildings={unitBuildings}
                                                rooms={unitRooms}
                                                subAreas={unitSubAreas}
                                                selectedBuildings={data.building_ids}
                                                selectedRooms={data.room_ids}
                                                selectedSubAreas={data.sub_area_ids}
                                                expanded={expandedUnits.includes(uid)}
                                                onToggleExpand={() => {
                                                    setExpandedUnits((prev) => {
                                                        const next = prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid];
                                                        setUnitSelections((sel) => ({ ...sel, expanded: next })); // ✅ persist expanded state
                                                        return next;
                                                    });
                                                }}
                                                onToggleBuilding={(buildingId, checked) => {
                                                    const roomsForBuilding = buildingRooms.filter(
                                                        (r: SchedulingBuildingRoom) => r.building_id === buildingId,
                                                    );
                                                    const subAreasForBuilding = roomsForBuilding.flatMap((r) =>
                                                        (r.sub_areas ?? []).map((sa: SubArea) => sa.id),
                                                    );

                                                    setData((prev) => {
                                                        let nextRooms: number[];
                                                        let nextSubs: number[];
                                                        let nextBuildings: number[];

                                                        if (checked) {
                                                            nextRooms = Array.from(new Set([...prev.room_ids, ...roomsForBuilding.map((r) => r.id)]));
                                                            nextSubs = Array.from(new Set([...prev.sub_area_ids, ...subAreasForBuilding]));
                                                            nextBuildings = prev.building_ids.includes(buildingId)
                                                                ? prev.building_ids
                                                                : [...prev.building_ids, buildingId];
                                                        } else {
                                                            nextRooms = prev.room_ids.filter((id) => !roomsForBuilding.map((r) => r.id).includes(id));
                                                            nextSubs = prev.sub_area_ids.filter((id) => !subAreasForBuilding.includes(id));
                                                            nextBuildings = prev.building_ids.filter((id) => id !== buildingId);
                                                        }

                                                        return {
                                                            ...prev,
                                                            room_ids: nextRooms,
                                                            sub_area_ids: nextSubs,
                                                            building_ids: nextBuildings,
                                                        };
                                                    });
                                                }}
                                                onToggleRoom={(roomId, buildingId, checked) => {
                                                    const room = buildingRooms.find((r) => r.id === roomId);
                                                    const subAreaIds = room?.sub_areas?.map((sa) => sa.id) ?? [];

                                                    setData((prev) => {
                                                        const hasRoom = prev.room_ids.includes(roomId);
                                                        const nextRooms = checked
                                                            ? hasRoom
                                                                ? prev.room_ids
                                                                : [...prev.room_ids, roomId]
                                                            : prev.room_ids.filter((id) => id !== roomId);

                                                        const nextSubs = checked
                                                            ? Array.from(new Set([...prev.sub_area_ids, ...subAreaIds]))
                                                            : prev.sub_area_ids.filter((id) => !subAreaIds.includes(id));

                                                        const buildingRoomIds = buildingRooms
                                                            .filter((r) => r.building_id === buildingId)
                                                            .map((r) => r.id);
                                                        const stillHasRooms = buildingRoomIds.some((id) => nextRooms.includes(id));

                                                        const nextBuildings = checked
                                                            ? prev.building_ids.includes(buildingId)
                                                                ? prev.building_ids
                                                                : [...prev.building_ids, buildingId]
                                                            : stillHasRooms
                                                              ? prev.building_ids
                                                              : prev.building_ids.filter((id) => id !== buildingId);

                                                        return {
                                                            ...prev,
                                                            room_ids: nextRooms,
                                                            sub_area_ids: nextSubs,
                                                            building_ids: nextBuildings,
                                                        };
                                                    });
                                                }}
                                                onToggleSubArea={(subAreaId, roomId, buildingId, checked) => {
                                                    setData((prev) => {
                                                        let updatedSubAreas: number[];

                                                        if (!checked) {
                                                            updatedSubAreas = prev.sub_area_ids.filter((id) => id !== subAreaId);
                                                            return {
                                                                ...prev,
                                                                sub_area_ids: updatedSubAreas,
                                                            };
                                                        } else {
                                                            updatedSubAreas = prev.sub_area_ids.includes(subAreaId)
                                                                ? prev.sub_area_ids
                                                                : [...prev.sub_area_ids, subAreaId];

                                                            return {
                                                                ...prev,
                                                                sub_area_ids: updatedSubAreas,
                                                                room_ids: prev.room_ids.includes(roomId) ? prev.room_ids : [...prev.room_ids, roomId],
                                                                building_ids: prev.building_ids.includes(buildingId)
                                                                    ? prev.building_ids
                                                                    : [...prev.building_ids, buildingId],
                                                            };
                                                        }
                                                    });
                                                }}
                                                onRemove={() => {
                                                    // derive related assets
                                                    const unitAssets = assets.filter((a) => a.unit_or_department?.id === uid);

                                                    const buildingsToRemove = [
                                                        ...new Map(
                                                            unitAssets
                                                                .map((a) => a.building)
                                                                .filter((b): b is Building => b !== null && b !== undefined)
                                                                .map((b) => [b.id, b]),
                                                        ).values(),
                                                    ].map((b) => b.id);

                                                    // collect related rooms
                                                    const roomsToRemove = [
                                                        ...new Map(
                                                            unitAssets
                                                                .map((a) => a.building_room as SchedulingBuildingRoom | null)
                                                                .filter((r): r is SchedulingBuildingRoom => r !== null)
                                                                .map((r) => [r.id, r]),
                                                        ).values(),
                                                    ].map((r) => r.id);

                                                    // collect related sub-areas
                                                    const subAreasToRemove = [
                                                        ...new Map(
                                                            unitAssets
                                                                .map((a) => a.sub_area)
                                                                .filter((sa): sa is SubArea => sa !== null && sa !== undefined)
                                                                .map((sa) => [sa.id, sa]),
                                                        ).values(),
                                                    ].map((sa) => sa.id);

                                                    // update state
                                                    setData(
                                                        'unit_ids',
                                                        data.unit_ids.filter((id) => id !== uid),
                                                    );
                                                    setData(
                                                        'building_ids',
                                                        data.building_ids.filter((id) => !buildingsToRemove.includes(id)),
                                                    );
                                                    setData(
                                                        'room_ids',
                                                        data.room_ids.filter((id) => !roomsToRemove.includes(id)),
                                                    );
                                                    setData(
                                                        'sub_area_ids',
                                                        data.sub_area_ids.filter((id) => !subAreasToRemove.includes(id)),
                                                    );
                                                }}
                                                onClearAll={() => {
                                                    const unitBuildingIds = unitBuildings.map((b) => b.id);
                                                    const unitRoomIds = unitRooms.map((r) => r.id);
                                                    const unitSubAreaIds = unitSubAreas.map((sa) => sa.id);

                                                    setData({
                                                        ...data,
                                                        building_ids: data.building_ids.filter((id) => !unitBuildingIds.includes(id)),
                                                        room_ids: data.room_ids.filter((id) => !unitRoomIds.includes(id)),
                                                        sub_area_ids: data.sub_area_ids.filter((id) => !unitSubAreaIds.includes(id)),
                                                    });
                                                }}
                                                onSelectAll={() => {
                                                    const unitBuildingIds = unitBuildings.map((b) => b.id);
                                                    const unitRoomIds = unitRooms.map((r) => r.id);
                                                    const unitSubAreaIds = unitSubAreas.map((sa) => sa.id);

                                                    setData({
                                                        ...data,
                                                        building_ids: Array.from(new Set([...data.building_ids, ...unitBuildingIds])),
                                                        room_ids: Array.from(new Set([...data.room_ids, ...unitRoomIds])),
                                                        sub_area_ids: Array.from(new Set([...data.sub_area_ids, ...unitSubAreaIds])),
                                                    });
                                                }}
                                            />
                                        );
                                    })}
                                    {errors.room_ids && <p className="mt-1 text-xs text-red-500">{String(errors.room_ids)}</p>}
                                </div>
                            )}

                            {/* Buildings Section */}
                            {data.scope_type === 'building' && (
                                <div className="col-span-2 flex flex-col gap-4">
                                    <label className="block font-medium">Buildings Selection</label>

                                    <Select
                                        className="w-full"
                                        options={buildings
                                            .filter((b) => !data.building_ids.includes(b.id))
                                            .map((b) => ({
                                                value: b.id,
                                                label: `${b.name} (${b.code})`,
                                            }))}
                                        placeholder="Add another building..."
                                        value={null}
                                        onChange={(selected) => {
                                            if (selected) {
                                                const id = Number(selected.value);

                                                if (!data.building_ids.includes(id)) {
                                                    // Get all rooms for this building
                                                    const rooms = buildingRooms.filter((r) => r.building_id === id);

                                                    // Collect all sub areas from those rooms
                                                    const subAreas = rooms.flatMap((r) => r.sub_areas ?? []);

                                                    setData('building_ids', [...data.building_ids, id]);
                                                    setData('room_ids', [
                                                        ...data.room_ids,
                                                        ...rooms.map((r) => r.id).filter((rid) => !data.room_ids.includes(rid)),
                                                    ]);
                                                    setData('sub_area_ids', [
                                                        ...data.sub_area_ids,
                                                        ...subAreas.map((sa) => sa.id).filter((sid) => !data.sub_area_ids.includes(sid)),
                                                    ]);
                                                }
                                            }
                                        }}
                                    />
                                    {errors.building_ids && <p className="mt-1 text-xs text-red-500">{String(errors.building_ids)}</p>}

                                    {/* Selected buildings */}
                                    <div className="flex flex-col gap-3">
                                        {data.building_ids.map((bid) => {
                                            const building = buildings.find((b) => b.id === bid);
                                            if (!building) return null;

                                            const rooms = buildingRooms.filter((r) => r.building_id === bid);

                                            return (
                                                <BuildingItem
                                                    key={bid}
                                                    building={building}
                                                    rooms={rooms}
                                                    assets={assets}
                                                    selectedRooms={data.room_ids}
                                                    selectedSubAreas={data.sub_area_ids}
                                                    expanded={expandedBuildings.includes(bid)}
                                                    onToggleExpand={() => {
                                                        setExpandedBuildings((prev) => {
                                                            const next = prev.includes(bid) ? prev.filter((id) => id !== bid) : [...prev, bid];
                                                            setBuildingSelections((sel) => ({ ...sel, expanded: next })); // ✅ persist expanded state
                                                            return next;
                                                        });
                                                    }}
                                                    onToggleRoom={(roomId, buildingId, checked) => {
                                                        const room = buildingRooms.find((r) => r.id === roomId);
                                                        const subAreaIds = room?.sub_areas?.map((sa) => sa.id) ?? [];

                                                        setData((prev) => {
                                                            const hasRoom = prev.room_ids.includes(roomId);

                                                            const nextRooms = checked
                                                                ? hasRoom
                                                                    ? prev.room_ids
                                                                    : [...prev.room_ids, roomId]
                                                                : prev.room_ids.filter((id) => id !== roomId);

                                                            const nextSubs = checked
                                                                ? Array.from(new Set([...prev.sub_area_ids, ...subAreaIds]))
                                                                : prev.sub_area_ids.filter((id) => !subAreaIds.includes(id));

                                                            const nextBuildings = checked
                                                                ? prev.building_ids.includes(buildingId)
                                                                    ? prev.building_ids
                                                                    : [...prev.building_ids, buildingId]
                                                                : prev.building_ids;

                                                            return {
                                                                ...prev,
                                                                room_ids: nextRooms,
                                                                sub_area_ids: nextSubs,
                                                                building_ids: nextBuildings,
                                                            };
                                                        });
                                                    }}
                                                    onToggleSubArea={(subAreaId, roomId, buildingId, checked) => {
                                                        setData((prev) => {
                                                            let updatedSubAreas: number[];

                                                            if (!checked) {
                                                                // remove just this subarea
                                                                updatedSubAreas = prev.sub_area_ids.filter((id) => id !== subAreaId);

                                                                // Do not touch the parent room (keeps leftover assets selectable)
                                                                return {
                                                                    ...prev,
                                                                    sub_area_ids: updatedSubAreas,
                                                                };
                                                            } else {
                                                                updatedSubAreas = prev.sub_area_ids.includes(subAreaId)
                                                                    ? prev.sub_area_ids
                                                                    : [...prev.sub_area_ids, subAreaId];

                                                                return {
                                                                    ...prev,
                                                                    sub_area_ids: updatedSubAreas,
                                                                    room_ids: prev.room_ids.includes(roomId)
                                                                        ? prev.room_ids
                                                                        : [...prev.room_ids, roomId],
                                                                    building_ids: prev.building_ids.includes(buildingId)
                                                                        ? prev.building_ids
                                                                        : [...prev.building_ids, buildingId],
                                                                };
                                                            }
                                                        });
                                                    }}
                                                    onRemove={() => {
                                                        // Remove building + its rooms + subareas
                                                        const roomsToRemove = buildingRooms.filter((r) => r.building_id === bid).map((r) => r.id);
                                                        const subAreasToRemove = buildingRooms
                                                            .filter((r) => r.building_id === bid)
                                                            .flatMap((r) => r.sub_areas ?? [])
                                                            .map((sa) => sa.id);

                                                        setData(
                                                            'building_ids',
                                                            data.building_ids.filter((id) => id !== bid),
                                                        );
                                                        setData(
                                                            'room_ids',
                                                            data.room_ids.filter((id) => !roomsToRemove.includes(id)),
                                                        );
                                                        setData(
                                                            'sub_area_ids',
                                                            data.sub_area_ids.filter((id) => !subAreasToRemove.includes(id)),
                                                        );
                                                    }}
                                                    onSelectAll={() => {
                                                        const buildingRoomIds = rooms.map((r) => r.id);
                                                        const buildingSubAreaIds = rooms.flatMap((r) => r.sub_areas?.map((sa) => sa.id) ?? []);

                                                        setData('room_ids', Array.from(new Set([...data.room_ids, ...buildingRoomIds])));
                                                        setData('sub_area_ids', Array.from(new Set([...data.sub_area_ids, ...buildingSubAreaIds])));
                                                    }}
                                                    onClearAll={() => {
                                                        const buildingRoomIds = rooms.map((r) => r.id);
                                                        const buildingSubAreaIds = rooms.flatMap((r) => r.sub_areas?.map((sa) => sa.id) ?? []);

                                                        setData(
                                                            'room_ids',
                                                            data.room_ids.filter((id) => !buildingRoomIds.includes(id)),
                                                        );
                                                        setData(
                                                            'sub_area_ids',
                                                            data.sub_area_ids.filter((id) => !buildingSubAreaIds.includes(id)),
                                                        );
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                    {errors.room_ids && <p className="mt-1 text-xs text-red-500">{String(errors.room_ids)}</p>}
                                </div>
                            )}

                            {/* Divider */}
                            <div className="col-span-2 border-t" />

                            <div className="col-span-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-medium">Inventory Schedule</label>
                                    <PickerInput
                                        type="month"
                                        value={data.inventory_schedule || ''}
                                        onChange={(v) => setData('inventory_schedule', v)}
                                    />
                                    {errors.inventory_schedule && <p className="mt-1 text-xs text-red-500">{String(errors.inventory_schedule)}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium">Scheduling Status</label>
                                    <select
                                        className="w-full rounded-lg border p-2"
                                        value={data.scheduling_status}
                                        onChange={(e) => setData('scheduling_status', e.target.value)}
                                    >
                                        <option value="Pending_Review">Pending Review</option>
                                        <option value="Pending" disabled>Pending</option>
                                        <option value="Overdue" disabled>Overdue</option>
                                        <option value="Completed" disabled>
                                            Completed
                                        </option>
                                        <option value="Cancelled" disabled>
                                            Cancelled
                                        </option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="mb-1 block font-medium">Designated Staff</label>
                                    <Select
                                        className="w-full"
                                        options={users.map((u) => ({
                                            value: u.id,
                                            label: `${u.name} (${u.role_name})`,
                                        }))}
                                        placeholder="Select designated staff..."
                                        value={
                                            users.find((u) => u.id === Number(data.designated_employee))
                                                ? {
                                                      value: Number(data.designated_employee),
                                                      label: users.find((u) => u.id === Number(data.designated_employee))?.name,
                                                  }
                                                : null
                                        }
                                        onChange={(selected) => {
                                            if (selected) {
                                                setData('designated_employee', selected.value);
                                            } else {
                                                setData('designated_employee', '');
                                            }
                                        }}
                                    />
                                    {errors.designated_employee && <p className="mt-1 text-xs text-red-500">{String(errors.designated_employee)}</p>}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="col-span-2 border-t" />

                            <div className="col-span-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-medium">Actual Date of Inventory</label>
                                    <PickerInput type="date" value={data.actual_date_of_inventory} onChange={setActualDateFromValue} />
                                </div>
                                <div>
                                    <label className="mb-1 block font-medium">Checked By</label>
                                    <Input value={data.checked_by} onChange={(e) => setData('checked_by', e.target.value)} />
                                </div>
                                <div>
                                    <label className="mb-1 block font-medium">Verified By</label>
                                    <Input value={data.verified_by} onChange={(e) => setData('verified_by', e.target.value)} />
                                </div>
                                <div>
                                    <label className="mb-1 block font-medium">Received By</label>
                                    <Input value={data.received_by} onChange={(e) => setData('received_by', e.target.value)} />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1 block font-medium">Description</label>
                                <textarea
                                    rows={6}
                                    className="w-full resize-none rounded-lg border p-2"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 border-t p-4">
                        <Button
                            variant="destructive"
                            type="button"
                            className="cursor-pointer"
                            onClick={() => {
                                reset();
                                setShowAddScheduleInventory(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="cursor-pointer" onClick={handleSubmit} disabled={processing}>
                            Add Schedule
                        </Button>
                    </div>
                </div>
            </div>
            <WarningModal
                show={warningVisible}
                onCancel={() => {
                    setWarningVisible(false);
                    setPendingSubmit(false);
                }}
                onConfirm={() => {
                    setWarningVisible(false);
                    if (pendingSubmit) {
                        doSubmit();
                        setPendingSubmit(false);
                    }
                }}
                title="Validation Warning"
                message={warningMessage}
                details={warningDetails}
            />
        </AppLayout>
    );
}
