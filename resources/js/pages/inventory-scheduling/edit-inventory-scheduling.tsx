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
import { router } from '@inertiajs/react';
import { useState } from 'react';
import Select from 'react-select';

import UnitItem from './UnitItem';
import BuildingItem from './BuildingItem';

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
    const [form, setForm] = useState<InventorySchedulingFormData>({
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

    const handleChange = <K extends keyof InventorySchedulingFormData>(
        field: K,
        value: InventorySchedulingFormData[K],
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.put(`/inventory-scheduling/${schedule.id}`, form, {
        onSuccess: () => onClose(),
        preserveScroll: true,
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-[700px] p-6 sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Edit Inventory Schedule</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {/* Scope Type */}
                    <div className="col-span-2">
                        <label className="mb-2 block font-medium">Scope Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleChange("scope_type", "unit")}
                                className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium cursor-pointer transition
                                    ${form.scope_type === "unit"
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-gray-300 bg-white hover:bg-gray-50"
                                    }`}
                            >
                                By Units / Departments
                            </button>

                            <button
                                type="button"
                                onClick={() => handleChange("scope_type", "building")}
                                className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium cursor-pointer transition
                                    ${form.scope_type === "building"
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-gray-300 bg-white hover:bg-gray-50"
                                    }`}
                            >
                                By Buildings
                            </button>
                        </div>
                    </div>

                    {/* Units Section */}
                    {form.scope_type === 'unit' && (
                        <div className="col-span-2 flex flex-col gap-4">
                            <label className="block font-medium">Unit/Dept/Labs Selection</label>

                            <Select
                                className="w-full"
                                options={unitOrDepartments
                                    .filter((u) => !form.unit_ids.includes(u.id))
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
                                        if (!form.unit_ids.includes(id)) {
                                            setForm({
                                                ...form,
                                                unit_ids: [...form.unit_ids, id],
                                            });
                                        }
                                    }
                                }}
                            />

                            {form.unit_ids.map((uid) => {
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
                                        selectedRooms={form.room_ids}
                                        selectedSubAreas={form.sub_area_ids}
                                        onToggleRoom={(roomId, buildingId, checked) => {
                                        if (!checked) {
                                            // remove room + all subareas
                                            const subAreasToRemove =
                                            buildingRooms.find(r => r.id === roomId)?.sub_areas?.map(sa => sa.id) ?? [];
                                            setForm(prev => ({
                                            ...prev,
                                            room_ids: prev.room_ids.filter(id => id !== roomId),
                                            sub_area_ids: prev.sub_area_ids.filter(id => !subAreasToRemove.includes(id)),
                                            }));
                                        } else {
                                            // add room, ensure building
                                            setForm(prev => ({
                                            ...prev,
                                            room_ids: prev.room_ids.includes(roomId) ? prev.room_ids : [...prev.room_ids, roomId],
                                            building_ids: prev.building_ids.includes(buildingId)
                                                ? prev.building_ids
                                                : [...prev.building_ids, buildingId],
                                            }));
                                        }
                                        }}

                                        onToggleSubArea={(subAreaId, roomId, buildingId, checked) => {
                                        if (!checked) {
                                            setForm(prev => {
                                            const newSubAreas = prev.sub_area_ids.filter(id => id !== subAreaId);

                                            // check if this was the last subarea of the room
                                            const otherSubAreas = buildingRooms.find(r => r.id === roomId)?.sub_areas?.map(sa => sa.id) ?? [];
                                            const stillSelected = otherSubAreas.some(id => newSubAreas.includes(id));

                                            return {
                                                ...prev,
                                                sub_area_ids: newSubAreas,
                                                room_ids: stillSelected
                                                ? prev.room_ids
                                                : prev.room_ids.filter(id => id !== roomId), // auto-uncheck room if no subs left
                                            };
                                            });
                                        } else {
                                            setForm(prev => ({
                                            ...prev,
                                            sub_area_ids: prev.sub_area_ids.includes(subAreaId)
                                                ? prev.sub_area_ids
                                                : [...prev.sub_area_ids, subAreaId],
                                            room_ids: prev.room_ids.includes(roomId) ? prev.room_ids : [...prev.room_ids, roomId],
                                            building_ids: prev.building_ids.includes(buildingId)
                                                ? prev.building_ids
                                                : [...prev.building_ids, buildingId],
                                            }));
                                        }
                                        }}

                                        onRemove={() => {
                                            setForm({
                                                ...form,
                                                unit_ids: form.unit_ids.filter((id) => id !== uid),
                                            });
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Buildings Section */}
                    {form.scope_type === 'building' && (
                        <div className="col-span-2 flex flex-col gap-4">
                            <label className="block font-medium">Buildings Selection</label>

                            <Select
                                className="w-full"
                                options={buildings
                                .filter((b) => !form.building_ids.includes(b.id))
                                .map((b) => ({
                                    value: b.id,
                                    label: `${b.name} (${b.code})`,
                                }))}
                                placeholder="Add another building..."
                                value={null}
                                onChange={(selected) => {
                                if (selected) {
                                    const id = Number(selected.value);
                                    if (!form.building_ids.includes(id)) {
                                    setForm({
                                        ...form,
                                        building_ids: [...form.building_ids, id],
                                    });
                                    }
                                }
                                }}
                            />

                            <div className="flex flex-col gap-3">
                                {form.building_ids.map((bid) => {
                                    const building = buildings.find((b) => b.id === bid);
                                    if (!building) return null;

                                    const rooms = buildingRooms.filter((r) => r.building_id === bid);

                                    return (
                                        <BuildingItem
                                            key={bid}
                                            building={building}
                                            rooms={rooms}
                                            selectedRooms={form.room_ids}
                                            selectedSubAreas={form.sub_area_ids}
                                            onToggleRoom={(roomId, buildingId, checked) => {
                                            if (!checked) {
                                                // remove room + all subareas
                                                const subAreasToRemove =
                                                buildingRooms.find(r => r.id === roomId)?.sub_areas?.map(sa => sa.id) ?? [];
                                                setForm(prev => ({
                                                ...prev,
                                                room_ids: prev.room_ids.filter(id => id !== roomId),
                                                sub_area_ids: prev.sub_area_ids.filter(id => !subAreasToRemove.includes(id)),
                                                }));
                                            } else {
                                                // add room, ensure building
                                                setForm(prev => ({
                                                ...prev,
                                                room_ids: prev.room_ids.includes(roomId) ? prev.room_ids : [...prev.room_ids, roomId],
                                                building_ids: prev.building_ids.includes(buildingId)
                                                    ? prev.building_ids
                                                    : [...prev.building_ids, buildingId],
                                                }));
                                            }
                                            }}

                                            onToggleSubArea={(subAreaId, roomId, buildingId, checked) => {
                                            if (!checked) {
                                                setForm(prev => {
                                                const newSubAreas = prev.sub_area_ids.filter(id => id !== subAreaId);

                                                // check if this was the last subarea of the room
                                                const otherSubAreas = buildingRooms.find(r => r.id === roomId)?.sub_areas?.map(sa => sa.id) ?? [];
                                                const stillSelected = otherSubAreas.some(id => newSubAreas.includes(id));

                                                return {
                                                    ...prev,
                                                    sub_area_ids: newSubAreas,
                                                    room_ids: stillSelected
                                                    ? prev.room_ids
                                                    : prev.room_ids.filter(id => id !== roomId), // auto-uncheck room if no subs left
                                                };
                                                });
                                            } else {
                                                setForm(prev => ({
                                                ...prev,
                                                sub_area_ids: prev.sub_area_ids.includes(subAreaId)
                                                    ? prev.sub_area_ids
                                                    : [...prev.sub_area_ids, subAreaId],
                                                room_ids: prev.room_ids.includes(roomId) ? prev.room_ids : [...prev.room_ids, roomId],
                                                building_ids: prev.building_ids.includes(buildingId)
                                                    ? prev.building_ids
                                                    : [...prev.building_ids, buildingId],
                                                }));
                                            }
                                            }}

                                            onRemove={() => {
                                                setForm({
                                                ...form,
                                                building_ids: form.building_ids.filter((id) => id !== bid),
                                                });
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
                        value={form.inventory_schedule}
                        onChange={(v) => handleChange('inventory_schedule', v)}
                        />
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
                            users.find((u) => u.id === Number(form.designated_employee))
                            ? {
                                value: Number(form.designated_employee),
                                label: users.find((u) => u.id === Number(form.designated_employee))?.name,
                                }
                            : null
                        }
                        onChange={(selected) => {
                            handleChange('designated_employee', selected ? selected.value : '');
                        }}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Scheduling Status</label>
                        <select
                        className="w-full rounded-lg border p-2"
                        value={form.scheduling_status}
                        onChange={(e) => handleChange('scheduling_status', e.target.value)}
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
                        value={form.actual_date_of_inventory}
                        onChange={(v) => handleChange('actual_date_of_inventory', v)}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Checked By</label>
                        <Input value={form.checked_by} onChange={(e) => handleChange('checked_by', e.target.value)} />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Verified By</label>
                        <Input value={form.verified_by} onChange={(e) => handleChange('verified_by', e.target.value)} />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Received By</label>
                        <Input value={form.received_by} onChange={(e) => handleChange('received_by', e.target.value)} />
                    </div>

                    <div className="col-span-2">
                        <label className="mb-1 block font-medium">Description</label>
                        <Textarea
                        rows={6}
                        className="w-full resize-none rounded-lg border p-2"
                        value={form.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>

                    {/* Footer */}
                    <div className="col-span-2 flex justify-end gap-2 border-t pt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
