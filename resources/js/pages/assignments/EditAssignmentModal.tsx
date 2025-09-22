import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
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
    personnels: { id: number; full_name: string; unit_or_department_id?: number | null }[];
    units: { id: number; name: string }[];
}

export default function EditAssignmentModal({
    show,
    onClose,
    assignment,
    assets,
    personnels,
    units,
}: Props) {
    const { data, setData, put, processing, errors, clearErrors } = useForm<{
        personnel_id: number | null;
        date_assigned: string;
        remarks: string;
        selected_assets: number[];
    }>({
        personnel_id: null,
        date_assigned: '',
        remarks: '',
        selected_assets: [],
    });

    const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);
    const [selectedUnit, setSelectedUnit] = useState<number | null>(null);

    useEffect(() => {
        if (!show || !assignment) return;

        setData({
            personnel_id: assignment.personnel_id ?? null,
            date_assigned: assignment.date_assigned ?? '',
            remarks: assignment.remarks ?? '',
            selected_assets: assignment.items
                ? assignment.items.map((i: AssetAssignmentItem) => i.asset_id)
                : [],
        });

        if (assignment.personnel?.unit_or_department?.id) {
            setSelectedUnit(assignment.personnel.unit_or_department.id);
        } else {
            setSelectedUnit(null);
        }

        clearErrors();
        setShowAssetDropdown([true]);
    }, [show, assignment, setData, clearErrors]);

    // Filter personnels (but always keep current one)
    const filteredPersonnels = selectedUnit
        ? personnels.filter(
            (p) =>
            p.unit_or_department_id === selectedUnit ||
            p.id === data.personnel_id
        )
        : personnels;

    // Filter assets (only those in the selected unit and not already assigned)
    const filteredAssets = selectedUnit
        ? assets.filter(
            (a) =>
            a.unit_or_department_id === selectedUnit &&
            !data.selected_assets.includes(a.id)
        )
        : assets.filter((a) => !data.selected_assets.includes(a.id));

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!assignment?.id) return;

        put(`/assignments/${assignment.id}`, {
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
            <DialogContent className="flex max-h-[90vh] min-h-[75vh] w-full max-w-[700px] flex-col overflow-hidden p-6 sm:max-w-[800px]">
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
                            {errors.date_assigned && (
                                <p className="mt-1 text-xs text-red-500">You must set the date the assets were assigned.</p>
                            )}
                        </div>

                        <div className="col-span-2 border-t mt-2 mb-2"></div>

                        {/* Assets */}
                        <div className="col-span-2 flex flex-col gap-3">
                            <label className="block font-medium">Assets</label>

                            {data.selected_assets.map((assetId, index) => {
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
                            })}

                            {showAssetDropdown.map(
                                (visible, index) =>
                                visible && (
                                    <div key={`asset-${index}`} className="flex items-center gap-2">
                                    <Select
                                        className="w-full"
                                        options={filteredAssets.map((a) => {
                                        const locationParts: string[] = [];
                                        if (a.building?.name) locationParts.push(a.building.name);
                                        if (a.building_room?.room)
                                            locationParts.push(a.building_room.room);
                                        if (a.sub_area?.name) locationParts.push(a.sub_area.name);

                                        const location =
                                            locationParts.length > 0
                                            ? ` (${locationParts.join(', ')})`
                                            : '';

                                        return {
                                            value: a.id,
                                            label: `${a.serial_no} – ${a.asset_name ?? ''}${location}`,
                                        };
                                        })}
                                        onChange={(opt) => {
                                        if (opt && !data.selected_assets.includes(opt.value)) {
                                            setData('selected_assets', [
                                            ...data.selected_assets,
                                            opt.value,
                                            ]);
                                            const updated = [...showAssetDropdown];
                                            updated[index] = false;
                                            setShowAssetDropdown([...updated, true]);
                                        }
                                        }}
                                        placeholder="Select assets"
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
