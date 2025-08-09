import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { useState } from 'react';

import type { Building, BuildingRoom, InventorySchedulingFormData, Scheduled, UnitOrDepartment, User } from '@/pages/inventory-scheduling/index';

type Props = {
    schedule: Scheduled;
    onClose: () => void;
    buildings: Building[];
    buildingRooms: BuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
    users: User[];
    // Optional: pass allowed statuses; else fallback provided below
    statusOptions?: string[];
};

export const EditInventorySchedulingModal = ({ schedule, onClose, buildings, buildingRooms, unitOrDepartments, users, statusOptions = ['completed', 'pending', 'overdue'],
}: Props) => {
  const [form, setForm] = useState<InventorySchedulingFormData>({
    building_id: schedule.building?.id || '',
    building_room_id: schedule.building_room?.id || '',
    unit_or_department_id: schedule.unit_or_department?.id || '',
    user_id: schedule.user?.id || '',
    designated_employee: schedule.designated_employee?.id || '',
    assigned_by: schedule.assigned_by?.id || '',
    inventory_schedule: schedule.inventory_schedule || '', // month-only string (e.g., "2025-08")
    actual_date_of_inventory: schedule.actual_date_of_inventory || '', // full date (YYYY-MM-DD)
    checked_by: schedule.checked_by || '',
    verified_by: schedule.verified_by || '',
    received_by: schedule.received_by || '',
    scheduling_status: schedule.scheduling_status || statusOptions[0],
    description: schedule.description || '',
  });

    const handleChange = <K extends keyof InventorySchedulingFormData>(field: K, value: InventorySchedulingFormData[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // Filter rooms by selected building
    const filteredRooms = buildingRooms.filter((r) => r.building_id === Number(form.building_id));

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        router.put(`/inventory-scheduling/${schedule.id}`, form, {
            onSuccess: () => onClose(),
            onError: (errors) => {
                // You can wire individual field error displays if you pass `errors` prop in
                console.error(errors);
            },
            preserveScroll: true,
        });
    };

    // When building changes, clear room until user reselects
    const onBuildingChange = (idStr: string) => {
        const id = idStr ? Number(idStr) : '';
        handleChange('building_id', id);
        handleChange('building_room_id', '');
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <form onSubmit={handleSubmit}>
                <DialogContent className="w-full max-w-[700px] p-6 sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Update Inventory Schedule</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        {/* Building */}
                        <div>
                            <Label>Building</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.building_id}
                                onChange={(e) => onBuildingChange(e.target.value)}
                            >
                                <option value="">Select Building</option>
                                {buildings.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} ({b.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Unit/Department */}
                        <div>
                            <Label>Unit/Department</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.unit_or_department_id}
                                onChange={(e) => handleChange('unit_or_department_id', Number(e.target.value))}
                            >
                                <option value="">Select Unit/Department</option>
                                {unitOrDepartments.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.code} - {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Room (depends on building) */}
                        <div>
                            <Label>Room</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.building_room_id}
                                onChange={(e) => handleChange('building_room_id', Number(e.target.value))}
                                disabled={!form.building_id}
                            >
                                <option value="">Select Room</option>
                                {filteredRooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        {room.room}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Assigned To / User */}
                        <div>
                            <Label>Assigned To (User)</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.user_id}
                                onChange={(e) => handleChange('user_id', Number(e.target.value))}
                            >
                                <option value="">Select User</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Designated Employee */}
                        <div>
                            <Label>Designated Employee</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.designated_employee}
                                onChange={(e) => handleChange('designated_employee', Number(e.target.value))}
                            >
                                <option value="">Select Employee</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Assigned By */}
                        <div>
                            <Label>Assigned By</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.assigned_by}
                                onChange={(e) => handleChange('assigned_by', Number(e.target.value))}
                            >
                                <option value="">Select Assigner</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Divider */}
                        <div className="col-span-2 border-t" />

                        {/* Inventory Schedule (Month Only) */}
                        <div>
                            <Label>Inventory Schedule (Month)</Label>
                            {/* Use type="month" for month-only picker; value format usually "YYYY-MM" */}
                            <Input
                                type="month"
                                className="w-full rounded-lg border p-2"
                                value={form.inventory_schedule}
                                onChange={(e) => handleChange('inventory_schedule', e.target.value)}
                            />
                        </div>

                        {/* Actual Date of Schedule (Full Date) */}
                        <div>
                            <Label>Actual Date of Inventory</Label>
                            <Input
                                type="date"
                                className="w-full rounded-lg border p-2"
                                value={form.actual_date_of_inventory}
                                onChange={(e) => handleChange('actual_date_of_inventory', e.target.value)}
                            />
                        </div>

                        {/* Checked By */}
                        <div>
                            <Label>Checked By</Label>
                            <Input
                                className="w-full rounded-lg border p-2"
                                value={form.checked_by}
                                onChange={(e) => handleChange('checked_by', e.target.value)}
                                placeholder="Name"
                            />
                        </div>

                        {/* Verified By */}
                        <div>
                            <Label>Verified By</Label>
                            <Input
                                className="w-full rounded-lg border p-2"
                                value={form.verified_by}
                                onChange={(e) => handleChange('verified_by', e.target.value)}
                                placeholder="Name"
                            />
                        </div>

                        {/* Received By */}
                        <div>
                            <Label>Received By</Label>
                            <Input
                                className="w-full rounded-lg border p-2"
                                value={form.received_by}
                                onChange={(e) => handleChange('received_by', e.target.value)}
                                placeholder="Name"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <Label>Status</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.scheduling_status}
                                onChange={(e) => handleChange('scheduling_status', e.target.value)}
                            >
                                {statusOptions.map((s) => (
                                    <option key={s} value={s}>
                                        {s.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="col-span-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Enter Description"
                                value={form.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                            />
                        </div>

                        <div className="col-span-2 border-t" />
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="button" onClick={handleSubmit}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
