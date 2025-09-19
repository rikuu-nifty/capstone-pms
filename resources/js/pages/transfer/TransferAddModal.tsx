import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import { Building, BuildingRoom, UnitOrDepartment, User, InventoryList, formatEnums, SubArea } from '@/types/custom-index';
import AddModal from "@/components/modals/AddModal";
import { TransferFormData } from '@/types/transfer';
import AssetTransferItem from './AssetTransferItem';

interface TransferAddModalProps {
    show: boolean;
    onClose: () => void;
    currentUser: User;
    buildings: Building[];
    buildingRooms: BuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
    users: User[];
    assets: InventoryList[];
    subAreas: SubArea[];
}

const statusOptions = [ 'pending_review', 'upcoming', 'in_progress', 'completed', 'overdue', 'cancelled'];

export default function TransferAddModal({
    show,
    onClose,
    currentUser,
    buildings,
    buildingRooms,
    unitOrDepartments,
    users,
    assets,
    subAreas,
}: TransferAddModalProps) {

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<TransferFormData>({
        current_building_id: 0,
        current_building_room: 0,
        current_organization: 0,
        receiving_building_id: 0,
        receiving_building_room: 0,
        receiving_organization: 0,
        designated_employee: 0,
        assigned_by: currentUser.id,
        scheduled_date: '',
        actual_transfer_date: '',
        received_by: '',
        status: 'pending_review',
        remarks: '',
        // selected_assets: [],
        transfer_assets: [],
    });

    const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);

    useEffect(() => {
        if (show) {
            reset();
            clearErrors();
            setShowAssetDropdown([true]);
        }
    }, [
        show, 
        reset, 
        clearErrors
    ]);

    const filteredCurrentRooms = buildingRooms.filter(
        (room) => Number(room.building_id) === Number(data.current_building_id)
    );

    const filteredReceivingRooms = buildingRooms.filter(
        (room) => Number(room.building_id) === Number(data.receiving_building_id)
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/transfers', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setShowAssetDropdown([true]);
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
            }}
            title="Create New Transfer"
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Current Building */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Current Building</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.current_building_id}
                    onChange={(e) => {
                        setData('current_building_id', Number(e.target.value));
                        setData('current_building_room', 0);
                        // setData('selected_assets', []);
                        setData('transfer_assets', []);
                        setShowAssetDropdown([true]);
                    }}
                >
                    <option value="">Select Building</option>
                    {buildings.map((building) => (
                        <option key={building.id} value={building.id}>
                            {building.name} ({building.code})
                        </option>
                    ))}
                </select>
                {errors.current_building_id && <p className="mt-1 text-xs text-red-500">{errors.current_building_id}</p>}
            </div>
            
            {/* Current Room */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Current Room</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.current_building_room}
                    onChange={(e) => {
                        setData('current_building_room', Number(e.target.value))
                        // setData('selected_assets', []);
                        setData('transfer_assets', []);
                        setShowAssetDropdown([true]);
                    }}
                    disabled={!data.current_building_id}
                >
                    <option value="">Select Room</option>
                    {filteredCurrentRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                            {room.room}
                        </option>
                    ))}
                </select>
                {errors.current_building_room && <p className="mt-1 text-xs text-red-500">{errors.current_building_room}</p>}
            </div>

            {/* Current Unit/Department */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Current Unit/Dept/Lab</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.current_organization}
                    onChange={(e) => {
                        setData('current_organization', Number(e.target.value))

                        // setData('selected_assets', []);
                        setData('transfer_assets', []);
                        setShowAssetDropdown([true]);
                    }}
                >
                    <option value="">Select Unit/Dept/Lab</option>
                    {unitOrDepartments.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                            {unit.code} - {unit.name}
                        </option>
                    ))}
                </select>
                {errors.current_organization && <p className="mt-1 text-xs text-red-500">{errors.current_organization}</p>}
            </div>

            {/* Receiving Unit/Department */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Receiving Unit/Dept/Lab</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.receiving_organization}
                    onChange={(e) => setData('receiving_organization', Number(e.target.value))}
                >
                    <option value="">Select Unit/Dept/Lab</option>
                    {unitOrDepartments.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                            {unit.code} - {unit.name}
                        </option>
                    ))}
                </select>
                {errors.receiving_organization && <p className="mt-1 text-xs text-red-500">{errors.receiving_organization}</p>}
            </div>

            {/* Receiving Building */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Receiving Building</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.receiving_building_id}
                    onChange={(e) => {
                        setData('receiving_building_id', Number(e.target.value));
                        setData('receiving_building_room', 0);
                    }}
                >
                    <option value="">Select Building</option>
                    {buildings.map((building) => (
                        <option key={building.id} value={building.id}>
                            {building.name} ({building.code})
                        </option>
                    ))}
                </select>
                {errors.receiving_building_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.receiving_building_id}</p>
                )}
            </div>

            {/* Receiving Room */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Receiving Room</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.receiving_building_room}
                    onChange={(e) => setData('receiving_building_room', Number(e.target.value))}
                    disabled={!data.receiving_building_id}
                >
                    <option value="">Select Room</option>
                    {filteredReceivingRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                            {room.room}
                        </option>
                    ))}
                </select>
                {errors.receiving_building_room && (
                    <p className="mt-1 text-xs text-red-500">{errors.receiving_building_room}</p>
                )}
            </div>

            {/* Scheduled Date */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Scheduled Date</label>
                <input
                    type="date"
                    className="w-full rounded-lg border p-2 uppercase "
                    value={data.scheduled_date}
                    onChange={(e) => setData('scheduled_date', e.target.value)}
                />
                {errors.scheduled_date && <p className="mt-1 text-xs text-red-500">{errors.scheduled_date}</p>}
            </div>

            {/* Actual Transfer Date */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Date Completed</label>
                <input
                    type="date"
                    className="w-full rounded-lg border p-2 uppercase "
                    value={data.actual_transfer_date ?? ''}
                    onChange={(e) => setData('actual_transfer_date', e.target.value)}
                />
                {errors.actual_transfer_date && <p className="mt-1 text-xs text-red-500">{errors.actual_transfer_date}</p>}
            </div>

            {/* Designated Employee */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Designated Employee</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.designated_employee}
                    onChange={(e) => setData('designated_employee', Number(e.target.value))}
                >
                    <option value="">Select Employee</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>
                {errors.designated_employee && <p className="mt-1 text-xs text-red-500">{errors.designated_employee}</p>}
            </div>
            
            {/* Status */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Status</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.status}
                    onChange={(e) =>
                        setData('status', e.target.value as 'pending_review' | 'upcoming' | 'in_progress' | 'completed' | 'overdue' | 'cancelled')
                    }
                >
                    <option value="">Select Status</option>

                    {statusOptions.map((status) => (
                        <option key={status} value={status}>
                            {formatEnums(status)}
                        </option>
                    ))}
                </select>
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
            </div>
            
            {/* Selected Assets */}
            {/* <div className="col-span-2 flex flex-col gap-4">
                <label className="block font-medium">Assets to Transfer</label>

                {data.selected_assets.map((assetId, index) => {
                    const selectedAsset = assets.find((a) => a.id === assetId);

                    return (
                        <div key={index} className="flex items-center gap-2">
                            <span className="text-sm text-blue-800">
                                {selectedAsset
                                    ? ` ${selectedAsset.asset_name} (${selectedAsset.serial_no})`
                                    : 'Asset not found'}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    const updated = [...data.selected_assets];
                                    updated.splice(index, 1);
                                    setData('selected_assets', updated);

                                    setShowAssetDropdown((prev) => {
                                        const newState = [...prev];
                                        newState.splice(index, 1);
                                        return newState;
                                    });
                                }}
                                className="text-red-500 text-xs hover:underline cursor-pointer"
                            >
                                Remove
                            </button>
                            
                        </div>
                    );
                })}

                {showAssetDropdown.map((visible, index) => (
                    visible && (
                        <div key={`dropdown-${index}`} className="flex items-center gap-2">
                            <Select
                                className="w-full"
                                options={assets
                                    .filter((asset) => {
                                        const matchesBuilding = data.current_building_id
                                            ? asset.building_id === data.current_building_id
                                            : true;

                                        const matchesRoom = data.current_building_room
                                            ? asset.building_room_id === data.current_building_room
                                            : true;

                                        const matchesUnit = data.current_organization
                                            ? asset.unit_or_department_id === data.current_organization
                                            : true;

                                        return (
                                            matchesBuilding &&
                                            matchesRoom &&
                                            matchesUnit &&
                                            !data.selected_assets.includes(asset.id)
                                        );
                                    })
                                    .map((asset) => ({
                                    value: asset.id,
                                    label: `${asset.serial_no} – ${asset.asset_name ?? ''}`,
                                    }))
                                }
                                placeholder={
                                    data.current_building_id && data.current_building_room && data.current_organization
                                    ? "Select Asset(s) for Transfer..."
                                    : "Select Current Building, Room, and Unit/Dept/Lab first"
                                }
                                isDisabled={
                                    !data.current_building_id || 
                                    !data.current_building_room ||
                                    !data.current_organization
                                }
                                onChange={(selectedOption) => {
                                    if (selectedOption && !data.selected_assets.includes(selectedOption.value)) {
                                    setData('selected_assets', [...data.selected_assets, selectedOption.value]);

                                    setShowAssetDropdown((prev) => {
                                        const updated = [...prev];
                                        updated[index] = false;
                                        return [...updated, true];
                                    });
                                    }
                                }}
                            />
                        </div>
                    )
                ))}
                
                {errors.selected_assets && (
                    <p className="mt-1 text-sm text-red-500">{errors.selected_assets}</p>
                )}
            </div> */}

            {/* Assets to Transfer */}
            <div className="col-span-2 flex flex-col gap-4">
                <label className="block font-medium">Assets to Transfer</label>

                {/* List of chosen assets + per-asset fields */}
                {data.transfer_assets.map((ta, index) => {
                    const asset = assets.find(a => a.id === ta.asset_id);
                    if (!asset) {
                        return (
                        <div key={`${ta.asset_id}-${index}`} className="rounded-lg border p-2 text-sm text-red-600">
                            Asset not found
                        </div>
                        );
                    }

                    return (
                        <AssetTransferItem
                            key={`${ta.asset_id}-${index}`}
                            ta={ta}
                            asset={asset}
                            //   subAreas={subAreas}
                            fromSubAreas={subAreas.filter(
                                (sa) => sa.building_room_id === data.current_building_room
                            )}
                            toSubAreas={subAreas.filter(
                                (sa) => sa.building_room_id === data.receiving_building_room
                            )}
                            parentStatus={data.status}
                            onRemove={() => {
                                const next = [...data.transfer_assets];
                                next.splice(index, 1);
                                setData('transfer_assets', next);
                            }}
                            onChange={(next) => {
                                const copy = [...data.transfer_assets];
                                copy[index] = next;
                                setData('transfer_assets', copy);
                            }}
                        />
                    );
                })}

                {/* Add new asset dropdown(s) */}
                {showAssetDropdown.map(
                    (visible, index) => visible && (
                        <div key={`dropdown-${index}`} className="flex items-center gap-2">
                            <Select
                                className="w-full"
                                options={assets
                                    .filter((asset) => {
                                    const matchesBuilding = data.current_building_id
                                        ? asset.building_id === data.current_building_id
                                        : true;

                                    const matchesRoom = data.current_building_room
                                        ? asset.building_room_id === data.current_building_room
                                        : true;

                                    const matchesUnit = data.current_organization
                                        ? asset.unit_or_department_id === data.current_organization
                                        : true;

                                    const notAlreadyChosen = !data.transfer_assets.some((x) => x.asset_id === asset.id);

                                    return matchesBuilding && matchesRoom && matchesUnit && notAlreadyChosen;
                                    })
                                    .map((asset) => ({
                                        value: asset.id,
                                        label: `${asset.serial_no} – ${asset.asset_name ?? ''}`,
                                    }))}
                                placeholder={
                                    data.current_building_id && data.current_building_room && data.current_organization
                                    ? 'Select Asset(s) for Transfer...'
                                    : 'Select Current Building, Room, and Unit/Dept/Lab first'
                                }
                                isDisabled={!data.current_building_id || !data.current_building_room || !data.current_organization}
                                onChange={(selectedOption) => {
                                    if (selectedOption) {
                                        const id = Number(selectedOption.value);
                                        if (!data.transfer_assets.some((x) => x.asset_id === id)) {
                                            const asset = assets.find((a) => a.id === id);
                                            setData('transfer_assets', [
                                                ...data.transfer_assets,
                                                {
                                                    asset_id: id,
                                                    from_sub_area_id: asset?.sub_area_id ?? null, // pre-fill if available
                                                    to_sub_area_id: null,
                                                },
                                            ]);
                                            setShowAssetDropdown((prev) => {
                                                const updated = [...prev];
                                                updated[index] = false;
                                                return [...updated, true];
                                            });
                                        }
                                    }
                                }}
                            />
                        </div>
                    ),
                )}

                {errors.transfer_assets && <p className="mt-1 text-sm text-red-500">{String(errors.transfer_assets)}</p>}
            </div>

            {/* Received By */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Received By</label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2"
                    value={data.received_by ?? ''}
                    onChange={(e) => setData('received_by', e.target.value)}
                />
                {errors.received_by && (
                    <p className="mt-1 text-xs text-red-500">{errors.received_by}</p>
                )}
            </div>

            {/* Assigned By */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Assigned By</label>
                <div className="p-1 text-sm font-bold text-blue-700">
                    {currentUser.name}
                </div>
            </div>
            
            {/* Remarks */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Remarks</label>
                <textarea
                    rows={3}
                    className="w-full resize-none rounded-lg border p-2"
                    value={data.remarks ?? ''}
                    onChange={(e) => setData('remarks', e.target.value)}
                />
                {errors.remarks && <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>}
            </div>

        </AddModal>
    );
}