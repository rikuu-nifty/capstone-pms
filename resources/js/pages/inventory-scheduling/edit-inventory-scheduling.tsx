import { PickerInput } from '@/components/picker-input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type {
    InventorySchedulingFormData,
    Scheduled,
    UnitOrDepartment,
    User,
    SchedulingBuildingRoom,
} from '@/pages/inventory-scheduling/index';
import { Asset } from '../inventory-list';
import type { Building, SubArea } from '@/types/custom-index';
import { useForm, } from '@inertiajs/react';
import { useState } from 'react';
import Select from 'react-select';

import UnitItem from './UnitItem';
import BuildingItem from './BuildingItem';
import WarningModal from './WarningModal';
import { validateScheduleForm } from '@/types/validateScheduleForm';

type Props = {
    schedule: Scheduled;
    onClose: () => void;
    buildings: Building[];
    buildingRooms: SchedulingBuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
    users: User[];
    statusOptions?: string[];
    assets: Asset[];
};

export const EditInventorySchedulingModal = ({
    schedule,
    onClose,
    buildings,
    buildingRooms,
    unitOrDepartments,
    users,
    statusOptions = ['Pending_Review', 'Pending', 'Overdue', 'Completed', 'Cancelled'],
    assets,
}: Props) => {
    const [warningVisible, setWarningVisible] = useState(false);
    const [warningMessage, setWarningMessage] = useState<React.ReactNode>('');
    const [warningDetails, setWarningDetails] = useState<string[]>([]);
    
    const { data, setData, put, errors } = useForm<InventorySchedulingFormData>({
        scope_type: schedule.units && schedule.units.length > 0 ? 'unit' : 'building',
        unit_ids: schedule.units?.map((u) => u.id) ?? [],
        building_ids: schedule.buildings?.map((b) => b.id) ?? [],
        room_ids: schedule.rooms?.map((r) => r.id) ?? [],
        sub_area_ids: schedule.sub_areas?.map((sa) => sa.id) ?? [],

        building_id: schedule.building?.id || '',
        building_room_id: schedule.building_room?.id || '',
        unit_or_department_id: schedule.unit_or_department?.id || '',
        user_id: schedule.user?.id || '',
        designated_employee: schedule.designated_employee?.id || '',
        assigned_by: schedule.assigned_by?.id || '',
        inventory_schedule: schedule.inventory_schedule || '',
        actual_date_of_inventory: schedule.actual_date_of_inventory || '',
        checked_by: schedule.checked_by || '',
        verified_by: schedule.verified_by || '',
        received_by: schedule.received_by || '',
        scheduling_status: schedule.scheduling_status || 'Pending_Review',
        description: schedule.description || '',
        scheduled_assets: [],
    });

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const result = validateScheduleForm(data, assets, unitOrDepartments, buildings, buildingRooms);

        if (!result.valid) {
            setWarningMessage(result.message ?? 'Validation failed.');
            setWarningDetails(result.details ?? []);
            setWarningVisible(true);
            return;
        }

        put(`/inventory-scheduling/${schedule.id}`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-[700px] sm:max-w-[800px] p-6 max-h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Edit Inventory Schedule</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                    <form
                        id="edit-inventory-form"
                        onSubmit={handleSubmit} 
                        className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm"
                    >
                        {/* Scope Type */}
                        <div className="col-span-2">
                            <label className="mb-2 block font-medium">Scope Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    // onClick={() => handleChange("scope_type", "unit")}
                                    onClick={() => {
                                        setData({
                                            ...data,
                                            scope_type: 'unit',
                                            unit_ids: [],
                                            building_ids: [],
                                            room_ids: [],
                                            sub_area_ids: [],
                                        });
                                    }}
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
                                    // onClick={() => handleChange("scope_type", "building")}
                                    onClick={() => {
                                        setData({
                                            ...data,
                                            scope_type: 'building',
                                            unit_ids: [],
                                            building_ids: [],
                                            room_ids: [],
                                            sub_area_ids: [],
                                        });
                                    }}
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
                                <label className="block font-medium">Unit/Dept/Labs Selection</label>

                                <Select
                                    className="w-full"
                                    options={unitOrDepartments
                                        .filter((u) => !data.unit_ids.includes(u.id))
                                        .map((u) => ({
                                            value: u.id,
                                            label: `${u.name} (${u.code})`,
                                        }))
                                    }
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
                                {errors.unit_ids && (
                                    <p className="mt-1 text-xs text-red-500">{String(errors.unit_ids)}</p>
                                )}


                                {data.unit_ids.map((uid) => {
                                    const unit = unitOrDepartments.find((u) => u.id === uid);
                                    if (!unit) return null;

                                    const unitAssets = assets.filter((a) => a.unit_or_department?.id === uid);

                                    const unitBuildings: Building[] = [
                                        ...new Map(
                                            unitAssets
                                                .map((a) => a.building)
                                                .filter((b): b is Building => b !== null && b !== undefined)
                                                .map((b) => [b.id, b])
                                        ).values(),
                                    ];

                                    const unitRooms: SchedulingBuildingRoom[] = [
                                        ...new Map(
                                            unitAssets
                                                .map((a) => a.building_room as SchedulingBuildingRoom | null)
                                                .filter((r): r is SchedulingBuildingRoom => r !== null && r !== undefined)
                                                .map((r) => [r.id, r])
                                        ).values(),
                                    ];

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
                                                    const subAreasToRemove =
                                                        buildingRooms.find(r => r.id === roomId)?.sub_areas?.map(sa => sa.id) ?? [];
                                                    setData('room_ids', data.room_ids.filter(id => id !== roomId));
                                                    setData('sub_area_ids', data.sub_area_ids.filter(id => !subAreasToRemove.includes(id)));
                                                } else {
                                                    setData('room_ids', data.room_ids.includes(roomId) ? data.room_ids : [...data.room_ids, roomId]);
                                                    setData('building_ids', data.building_ids.includes(buildingId)
                                                        ? data.building_ids
                                                        : [...data.building_ids, buildingId]);
                                                }
                                            }}
                                            onToggleSubArea={(subAreaId, roomId, buildingId, checked) => {
                                                if (!checked) {
                                                    const newSubAreas = data.sub_area_ids.filter(id => id !== subAreaId);
                                                    const otherSubAreas = buildingRooms.find(r => r.id === roomId)?.sub_areas?.map(sa => sa.id) ?? [];
                                                    const stillSelected = otherSubAreas.some(id => newSubAreas.includes(id));

                                                    setData('sub_area_ids', newSubAreas);
                                                    if (!stillSelected) {
                                                        setData('room_ids', data.room_ids.filter(id => id !== roomId));
                                                    }
                                                } else {
                                                    setData('sub_area_ids', data.sub_area_ids.includes(subAreaId)
                                                        ? data.sub_area_ids
                                                        : [...data.sub_area_ids, subAreaId]);
                                                    if (!data.room_ids.includes(roomId)) {
                                                        setData('room_ids', [...data.room_ids, roomId]);
                                                    }
                                                    if (!data.building_ids.includes(buildingId)) {
                                                        setData('building_ids', [...data.building_ids, buildingId]);
                                                    }
                                                }
                                            }}
                                            onRemove={() => {
                                                setData('unit_ids', data.unit_ids.filter((id) => id !== uid));
                                            }}
                                            onClearAll={() => {
                                                // remove all rooms + subareas belonging to this unit
                                                const unitRoomIds = unitRooms.map(r => r.id);
                                                const unitSubAreaIds = unitSubAreas.map(sa => sa.id);

                                                setData('room_ids', data.room_ids.filter(id => !unitRoomIds.includes(id)));
                                                setData('sub_area_ids', data.sub_area_ids.filter(id => !unitSubAreaIds.includes(id)));
                                            }}
                                            onSelectAll={() => {
                                                const unitRoomIds = unitRooms.map(r => r.id);
                                                const unitSubAreaIds = unitSubAreas.map(sa => sa.id);

                                                setData('room_ids', Array.from(new Set([...data.room_ids, ...unitRoomIds])));
                                                setData('sub_area_ids', Array.from(new Set([...data.sub_area_ids, ...unitSubAreaIds])));
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
                                        }))
                                    }
                                    placeholder="Add another building..."
                                    value={null}
                                    onChange={(selected) => {
                                        if (selected) {
                                            const id = Number(selected.value);
                                            if (!data.building_ids.includes(id)) {
                                                // collect rooms & subareas tied to this building
                                                const buildingRoomIds = buildingRooms
                                                    .filter((r) => r.building_id === id)
                                                    .map((r) => r.id);

                                                const buildingSubAreaIds = buildingRooms
                                                    .filter((r) => r.building_id === id)
                                                    .flatMap((r) => r.sub_areas?.map((sa) => sa.id) ?? []);

                                                setData({
                                                    ...data,
                                                    building_ids: [...data.building_ids, id],
                                                    room_ids: [...new Set([...data.room_ids, ...buildingRoomIds])],
                                                    sub_area_ids: [...new Set([...data.sub_area_ids, ...buildingSubAreaIds])],
                                                });
                                            }
                                        }
                                    }}

                                />
                                {errors.building_ids && <p className="mt-1 text-xs text-red-500">{String(errors.building_ids)}</p>}

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
                                                onToggleRoom={(roomId, buildingId, checked) => {
                                                    if (!checked) {
                                                        const subAreasToRemove =
                                                            buildingRooms.find(r => r.id === roomId)?.sub_areas?.map(sa => sa.id) ?? [];
                                                        setData('room_ids', data.room_ids.filter(id => id !== roomId));
                                                        setData('sub_area_ids', data.sub_area_ids.filter(id => !subAreasToRemove.includes(id)));
                                                    } else {
                                                        setData('room_ids', data.room_ids.includes(roomId) ? data.room_ids : [...data.room_ids, roomId]);
                                                        setData('building_ids', data.building_ids.includes(buildingId)
                                                            ? data.building_ids
                                                            : [...data.building_ids, buildingId]);
                                                    }
                                                }}

                                                onToggleSubArea={(subAreaId, roomId, buildingId, checked) => {
                                                    if (!checked) {
                                                        const newSubAreas = data.sub_area_ids.filter(id => id !== subAreaId);
                                                        const otherSubAreas = buildingRooms.find(r => r.id === roomId)?.sub_areas?.map(sa => sa.id) ?? [];
                                                        const stillSelected = otherSubAreas.some(id => newSubAreas.includes(id));

                                                        setData('sub_area_ids', newSubAreas);
                                                        if (!stillSelected) {
                                                            setData('room_ids', data.room_ids.filter(id => id !== roomId));
                                                        }
                                                    } else {
                                                        setData('sub_area_ids', data.sub_area_ids.includes(subAreaId)
                                                            ? data.sub_area_ids
                                                            : [...data.sub_area_ids, subAreaId]);
                                                        if (!data.room_ids.includes(roomId)) {
                                                            setData('room_ids', [...data.room_ids, roomId]);
                                                        }
                                                        if (!data.building_ids.includes(buildingId)) {
                                                            setData('building_ids', [...data.building_ids, buildingId]);
                                                        }
                                                    }
                                                }}
                                                onRemove={() => {
                                                    setData('building_ids', data.building_ids.filter((id) => id !== bid));
                                                }}
                                                onSelectAll={() => {
                                                    const buildingRoomIds = rooms.map(r => r.id);
                                                    const buildingSubAreaIds = rooms.flatMap(r => r.sub_areas?.map(sa => sa.id) ?? []);

                                                    setData('room_ids', Array.from(new Set([...data.room_ids, ...buildingRoomIds])));
                                                    setData('sub_area_ids', Array.from(new Set([...data.sub_area_ids, ...buildingSubAreaIds])));
                                                }}
                                                onClearAll={() => {
                                                    const buildingRoomIds = rooms.map(r => r.id);
                                                    const buildingSubAreaIds = rooms.flatMap(r => r.sub_areas?.map(sa => sa.id) ?? []);

                                                    setData('room_ids', data.room_ids.filter(id => !buildingRoomIds.includes(id)));
                                                    setData('sub_area_ids', data.sub_area_ids.filter(id => !buildingSubAreaIds.includes(id)));
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="col-span-2 border-t" />

                        {/* Schedule + Staff + Status */}
                        <div>
                            <label className="mb-1 block font-medium">Inventory Schedule</label>
                            <PickerInput
                                type="month"
                                value={data.inventory_schedule}
                                onChange={(v) => setData('inventory_schedule', v)}
                            />
                            {errors.inventory_schedule && <p className="text-sm text-red-600">{errors.inventory_schedule}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">Designated Staff</label>
                            <Select
                                className="w-full"
                                options={users.map((u) => ({
                                    value: u.id,
                                    label: `${u.name} (${u.role_name})`,
                                }))}
                                value={
                                    users.find((u) => u.id === Number(data.designated_employee))
                                        ? {
                                            value: Number(data.designated_employee),
                                            label: users.find((u) => u.id === Number(data.designated_employee))?.name,
                                        }
                                        : null
                                }
                                onChange={(selected) => setData('designated_employee', selected ? selected.value : '')}
                            />
                            {errors.designated_employee && <p className="text-sm text-red-600">{errors.designated_employee}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">Scheduling Status</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.scheduling_status}
                                onChange={(e) => setData('scheduling_status', e.target.value)}
                            >
                                {statusOptions.map((s) => (
                                    <option key={s} value={s}>
                                        {s.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Divider */}
                        <div className="col-span-2 border-t" />

                        {/* Dates + Checks */}
                        <div>
                            <label className="mb-1 block font-medium">Actual Date of Inventory</label>
                            <PickerInput
                                type="date"
                                value={data.actual_date_of_inventory}
                                onChange={(v) => setData('actual_date_of_inventory', v)}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">Checked By</label>
                            <Input
                                value={data.checked_by}
                                onChange={(e) => setData('checked_by', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">Verified By</label>
                            <Input
                                value={data.verified_by}
                                onChange={(e) => setData('verified_by', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">Received By</label>
                            <Input
                                value={data.received_by}
                                onChange={(e) => setData('received_by', e.target.value)}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1 block font-medium">Description</label>
                            <Textarea
                                rows={6}
                                className="w-full resize-none rounded-lg border p-2"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                        </div>

                    </form>
                </div>
                {/* Footer */}
                <div className="shrink-0 flex justify-end gap-2 border-t pt-4 mt-4">
                    <Button 
                        type="button" 
                        variant="destructive"
                        className='cursor-pointer' 
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        form="edit-inventory-form"
                        className='cursor-pointer'
                    >
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
            
            <WarningModal
                show={warningVisible}
                onClose={() => setWarningVisible(false)}
                title="Validation Warning"
                message={warningMessage}
                details={warningDetails}
            />

        </Dialog>
    );
};
