import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import { Building, BuildingRoom, UnitOrDepartment, User, InventoryList, SubArea } from '@/types/custom-index';
import 'react-datepicker/dist/react-datepicker.css';

import { TransferFormData, Transfer } from '@/types/transfer';
import EditModal from '@/components/modals/EditModal';
import AssetTransferItem from './AssetTransferItem';
import TransferStatusWarningModal from './TransferStatusWarningModal';

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
    subAreas: SubArea[];
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
    subAreas,
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
        scheduled_date: transfer.scheduled_date
            ? new Date(transfer.scheduled_date).toISOString().split('T')[0]
            : ''
        ,
        actual_transfer_date: transfer.actual_transfer_date
            ? new Date(transfer.actual_transfer_date).toISOString().split('T')[0]
            : ''
        ,
        received_by: String(transfer.received_by ?? ''),
        status: (transfer.status?.toLowerCase() ?? 'pending_review') as TransferFormData['status'],
        remarks: transfer.remarks ?? '',
        // selected_assets: transfer.transferAssets?.map((ta) => ta.asset_id) ?? [],
        transfer_assets: transfer.transferAssets?.map((ta) => ({
            asset_id: ta.asset_id,
            moved_at: ta.moved_at ?? null,
            from_sub_area_id: ta.from_sub_area_id ?? null,
            to_sub_area_id: ta.to_sub_area_id ?? null,
            asset_transfer_status: (ta.asset_transfer_status ?? 'pending') as 'pending' | 'transferred' | 'cancelled',
            remarks: ta.remarks ?? null,
        })) ?? [],
    });
  
    const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([false]);
    const [showWarning, setShowWarning] = useState(false);
    const [warningData, setWarningData] = useState<{
        desiredStatus: 'completed' | 'cancelled' | 'overdue' | 'pending_review' | 'upcoming' | 'in_progress';
        conflictingAssets: { id: number; name?: string; asset_transfer_status: string }[];
    } | null>(null);

    const filteredCurrentRooms = data.current_building_id
        ? buildingRooms.filter(
            (room) =>
                room.building_id === data.current_building_id ||
                room.id === data.current_building_room
            )
        : buildingRooms;

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
                scheduled_date: transfer.scheduled_date
                    ? new Date(transfer.scheduled_date).toISOString().split('T')[0]
                    : ''
                ,
                actual_transfer_date: transfer.actual_transfer_date
                    ? new Date(transfer.actual_transfer_date).toISOString().split('T')[0]
                    : ''
                ,
                received_by: transfer.received_by ? String(transfer.received_by) : null,
                status: (transfer.status?.toLowerCase() ?? 'pending_review') as TransferFormData['status'],
                remarks: transfer.remarks ?? '',
                // selected_assets: transfer.transferAssets?.map((ta) => ta.asset_id) ?? [],
                transfer_assets: transfer.transferAssets?.map((ta) => ({
                    asset_id: ta.asset_id,
                    moved_at: ta.moved_at ?? null,
                    from_sub_area_id: ta.from_sub_area_id ?? null,
                    to_sub_area_id: ta.to_sub_area_id ?? null,
                    asset_transfer_status: (ta.asset_transfer_status ?? 'pending') as 'pending' | 'transferred' | 'cancelled',
                    remarks: ta.remarks ?? null,
                })) ?? [],
            });
            clearErrors();
            setShowAssetDropdown([true]);
        }
    }, [
        show,
        transfer.currentBuildingRoom?.building?.id,
        transfer.current_building_room,
        transfer.current_organization,
        transfer.receivingBuildingRoom?.building?.id,
        transfer.receiving_building_room,
        transfer.receiving_organization,
        transfer.designated_employee,
        currentUser.id,
        transfer.scheduled_date,
        transfer.actual_transfer_date,
        transfer.received_by,
        transfer.status,
        transfer.remarks,
        transfer.transferAssets,
        clearErrors,
        setData,
    ]);

    useEffect(() => {
        const pendingCount = data.transfer_assets.filter(ta => ta.asset_transfer_status === 'pending').length;
        const transferredCount = data.transfer_assets.filter(ta => ta.asset_transfer_status === 'transferred').length;
        const cancelledCount = data.transfer_assets.filter(ta => ta.asset_transfer_status === 'cancelled').length;

        let newStatus: TransferFormData['status'] | null = null;

        if (pendingCount === 0 && cancelledCount === 0 && transferredCount > 0) {
            newStatus = 'completed';
        } else if (pendingCount === 0 && transferredCount === 0 && cancelledCount > 0) {
            newStatus = 'cancelled';
        } else if (pendingCount === 0 && (transferredCount > 0 || cancelledCount > 0)) {
            newStatus = 'completed';
        } else if (pendingCount > 0) {
            // ✅ Match backend logic
            const scheduledDate = data.scheduled_date ? new Date(data.scheduled_date) : null;

            if (['completed'].includes(data.status)) {
            // Reverted from completed → in_progress
            newStatus = 'in_progress';
            } else if (scheduledDate && scheduledDate < new Date()) {
            // Past due → overdue
            newStatus = 'overdue';
            } else {
            // Still active → in_progress
            newStatus = 'in_progress';
            }
        }

        if (newStatus && newStatus !== data.status) {
            setData('status', newStatus);
        }
    }, [data.transfer_assets, data.scheduled_date, data.status, setData]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const desiredStatus = data.status as 'completed' | 'cancelled' | 'overdue' | 'pending_review' | string;

        // Collect pending assets from form state
        const pendingAssets = data.transfer_assets
            .filter((ta) => ta.asset_transfer_status === 'pending')
            .map((ta) => {
                const asset = assets.find((a) => a.id === ta.asset_id);
                return {
                    id: ta.asset_id,
                    name: asset?.asset_name ?? '—',
                    asset_transfer_status: ta.asset_transfer_status ?? '—',
                };
            });

        // Overdue selected but no pending assets → auto-downgrade to completed
        if (desiredStatus === 'overdue' && pendingAssets.length === 0) {
            setWarningData({
                desiredStatus: 'completed',
                conflictingAssets: data.transfer_assets.map((ta) => ({
                id: ta.asset_id,
                name: assets.find((a) => a.id === ta.asset_id)?.asset_name ?? '—',
                asset_transfer_status: ta.asset_transfer_status ?? '—',
                })),
            });
            setShowWarning(true);
            return;
        }

        // Special case: record is completed but some assets are pending → downgrade to in_progress
        if (desiredStatus === 'completed' && pendingAssets.length > 0) {
            setWarningData({
                desiredStatus: 'in_progress',
                conflictingAssets: pendingAssets.map((ta) => ({
                id: ta.id,
                name: ta.name ?? '—',
                asset_transfer_status: ta.asset_transfer_status,
                })),
            });
            setShowWarning(true);
            return;
        }

        // Warn if completed/cancelled but still pending
        if ((desiredStatus === 'completed' || desiredStatus === 'cancelled') && pendingAssets.length > 0) {
            setWarningData({
                desiredStatus,
                conflictingAssets: pendingAssets,
            });
            setShowWarning(true);
            return;
        }

        // pending_review / upcoming → warn about reverting assets
        if (desiredStatus === 'pending_review' || desiredStatus === 'upcoming') {
            const transferredAssets = data.transfer_assets.filter(
            (ta) => ta.asset_transfer_status === 'transferred'
            );
            if (transferredAssets.length > 0) {
            setWarningData({
                desiredStatus: desiredStatus as 'pending_review' | 'upcoming',
                conflictingAssets: transferredAssets.map((ta) => ({
                id: ta.asset_id,
                name: assets.find((a) => a.id === ta.asset_id)?.asset_name ?? '—',
                asset_transfer_status: ta.asset_transfer_status ?? '—',
                })),
            });
            setShowWarning(true);
            return;
            }
        }

        // Proceed normally
        put(`/transfers/${transfer.id}`, {
            onSuccess: () => {
            clearErrors();
            setShowAssetDropdown([true]);
            onClose();
            },
        });
    };

    // Called when user confirms from modal
    const confirmWarning = () => {
        setShowWarning(false);
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
            title={`Edit Transfer – Transfer Record #${transfer.id}`}
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
                    onChange={(e) => {
                        setData('current_building_room', Number(e.target.value))

                        // setData('selected_assets', []);
                        setData('transfer_assets', []);
                        setShowAssetDropdown([true]);
                    }}
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

            {/* Scheduled Date */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Scheduled Date</label>
                <input
                    type="date"
                    className="w-full rounded-lg border p-2 uppercase"
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
                    <option value="pending_review">Pending Review</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
            </div>

            {/* Selected Assets */}
            <div className="col-span-2 flex flex-col gap-4">
                <label className="block font-medium">Assets to Transfer</label>

                {data.transfer_assets.map((ta, index) => {
                    const asset = assets.find((a) => a.id === ta.asset_id);
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


                {/* Add more assets */}
                {showAssetDropdown.map(
                    (visible, index) => visible && (
                        <div key={`dropdown-${index}`} className="flex items-center gap-2 w-full">
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
                                    setData('transfer_assets', [
                                    ...data.transfer_assets,
                                    { asset_id: id, asset_transfer_status: 'pending' },
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

            {warningData && (
                <TransferStatusWarningModal
                    show={showWarning}
                    onCancel={() => setShowWarning(false)}
                    onConfirm={confirmWarning}
                    desiredStatus={warningData.desiredStatus}
                    conflictingAssets={warningData.conflictingAssets}
                />
            )}

        </EditModal>
    );
}
