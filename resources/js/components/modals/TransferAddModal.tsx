import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AddModal from "./AddModal";
import { TransferFormData } from '@/types/transfer';
import { Building, BuildingRoom, UnitOrDepartment, User, InventoryList } from '@/types';

interface TransferAddModalProps {
    show: boolean;
    onClose: () => void;
    currentUser: User;
    buildings: Building[];
    buildingRooms: BuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
    users: User[];
    assets: InventoryList[];
}

export default function TransferAddModal({
    show,
    onClose,
    currentUser,
    buildings,
    buildingRooms,
    unitOrDepartments,
    users,
    assets,
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
        status: 'upcoming',
        remarks: '',
        selected_assets: [],
    });

    const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);

    useEffect(() => {
        if (show) {
            reset();
            clearErrors();
            setShowAssetDropdown([true]);
        }
    }, [show]);

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
            title="Create Transfer"
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
                    onChange={(e) => setData('current_building_room', Number(e.target.value))}
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
                    onChange={(e) => setData('current_organization', Number(e.target.value))}
                >
                    <option value="">Select Unit/Dept</option>
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
                    <option value="">Select Unit/Dept</option>
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
                    className="w-full rounded-lg border p-2"
                    value={data.scheduled_date}
                    onChange={(e) => setData('scheduled_date', e.target.value)}
                />
                {errors.scheduled_date && <p className="mt-1 text-xs text-red-500">{errors.scheduled_date}</p>}
            </div>

            {/* Actual Transfer Date */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Actual Transfer Date</label>
                <input
                    type="date"
                    className="w-full rounded-lg border p-2"
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
                        setData('status', e.target.value as 'upcoming' | 'in_progress' | 'completed' | 'overdue')
                    }
                >
                    <option value="">Select Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                </select>
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
            </div>
            
            {/* Selected Assets */}
            <div className="col-span-2 flex flex-col gap-4">
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
                            <select
                                className="w-full rounded-lg border p-2"
                                value=""
                                onChange={(e) => {
                                    const selectedId = Number(e.target.value);
                                    if (!data.selected_assets.includes(selectedId)) {
                                        setData('selected_assets', [...data.selected_assets, selectedId]);

                                        // mark this dropdown as hidden, and add a new one
                                        setShowAssetDropdown((prev) => {
                                            const updated = [...prev];
                                            updated[index] = false;
                                            return [...updated, true];
                                        });
                                    }
                                }}
                            >
                                <option value="">Select Asset</option>
                                {assets
                                    .filter((asset) => !data.selected_assets.includes(asset.id)) 
                                    .map((asset) => (
                                        <option key={asset.id} value={asset.id}>
                                            {asset.serial_no} – {asset.asset_name?? ''}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )
                ))}
                
                {errors.selected_assets && (
                    <p className="mt-1 text-sm text-red-500">{errors.selected_assets}</p>
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