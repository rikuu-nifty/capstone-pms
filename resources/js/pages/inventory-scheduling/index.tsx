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
import { Asset } from '../inventory-list';
import Select from "react-select";

import BuildingItem from './BuildingItem';
import UnitItem from './UnitItem';
import type { Building, SubArea } from '@/types/custom-index';

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

export default function InventorySchedulingIndex({
    schedules = [],
    assets = [], // 👈 default empty array
    buildings = [],
    buildingRooms = [],
    unitOrDepartments = [],
    users = [],
}: {
    schedules: Scheduled[];
    viewing?: Scheduled; // 👈 may exist when opening View modal
    assets?: Asset[]; // 👈 fixed type         // 👈 new, will be passed for view modal
    buildings: Building[];
    buildingRooms: SchedulingBuildingRoom[];
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
        // console.log("Submitting scheduling data:", JSON.stringify(data, null, 2));
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
                                <TableHead className="text-center">Inventory Schedule</TableHead>
                                <TableHead className="text-center">Total Buildings</TableHead>
                                <TableHead className="text-center">Total Rooms</TableHead>
                                <TableHead className="text-center">Total Units/Departments</TableHead>
                                <TableHead className="text-center">Total Assets</TableHead>
                                {/* <TableHead className="text-center">Designated Staff</TableHead> */}
                                
                                <TableHead className="text-center">Actual Date</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filtered.map((item) => (
                                <TableRow key={item.id} className="text-center">
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell className="whitespace-nowrap">{formatMonth(item.inventory_schedule) || '—'}</TableCell>
                                    <TableCell>{item.buildings?.length ?? 0}</TableCell>
                                    <TableCell>{item.rooms?.length ?? 0}</TableCell>
                                    <TableCell>{item.units?.length ?? 0}</TableCell>
                                    <TableCell>{item.assets_count ?? 0}</TableCell>
                                    {/* <TableCell className="whitespace-nowrap">{item.designated_employee?.name ?? '—'}</TableCell> */}
                                    <TableCell className="whitespace-nowrap">{formatDate(item.actual_date_of_inventory) || '—'}</TableCell>

                                    <TableCell>
                                        <Badge variant={schedulingStatusMap[item.scheduling_status] ?? 'default'}>
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
                    assets={assets ?? []} // 👈 pass assets safely
                    onClose={closeView}
                    signatories={signatories}
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
                        <h2 className="text-xl font-semibold">Create Schedule Inventory</h2>
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
                                    <button
                                        type="button"
                                        onClick={() => setData("scope_type", "unit")}
                                        className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium cursor-pointer transition
                                            ${data.scope_type === "unit"
                                            ? "border-blue-600 bg-blue-50 text-blue-700"
                                            : "border-gray-300 bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        By Units / Departments
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData("scope_type", "building")}
                                        className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium cursor-pointer transition
                                            ${data.scope_type === "building"
                                            ? "border-blue-600 bg-blue-50 text-blue-700"
                                            : "border-gray-300 bg-white hover:bg-gray-50"
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
                                            })
                                        )}
                                        placeholder="Add another unit..."
                                        value={null}
                                        onChange={(selected) => {
                                            if (selected) {
                                                const id = Number(selected.value);

                                                if (!data.unit_ids.includes(id)) {
                                                    setData('unit_ids', [...data.unit_ids, id]);

                                                    // derive all assets for this unit
                                                    const unitAssets = assets.filter((a) => a.unit_or_department?.id === id);

                                                    // collect related rooms
                                                    const rooms = [
                                                        ...new Map(
                                                        unitAssets
                                                            .map((a) => a.building_room as SchedulingBuildingRoom | null)
                                                            .filter((r): r is SchedulingBuildingRoom => r !== null)
                                                            .map((r) => [r.id, r])
                                                        ).values(),
                                                    ];

                                                    // collect related sub-areas
                                                    const subAreas = [
                                                        ...new Map(
                                                        unitAssets
                                                            .map((a) => a.sub_area)
                                                            .filter((sa): sa is SubArea => sa !== null && sa !== undefined)
                                                            .map((sa) => [sa.id, sa])
                                                        ).values(),
                                                    ];

                                                    // auto select them
                                                    setData('room_ids', [
                                                        ...data.room_ids,
                                                        ...rooms.map((r) => r.id).filter((rid) => !data.room_ids.includes(rid)),
                                                    ]);

                                                    setData('sub_area_ids', [
                                                        ...data.sub_area_ids,
                                                        ...subAreas.map((sa) => sa.id).filter((sid) => !data.sub_area_ids.includes(sid)),
                                                    ]);

                                                    const unitBuildings: Building[] = [
                                                        ...new Map(
                                                            unitAssets
                                                                .map((a) => a.building)
                                                                .filter((b): b is Building => b !== null && b !== undefined)
                                                                .map((b) => [b.id, b])
                                                        ).values(),
                                                    ];

                                                    setData('building_ids', [
                                                        ...data.building_ids,
                                                        ...unitBuildings.map((b) => b.id).filter((bid) => !data.building_ids.includes(bid)),
                                                    ]);
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
                                                .map((b) => [b.id, b])
                                            ).values(),
                                        ];

                                        // derive related rooms
                                        const unitRooms: SchedulingBuildingRoom[] = [
                                            ...new Map(
                                                unitAssets
                                                .map((a) => a.building_room as unknown as SchedulingBuildingRoom | null)
                                                .filter((r): r is SchedulingBuildingRoom => r !== null && r !== undefined)
                                                .map((r) => [r.id, r])
                                            ).values(),
                                        ];

                                        // derive related subareas
                                        const unitSubAreas: SubArea[] = [
                                            ...new Map(
                                                unitAssets
                                                .map((a) => a.sub_area)
                                                .filter((sa): sa is SubArea => sa !== null && sa !== undefined)
                                                .map((sa) => [sa.id, sa])
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
                                                selectedRooms={data.room_ids}
                                                selectedSubAreas={data.sub_area_ids}
                                                onToggleRoom={(roomId, buildingId, checked) => {
                                                    if (!checked) {
                                                        setData('room_ids', data.room_ids.filter(id => id !== roomId));
                                                        // remove sub-areas under this room
                                                        const subAreasToRemove = buildingRooms.find(r => r.id === roomId)?.sub_areas?.map(sa => sa.id) ?? [];
                                                        setData('sub_area_ids', data.sub_area_ids.filter(id => !subAreasToRemove.includes(id)));
                                                    } else {
                                                        if (!data.room_ids.includes(roomId)) setData('room_ids', [...data.room_ids, roomId]);
                                                        if (!data.building_ids.includes(buildingId)) setData('building_ids', [...data.building_ids, buildingId]);
                                                    }
                                                }}
                                                onToggleSubArea={(subAreaId, roomId, buildingId, checked) => {
                                                    if (!checked) {
                                                        setData('sub_area_ids', data.sub_area_ids.filter(id => id !== subAreaId));
                                                    } else {
                                                        if (!data.sub_area_ids.includes(subAreaId)) setData('sub_area_ids', [...data.sub_area_ids, subAreaId]);
                                                        if (!data.room_ids.includes(roomId)) setData('room_ids', [...data.room_ids, roomId]);
                                                        if (!data.building_ids.includes(buildingId)) setData('building_ids', [...data.building_ids, buildingId]);
                                                    }
                                                }}
                                                onRemove={() => {
                                                    // derive related assets
                                                    const unitAssets = assets.filter((a) => a.unit_or_department?.id === uid);

                                                    const buildingsToRemove = [
                                                        ...new Map(
                                                            unitAssets
                                                                .map((a) => a.building)
                                                                .filter((b): b is Building => b !== null && b !== undefined)
                                                                .map((b) => [b.id, b])
                                                        ).values(),
                                                    ].map((b) => b.id);
                                                    
                                                    // collect related rooms
                                                    const roomsToRemove = [
                                                        ...new Map(
                                                        unitAssets
                                                            .map((a) => a.building_room as SchedulingBuildingRoom | null)
                                                            .filter((r): r is SchedulingBuildingRoom => r !== null)
                                                            .map((r) => [r.id, r])
                                                        ).values(),
                                                    ].map((r) => r.id);

                                                    // collect related sub-areas
                                                    const subAreasToRemove = [
                                                        ...new Map(
                                                        unitAssets
                                                            .map((a) => a.sub_area)
                                                            .filter((sa): sa is SubArea => sa !== null && sa !== undefined)
                                                            .map((sa) => [sa.id, sa])
                                                        ).values(),
                                                    ].map((sa) => sa.id);

                                                    // update state
                                                    setData('unit_ids', data.unit_ids.filter((id) => id !== uid));
                                                    setData('building_ids', data.building_ids.filter((id) => !buildingsToRemove.includes(id)));
                                                    setData('room_ids', data.room_ids.filter((id) => !roomsToRemove.includes(id)));
                                                    setData('sub_area_ids', data.sub_area_ids.filter((id) => !subAreasToRemove.includes(id)));
                                                }}

                                            />
                                        );
                                    })}
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
                                            })
                                        )}
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
                                                    selectedRooms={data.room_ids}
                                                    selectedSubAreas={data.sub_area_ids}
                                                    onToggleRoom={(roomId, buildingId) => {
                                                        if (data.room_ids.includes(roomId)) {
                                                            setData('room_ids', data.room_ids.filter((id) => id !== roomId));
                                                        } else {
                                                            setData('room_ids', [...data.room_ids, roomId]);
                                                            if (!data.building_ids.includes(buildingId)) {
                                                                setData('building_ids', [...data.building_ids, buildingId]);
                                                            }
                                                        }
                                                    }}
                                                    onToggleSubArea={(subAreaId, roomId, buildingId) => {
                                                        if (data.sub_area_ids.includes(subAreaId)) {
                                                            setData('sub_area_ids', data.sub_area_ids.filter((id) => id !== subAreaId));
                                                        } else {
                                                            setData('sub_area_ids', [...data.sub_area_ids, subAreaId]);
                                                            if (!data.room_ids.includes(roomId)) {
                                                                setData('room_ids', [...data.room_ids, roomId]);
                                                            }
                                                            if (!data.building_ids.includes(buildingId)) {
                                                                setData('building_ids', [...data.building_ids, buildingId]);
                                                            }
                                                        }
                                                    }}
                                                    onRemove={() => {
                                                        // Remove building + its rooms + subareas
                                                        const roomsToRemove = buildingRooms.filter((r) => r.building_id === bid).map((r) => r.id);
                                                        const subAreasToRemove = buildingRooms
                                                            .filter((r) => r.building_id === bid)
                                                            .flatMap((r) => r.sub_areas ?? [])
                                                            .map((sa) => sa.id);

                                                        setData('building_ids', data.building_ids.filter((id) => id !== bid));
                                                        setData('room_ids', data.room_ids.filter((id) => !roomsToRemove.includes(id)));
                                                        setData('sub_area_ids', data.sub_area_ids.filter((id) => !subAreasToRemove.includes(id)));
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="col-span-2 border-t" />

                            <div className="col-span-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-medium">Inventory Schedule</label>
                                    <PickerInput type="month" value={data.inventory_schedule || ''} onChange={(v) => setData('inventory_schedule', v)} />
                                        {errors.inventory_schedule && (
                                            <p className="mt-1 text-xs text-red-500">{String(errors.inventory_schedule)}</p>
                                        )}
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
                                    {errors.designated_employee && (
                                        <p className="mt-1 text-xs text-red-500">{String(errors.designated_employee)}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium">Scheduling Status</label>
                                    <select
                                        className="w-full rounded-lg border p-2"
                                        value={data.scheduling_status}
                                        onChange={(e) => setData('scheduling_status', e.target.value)}
                                    >
                                        <option value="Pending_Review">Pending Review</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Overdue">Overdue</option>
                                        <option value="Completed" disabled>Completed</option>
                                        <option value="Cancelled" disabled>Cancelled</option>
                                    </select>
                                </div>
                                
                            </div>

                            {/* Divider */}
                            <div className="col-span-2 border-t" />

                            <div className="col-span-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-medium">Actual Date of Inventory</label>
                                    <PickerInput 
                                        type="date" 
                                        value={data.actual_date_of_inventory} 
                                        onChange={setActualDateFromValue} 
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-medium">Checked By</label>
                                    <Input 
                                        value={data.checked_by} 
                                        onChange={e => setData('checked_by', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-medium">Verified By</label>
                                    <Input 
                                        value={data.verified_by} 
                                        onChange={e => setData('verified_by', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-medium">Received By</label>
                                    <Input 
                                        value={data.received_by} 
                                        onChange={e => setData('received_by', e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1 block font-medium">Description</label>
                                <textarea
                                    rows={6}
                                    className="w-full resize-none rounded-lg border p-2"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                />
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 border-t p-4">
                        <Button
                            variant="destructive"
                            type="button"
                            className='cursor-pointer'
                            onClick={() => {
                                reset();
                                setShowAddScheduleInventory(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            className='cursor-pointer'
                            onClick={handleSubmit} 
                            disabled={processing}
                        >
                            Add Schedule
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
