import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import AddModal from '@/components/modals/AddModal';
import AssignmentAssetItemDetails from './AssignmentAssetItemDetails';
import { MinimalAsset } from '@/types/asset-assignment';

interface Props {
    show: boolean;
    onClose: () => void;
    assets: MinimalAsset[];
    personnels: { id: number; full_name: string; unit_or_department_id?: number | null }[];
    units: { id: number; name: string }[];
    currentUserId: number;
    users: { id: number; name: string }[];
}

export default function AddAssignmentModal({
    show,
    onClose,
    assets,
    personnels,
    units,
    currentUserId,
    users,
}: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        personnel_id: number | null;
        unit_or_department_id: number | null;
        assigned_by: number;
        date_assigned: string;
        remarks: string;
        selected_assets: number[];
    }>({
        personnel_id: null,
        unit_or_department_id: null,
        assigned_by: currentUserId,
        date_assigned: '',
        remarks: '',
        selected_assets: [],
    });

    const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);

    const [selectedUnit, setSelectedUnit] = useState<number | null>(null);

    useEffect(() => {
        if (show) {
            reset();
            clearErrors();
            setShowAssetDropdown([true]);
            setSelectedUnit(null);

            setData('assigned_by', currentUserId);
        }
    }, [show, reset, clearErrors, currentUserId, setData]);

    // Filter personnels by selectedUnit
    const filteredPersonnels = selectedUnit
        ? personnels.filter((p) => p.unit_or_department_id === selectedUnit)
        : personnels;

    // Filter assets by selectedUnit
    const filteredAssets = selectedUnit
        ? assets.filter((a) => a.unit_or_department_id === selectedUnit)
        : assets;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!data.date_assigned) {
            setData('date_assigned', new Date().toISOString().split('T')[0]);
        }

        if (!data.assigned_by) {
            setData('assigned_by', currentUserId);
        }

        post('/assignments', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setShowAssetDropdown([true]);
                setSelectedUnit(null);
                onClose();
            },
        });
    };

    return (
        <AddModal
            show={show}
            onClose={() => {
                onClose();
                reset();
                clearErrors();
                setShowAssetDropdown([true]);
                setSelectedUnit(null);  // clear unit filter on close
            }} 
            title="Add New Assignment"
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Unit/Department */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Unit / Department</label>
                <Select
                    className="w-full"
                    value={
                    selectedUnit
                        ? units.map((u) => ({ value: u.id, label: u.name }))
                            .find((opt) => opt.value === selectedUnit) ?? null
                        : null
                    }
                    options={units.map((u) => ({ value: u.id, label: u.name }))}
                    onChange={(opt) => {
                        const unitId = opt ? opt.value : null;
                        setSelectedUnit(unitId);

                        // Reset personnel & assets when unit changes
                        setData('personnel_id', null);
                        setData('selected_assets', []);
                        setShowAssetDropdown([true]);
                    }}
                    isClearable
                    placeholder="All Units / Departments"
                />
                {errors.unit_or_department_id && <p className="mt-1 text-xs text-red-500">{errors.unit_or_department_id}</p>}
            </div>
            
            {/* Personnel */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Personnel</label>
                <Select
                    className="w-full"
                    value={
                        data.personnel_id
                        ? filteredPersonnels
                            .map((p) => ({ value: p.id, label: p.full_name }))
                            .find((opt) => opt.value === data.personnel_id) ?? null
                        : null
                    }
                    options={filteredPersonnels.map((p) => ({
                        value: p.id,
                        label: p.full_name,
                    }))}
                    onChange={(opt) => setData('personnel_id', opt ? opt.value : null)}
                    isClearable
                    placeholder="Select personnel"
                />

                {errors.personnel_id && <p className="mt-1 text-xs text-red-500">{errors.personnel_id}</p>}
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
                {!data.date_assigned && (
                    <p className="mt-1 text-xs text-amber-600 italic">
                        Leaving this empty will default it to today's date.
                    </p>
                )}
                {/* {errors.date_assigned && <p className="mt-1 text-xs text-red-500">{errors.date_assigned}</p>} */}
            </div>

           {/* Assigned By */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Assigned By</label>
                <Select
                    className="w-full"
                    value={
                    data.assigned_by
                        ? users.map((u: { id: number; name: string }) => ({ value: u.id, label: u.name }))
                            .find((opt) => opt.value === data.assigned_by) ?? null
                        : null
                    }
                    options={users.map((u: { id: number; name: string }) => ({
                        value: u.id,
                        label: u.name,
                    }))}
                    onChange={(opt: { value: number; label: string } | null) =>
                        setData('assigned_by', opt ? opt.value : currentUserId)
                    }
                    placeholder="Select user"
                />
                {!data.assigned_by && (
                    <p className="mt-1 text-xs text-amber-600 italic">
                        Leaving this empty will default to the current user.
                    </p>
                )}
            </div>

            <div className="col-span-2 border-t mt-2 mb-2"></div>

            {/* Assets to Assign */}
            <div className="col-span-2 flex flex-col gap-3">
                <label className="block font-medium">Assets to Assign</label>

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
                                    setShowAssetDropdown(newDropdowns);
                                }}
                            />
                        )
                    );
                })}

                {showAssetDropdown.map(
                    (visible, index) => visible && (
                        <div key={`asset-${index}`} className="flex items-center gap-2">
                            <Select
                                className="w-full"
                                options={filteredAssets
                                    .filter((a) => !data.selected_assets.includes(a.id))
                                    .map((a) => {
                                        const locationParts: string[] = [];
                                        if (a.building?.name) locationParts.push(a.building.name);
                                        if (a.building_room?.room) locationParts.push(a.building_room.room);
                                        if (a.sub_area?.name) locationParts.push(a.sub_area.name);
                                        const location = locationParts.length > 0 ? ` (${locationParts.join(', ')})` : '';
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
                                placeholder="Select assets"
                            />
                        </div>
                    )
                )}

                {/* {errors.selected_assets && <p className="mt-1 text-xs text-red-500">{String(errors.selected_assets)}</p>} */}
                {errors.selected_assets && <p className="mt-1 text-xs text-red-500">You need to select at least one asset to save this record.</p>}
            </div>

            <div className="col-span-2 border-t mt-2 mb-2"></div>

            {/* Remarks */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Remarks</label>
                <textarea
                    rows={4}
                    className="w-full resize-none rounded-lg border p-2"
                    value={data.remarks}
                    onChange={(e) => setData('remarks', e.target.value)}
                />
                {errors.remarks && <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>}
            </div>
        </AddModal>
    );
}
