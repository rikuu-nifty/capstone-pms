import { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Select from 'react-select';
import AssignmentAssetItemDetails from './AssignmentAssetItemDetails';

import type { AssetAssignment, AssetAssignmentItem, MinimalAsset } from '@/types/asset-assignment';

interface Props {
    show: boolean;
    onClose: () => void;
    assignment: (AssetAssignment & { items?: AssetAssignmentItem[] }) | null;
    assets: MinimalAsset[];
    available_personnels: { id: number; full_name: string; unit_or_department_id?: number | null }[];

    units: { id: number; name: string }[];
    currentUserId: number;
    users: { id: number; name: string }[];
}

export default function EditAssignmentModal({
    show,
    onClose,
    assignment,
    assets,
    available_personnels,
    units,
    currentUserId,
    users,
}: Props) {
    const { data, setData, processing, errors, clearErrors } = useForm<{
        personnel_id: number | null;
        date_assigned: string;
        remarks: string;
        selected_assets: number[];
        assigned_by: number;
    }>({
        personnel_id: null,
        date_assigned: '',
        remarks: '',
        selected_assets: [],
        assigned_by: 0,
    });

    const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);
    const [selectedUnit, setSelectedUnit] = useState<number | null>(null);

    const [itemDates, setItemDates] = useState<Record<number, string>>({});
    
    useEffect(() => {
        if (!show) {
            setData({
            personnel_id: null,
            date_assigned: '',
            remarks: '',
            selected_assets: [],
            assigned_by: 0,
            });
        }
    }, [show, setData]);

    useEffect(() => {
        if (!assignment) return;

        const today = new Date().toISOString().split('T')[0];
        const assignedDate = assignment.date_assigned ?? today;

        const map: Record<number, string> = {};
        (assignment.items ?? []).forEach(i => {
            if (i.asset_id && i.date_assigned) map[i.asset_id] = i.date_assigned;
        });

        setItemDates(map);
        setData({
            personnel_id: assignment.personnel_id ?? null,
            date_assigned: assignedDate,
            remarks: assignment.remarks ?? '',
            selected_assets: assignment.items?.map(i => i.asset_id) ?? [],
            assigned_by: assignment.assigned_by ?? currentUserId,
        });
        setSelectedUnit(assignment.personnel?.unit_or_department?.id ?? null);
        clearErrors();
        setShowAssetDropdown([true]);
    }, [assignment, setData, clearErrors, currentUserId]);

    const basePersonnels = [
    ...available_personnels,
    ...(assignment?.personnel
        ? [{
            id: assignment.personnel.id,
            full_name: assignment.personnel.full_name,
            unit_or_department_id: assignment.personnel.unit_or_department?.id ?? null,
        }]
        : []),
    ];

    // Deduplicate by ID
    const uniquePersonnels = basePersonnels.filter(
        (p, idx, arr) => arr.findIndex(pp => pp.id === p.id) === idx
    );

    const filteredPersonnels = selectedUnit
        ? uniquePersonnels.filter(
            (p) =>
                p.unit_or_department_id === selectedUnit ||
                p.id === data.personnel_id
        )
        : uniquePersonnels;

    const currentAssignmentAssetIds = assignment?.items?.map(i => i.asset_id) ?? [];

    const filteredAssets = selectedUnit
    ? assets.filter(
        (a) =>
            a.unit_or_department_id === selectedUnit &&
            (!a.is_assigned || currentAssignmentAssetIds.includes(a.id))
        )
    : assets.filter(
        (a) =>
            !a.is_assigned || currentAssignmentAssetIds.includes(a.id)
        );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!assignment?.id) return;

        const payload = {
            ...data,
            selected_assets: data.selected_assets.map((id) => ({
                id,
                date_assigned: itemDates[id] ?? '',
            })),
        };

        router.put(`/assignments/${assignment.id}`, payload, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Dialog 
            open={show} 
            onOpenChange={
                (open) => !open && onClose()
            }
        >
            <DialogContent
                aria-describedby={undefined}
                className="flex max-h-[90vh] min-h-[75vh] w-full max-w-[700px] flex-col overflow-hidden p-6 sm:max-w-[800px]"
            >
                <DialogHeader className="shrink-0">
                    <DialogTitle>Edit Assignment #{assignment?.id ?? ''}</DialogTitle>
                </DialogHeader>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    <form
                        id="edit-assignment-form"
                        onSubmit={handleSubmit}
                        className="grid grid-cols-2 gap-4 text-sm"
                    >
                        {/* Unit/Department */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Unit / Department</label>
                            <Select
                                className="w-full"
                                value={
                                selectedUnit
                                    ? units.find((u) => u.id === selectedUnit) ?? null
                                    : null
                                }
                                options={units}
                                getOptionValue={(u) => String(u.id)}
                                getOptionLabel={(u) => u.name}
                                onChange={(opt) => {
                                    const newUnit = opt ? opt.id : null;
                                    setSelectedUnit(newUnit);

                                    // Reset dependent fields
                                    setData('personnel_id', null);
                                    setData('selected_assets', []);
                                    setShowAssetDropdown([true]);
                                }}
                                isClearable
                                placeholder="All Units / Departments"
                            />
                        </div>

                        {/* Personnel */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Personnel</label>
                            <Select
                                className="w-full"
                                value={
                                data.personnel_id
                                    ? filteredPersonnels.find((p) => p.id === data.personnel_id) ??
                                    null
                                    : null
                                }
                                options={filteredPersonnels}
                                getOptionValue={(p) => String(p.id)}
                                getOptionLabel={(p) => p.full_name}
                                onChange={(opt) => setData('personnel_id', opt ? opt.id : null)}
                                isClearable
                                placeholder="Select personnel"
                            />
                            {errors.personnel_id && (
                                <p className="mt-1 text-xs text-red-500">You must select at least one personnel.</p>
                            )}
                        </div>

                        {/* Date Assigned */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Date Assigned</label>
                            <input
                                type="date"
                                className="w-full rounded-lg border p-2"
                                value={data.date_assigned}
                                onChange={(e) => setData('date_assigned', e.target.value)}
                            />
                            {!assignment?.date_assigned && (
                                <p className="mt-1 text-xs text-amber-600 italic">
                                    No date was set — defaulted to today.
                                </p>
                            )}
                        </div>

                        {/* Assigned By */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Assigned By</label>
                            <Select
                                className="w-full"
                                value={
                                    users
                                    .map((u) => ({ value: u.id, label: u.name }))
                                    .find((opt) => opt.value === data.assigned_by) ?? null
                                }
                                options={users.map((u) => ({ value: u.id, label: u.name }))}
                                onChange={(opt) => setData('assigned_by', opt ? opt.value : currentUserId)}
                                placeholder="Select user"
                            />
                            {!assignment?.assigned_by && (
                                <p className="mt-1 text-xs text-amber-600 italic">
                                    Leaving this empty will default to the current user.
                                </p>
                            )}
                        </div>

                        <div className="col-span-2 border-t mt-2 mb-2"></div>

                        {/* Assets */}
                        <div className="col-span-2 flex flex-col gap-3">
                            <label className="block font-medium">Assets</label>

                            {/* {data.selected_assets.map((assetId, index) => {
                                const asset = assets.find((a) => a.id === assetId);
                                return (
                                asset && (
                                    <AssignmentAssetItemDetails
                                        key={assetId}
                                        asset={asset}
                                        onRemove={() => {
                                            const updated = [...data.selected_assets];
                                            updated.splice(index, 1);
                                            setData('selected_assets', updated);

                                            const newDropdowns = [...showAssetDropdown];
                                            newDropdowns.splice(index, 1);
                                            
                                            if (newDropdowns.length === 0) {
                                                newDropdowns.push(true);
                                            }

                                            setShowAssetDropdown(newDropdowns);
                                        }}
                                    />
                                )
                                );
                            })} */}

                            {data.selected_assets.map((assetId, index) => {
                                const asset = assets.find((a) => a.id === assetId);
                                return (
                                    asset && (
                                        <AssignmentAssetItemDetails
                                            key={assetId}
                                            asset={asset}
                                            dateValue={itemDates[assetId] ?? ''}
                                            onDateChange={(v) => setItemDates((m) => ({ ...m, [assetId]: v }))}
                                            onRemove={() => {
                                                const updated = [...data.selected_assets];
                                                updated.splice(index, 1);
                                                setData('selected_assets', updated);

                                                setItemDates((m) => {
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    const { [assetId]: _, ...rest } = m;
                                                    return rest;
                                                });

                                                const newDropdowns = [...showAssetDropdown];
                                                newDropdowns.splice(index, 1);
                                                if (newDropdowns.length === 0) newDropdowns.push(true);
                                                setShowAssetDropdown(newDropdowns);
                                            }}
                                        />
                                    )
                                );
                            })}

                            {showAssetDropdown.map(
                                (visible, index) =>  visible && (
                                    <div key={`asset-${index}`} className="flex items-center gap-2">
                                        <Select
                                            className="w-full"
                                            options={filteredAssets
                                                .filter(a => !data.selected_assets.includes(a.id))
                                                .filter(a => !a.is_assigned || currentAssignmentAssetIds.includes(a.id))
                                                .map((a) => {
                                                    const locationParts: string[] = [];
                                                    if (a.building?.name) locationParts.push(a.building.name);
                                                    if (a.building_room?.room) locationParts.push(a.building_room.room);
                                                    if (a.sub_area?.name) locationParts.push(a.sub_area.name);

                                                    const location =
                                                        locationParts.length > 0 ? ` (${locationParts.join(', ')})` : '';

                                                    return {
                                                        value: a.id,
                                                        label: `${a.serial_no} – ${a.asset_name ?? ''}${location}`,
                                                    };
                                                })}
                                            onChange={(opt) => {
                                                if (opt && !data.selected_assets.includes(opt.value)) {
                                                    setData('selected_assets', [...data.selected_assets, opt.value]);
                                                    const updated = [...showAssetDropdown];
                                                    updated[index] = false;
                                                    setShowAssetDropdown([...updated, true]);
                                                }
                                            }}
                                            placeholder="Select assets for assignment"
                                        />
                                    </div>
                                )
                            )}

                            {errors.selected_assets && (
                                <p className="mt-1 text-xs text-red-500">
                                    {/* {String(errors.selected_assets)} */}
                                    You need to select at least one asset to save this record.
                                </p>
                            )}
                        </div>

                        <div className="col-span-2 border-t mt-2 mb-2"></div>

                        {/* Remarks */}
                        <div className="col-span-2">
                            <label className="mb-1 block font-medium">Remarks</label>
                            <textarea
                                rows={3}
                                className="w-full resize-none rounded-lg border p-2"
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                            />
                            {errors.remarks && (
                                <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <DialogFooter className="mt-4 shrink-0 border-t pt-4">
                    <DialogClose asChild>
                        <Button
                        variant="destructive"
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer"
                        >
                        Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        form="edit-assignment-form"
                        disabled={processing}
                        className="cursor-pointer"
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
