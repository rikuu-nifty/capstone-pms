import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import { Building, BuildingRoom, UnitOrDepartment, User, InventoryList } from '@/types';

import { TransferFormData, Transfer } from '@/types/transfer';
import EditModal from '@/components/modals/EditModal';

interface TransferEditModalProps {
    show: boolean;
    onClose: () => void;
    transfer: Transfer;
    currentUser: User;
    buildings: Building[];
    buildingRooms: BuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
    users: User[];
    assets: InventoryList[];
}

function extractId(value: number | { id: number } | undefined): number {
    if (typeof value === 'object' && value !== null) return value.id;
    return value ?? 0;
}

export default function TransferEditModal({
    show,
    onClose,
    transfer,
    currentUser,
    buildings,
    buildingRooms,
    unitOrDepartments,
    users,
    assets,
}: TransferEditModalProps) {

    const { data, setData, put, processing, errors, clearErrors } = useForm<TransferFormData>({
        current_building_id: transfer.currentBuildingRoom?.building?.id ?? 0,
        current_building_room: extractId(transfer.current_building_room),
        current_organization: extractId(transfer.current_organization),
        receiving_building_id: transfer.receivingBuildingRoom?.building?.id ?? 0,
        receiving_building_room: extractId(transfer.receiving_building_room),
        receiving_organization: extractId(transfer.receiving_organization),
        designated_employee: extractId(transfer.designated_employee),
        assigned_by: currentUser.id,
        scheduled_date: transfer.scheduled_date ?? '',
        actual_transfer_date: transfer.actual_transfer_date ?? '',
        received_by: String(transfer.received_by ?? '') ?? null,
        status: (transfer.status?.toLowerCase() ?? 'upcoming') as TransferFormData['status'],
        remarks: transfer.remarks ?? '',
        selected_assets: transfer.transferAssets?.map((ta) => ta.asset_id) ?? [],
    });
  
    const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([false]);

    const filteredCurrentRooms = data.current_building_id
        ? buildingRooms.filter(
            (room) =>
                room.building_id === data.current_building_id ||
                room.id === data.current_building_room
            )
        : buildingRooms;

    // const filteredCurrentRooms = (() => {
    //     const rooms = buildingRooms.filter(room => room.building_id === data.current_building_id);

    //     // Ensure selected room is in the list (when editing)
    //     const selectedRoom = buildingRooms.find(room => room.id === data.current_building_room);
    //     if (selectedRoom && selectedRoom.building_id !== data.current_building_id) {
    //         rooms.push(selectedRoom);
    //     }

    //     return rooms;
    // })();

    const filteredReceivingRooms = data.receiving_building_id
        ? buildingRooms.filter(
            (room) =>
                room.building_id === data.receiving_building_id ||
                room.id === data.receiving_building_room
            )
        : buildingRooms;


    useEffect(() => {
        if (show) {
            setData({
                current_building_id: transfer.currentBuildingRoom?.building?.id ?? 0,
                current_building_room: extractId(transfer.current_building_room),
                current_organization: extractId(transfer.current_organization),
                receiving_building_id: transfer.receivingBuildingRoom?.building?.id ?? 0,
                receiving_building_room: extractId(transfer.receiving_building_room),
                receiving_organization: extractId(transfer.receiving_organization),
                designated_employee: extractId(transfer.designated_employee),
                assigned_by: currentUser.id,
                scheduled_date: transfer.scheduled_date ?? '',
                actual_transfer_date: transfer.actual_transfer_date ?? '',
                received_by: transfer.received_by ? String(transfer.received_by) : null,
                status: (transfer.status?.toLowerCase() ?? 'upcoming') as TransferFormData['status'],
                remarks: transfer.remarks ?? '',
                selected_assets: transfer.transferAssets?.map((ta) => ta.asset_id) ?? [],
            });
            clearErrors();
            setShowAssetDropdown([true]);
        }
    }, [show]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/transfers/${transfer.id}`, {
            onSuccess: () => {
                clearErrors();
                setShowAssetDropdown([true]);
                onClose();
            },
        });
    };

    return (
        <EditModal
            show={show}
            onClose={onClose}
            title="Edit Transfer"
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* <pre>{JSON.stringify(transfer, null, 2)}</pre> */}

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
                {errors.current_building_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.current_building_id}</p>
                )}
            </div>

            {/* Current Room */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Current Room</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.current_building_room}
                    onChange={(e) => setData('current_building_room', Number(e.target.value))}
                >
                    {!data.current_building_room && (
                        <option value="">Select Room</option>
                    )}

                    {filteredCurrentRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                            {room.room}
                        </option>
                    ))}
                </select>
                {errors.current_building_room && (
                    <p className="mt-1 text-xs text-red-500">{errors.current_building_room}</p>
                )}
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
                {errors.receiving_building_id && <p className="mt-1 text-xs text-red-500">{errors.receiving_building_id}</p>}
            </div>

            {/* Receiving Room */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Receiving Room</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.receiving_building_room}
                    onChange={(e) => setData('receiving_building_room', Number(e.target.value))}
                >

                {!data.receiving_building_room && (
                    <option value="">Select Room</option>
                )}

                {filteredReceivingRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                    {room.room}
                    </option>
                ))}
                </select>
                {errors.receiving_building_room && <p className="mt-1 text-xs text-red-500">{errors.receiving_building_room}</p>}
            </div>

            {/* Current Unit/Department */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Current Unit/Dept/Lab</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.current_organization}
                    onChange={(e) => setData('current_organization', Number(e.target.value))}
                >
                
                    {!data.current_organization && (
                        <option value="">Select Unit/Dept</option>
                    )}

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

                    {!data.receiving_organization && (
                        <option value="">Select Unit/Dept</option>
                    )}

                    {unitOrDepartments.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                        {unit.code} - {unit.name}
                        </option>
                    ))}
                </select>
                {errors.receiving_organization && <p className="mt-1 text-xs text-red-500">{errors.receiving_organization}</p>}
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

                {!data.designated_employee && (
                    <option value="">Select Employee</option>
                )}

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
                    onChange={(e) => setData('status', e.target.value as TransferFormData['status'])}
                >

                {!data.status && (
                    <option value="">Select Status</option>
                )}

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
                            <span className="text-sm">
                                {selectedAsset ? (
                                    <>
                                        <span className="text-red-600 font-semibold">[{selectedAsset.asset_type}]</span>{' '}
                                        <span className="text-blue-800">
                                            {selectedAsset.asset_name} - {selectedAsset.serial_no}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-gray-500 italic">Asset not found</span>
                                )}
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

                {showAssetDropdown.map(
                    (visible, index) =>
                        visible && (
                            <div key={`dropdown-${index}`} className="flex items-center gap-2">
                                <Select
                                    className="w-full"
                                    placeholder="Select asset for transfer"
                                    options={assets
                                        .filter((asset) => !data.selected_assets.includes(asset.id))
                                        .map((asset) => ({
                                            value: asset.id,
                                            label: `${asset.serial_no} – ${asset.asset_name ?? ''}`,
                                        }))}
                                    onChange={(selectedOption) => {
                                        if (
                                            selectedOption &&
                                            !data.selected_assets.includes(selectedOption.value)
                                        ) {
                                            setData('selected_assets', [
                                                ...data.selected_assets,
                                                selectedOption.value,
                                            ]);

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
                )}

                {errors.selected_assets && (
                    <p className="mt-1 text-sm text-red-500">{errors.selected_assets}</p>
                )}
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
        </EditModal>
    );
}
