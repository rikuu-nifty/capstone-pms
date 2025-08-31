import React, { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import EditModal from "@/components/modals/EditModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { X } from "lucide-react";

import type { Building, BuildingFormData } from "@/types/building";
import type { BuildingRoom } from "@/types/building-room";

interface EditBuildingProps {
    show: boolean;
    onClose: () => void;
    building: Building | null;
    allRooms: BuildingRoom[];
}

const NAME_MAX = 255;
const CODE_MAX = 50;
const DESC_MAX = 1000;

export default function EditBuildingModal({
    show,
    onClose,
    building,
    allRooms,
}: EditBuildingProps) {
    const [data, setData] = useState<BuildingFormData & {
        selected_rooms: number[];
        addRoomsNow?: boolean;
        rooms?: { room: string; description?: string | null }[];
        }
    >({
        name: "",
        code: "",
        description: "",
        selected_rooms: [],
        addRoomsNow: false,
        rooms: [],
    });

    const [errors, setErrors] = useState<Record<string, string | string[]>>({});
    const [processing, setProcessing] = useState(false);

    const [roomToDelete, setRoomToDelete] = useState<BuildingRoom | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const preselectedRoomIds = useMemo<number[]>(() => {
        const embedded = (building?.building_rooms ?? []).map((r) => r.id);
        
        if (embedded.length) return embedded;
        if (building?.id) {
            return allRooms.filter((r) => r.building_id === building.id).map((r) => r.id);
        }
        return [];
    }, [building, allRooms]);

    useEffect(() => {
        if (!show || !building) return;
        setData({
            name: (building.name ?? "").slice(0, NAME_MAX),
            code: (building.code ?? "").slice(0, CODE_MAX),
            description: (building.description ?? "").slice(0, DESC_MAX),
            selected_rooms: preselectedRoomIds,
            addRoomsNow: false,
            rooms: [],
        });
        setErrors({});
    }, [show, building, preselectedRoomIds]);

    const handleClose = () => {
        onClose();
        setErrors({});
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!building?.id) return;

        const payload: BuildingFormData & {
            selected_rooms: number[];
            rooms?: { room: string; description?: string | null }[];
        } = {
            name: (data.name ?? "").trim(),
            code: (data.code ?? "").trim().toUpperCase(),
            description: (data.description ?? "").trim() || null,
            selected_rooms: data.selected_rooms,
            ...(data.addRoomsNow
            ? {
                rooms: (data.rooms ?? [])
                .map((r) => ({
                    room: (r.room ?? "").trim(),
                    description: (r.description ?? "")?.trim() || null,
                }))
                .filter((r) => r.room.length > 0),
            }
            : {}),
        };

        setProcessing(true);
        router.put(`/buildings/${building.id}`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                handleClose();
            },
            onError: (errs: Record<string, string | string[]>) => {
                setProcessing(false);
                setErrors(errs ?? {});
            },
        });
    };

    return (
        <>
        <EditModal
            show={show}
            onClose={handleClose}
            title={`Edit Building #${building?.id ?? ""}`}
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Building Name */}
            <div>
                <label className="mb-1 block font-medium">Building Name</label>
                <Input
                    type="text"
                    placeholder="Enter building name"
                    value={data.name}
                    onChange={(e) =>
                    setData((prev) => ({ ...prev, name: e.target.value.slice(0, NAME_MAX) }))
                    }
                    required
                />
                {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name.toString()}</p>
                )}
            </div>

            {/* Code */}
            <div>
                <label className="mb-1 block font-medium">Code</label>
                <Input
                    value={data.code}
                    onChange={(e) =>
                    setData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase().slice(0, CODE_MAX),
                    }))
                    }
                    placeholder="e.g., MB, AUF-MB"
                    required
                />
                {errors.code && (
                    <p className="mt-1 text-xs text-red-500">{errors.code.toString()}</p>
                )}
            </div>

            {/* Description */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Description</label>
                <textarea
                    rows={3}
                    className="w-full rounded-lg border p-2"
                    placeholder="Enter description"
                    value={data.description ?? ""}
                    onChange={(e) =>
                    setData((prev) => ({
                        ...prev,
                        description: e.target.value.slice(0, DESC_MAX),
                    }))
                    }
                />
                {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                    {errors.description.toString()}
                    </p>
                )}
            </div>

            {/* Associated Rooms */}
            <div className="col-span-2 flex flex-col gap-4">
                <label className="block font-medium text-gray-800">
                    Associated Rooms
                </label>

                {/* Existing rooms */}
                <div className="flex flex-wrap gap-2">
                    {data.selected_rooms.length > 0 ? (
                    data.selected_rooms.map((roomId, index) => {
                        const selectedRoom = allRooms.find((r) => r.id === roomId);
                        return (
                        <div
                            key={`selected-${roomId}-${index}`}
                            className="cursor-default flex items-center justify-between rounded-md border border-blue-200 bg-white px-3 py-2 shadow-sm hover:shadow-md transition w-fit"
                        >
                            <span className="font-medium text-blue-700">
                            {selectedRoom?.room ?? "Room not found"}
                            </span>
                            <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                if (selectedRoom) {
                                setRoomToDelete(selectedRoom);
                                setShowDeleteModal(true);
                                }
                            }}
                            className="cursor-pointer ml-1 h-6 w-6 p-0 text-gray-400 hover:text-red-600 transition"
                            title="Delete room"
                            >
                            <X className="h-4 w-4" />
                            </Button>
                        </div>
                        );
                    })
                    ) : (
                    <p className="text-xs text-gray-500 italic">
                        No rooms linked yet.
                    </p>
                    )}
                </div>

                {/* Toggle add new rooms */}
                <div className="flex items-center justify-between">
                    <div>
                        <label className="font-medium">Add new rooms (optional)</label>
                        <p className="text-xs text-muted-foreground">
                            Add one or more new rooms directly under this building.
                        </p>
                    </div>
                    <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer"
                        checked={data.addRoomsNow ?? false}
                        onChange={(e) =>
                            setData((prev) => ({
                                ...prev,
                                addRoomsNow: e.target.checked,
                            }))
                        }
                    />
                        <span className="text-sm">Enable</span>
                    </label>
                </div>

                    {data.addRoomsNow && (
                        <div className="col-span-2 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {data.rooms?.map((r, idx) => (
                                <div key={idx} className="rounded-lg border p-3 bg-gray-50">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                                    <div className="md:col-span-3">
                                    <label className="mb-1 block text-sm font-medium">
                                        Room
                                    </label>
                                    <Input
                                        placeholder="e.g., 101, AVR, Lab A"
                                        value={r.room}
                                        onChange={(e) => {
                                        const copy = [...(data.rooms ?? [])];
                                        copy[idx] = { ...copy[idx], room: e.target.value };
                                        setData((prev) => ({ ...prev, rooms: copy }));
                                        }}
                                    />
                                    </div>

                                    <div className="md:col-span-3">
                                    <label className="mb-1 block text-sm font-medium">
                                        Room Description (optional)
                                    </label>
                                    <Input
                                        placeholder="e.g., Audio-Visual Room"
                                        value={r.description ?? ""}
                                        onChange={(e) => {
                                        const copy = [...(data.rooms ?? [])];
                                        copy[idx] = {
                                            ...copy[idx],
                                            description: e.target.value,
                                        };
                                        setData((prev) => ({ ...prev, rooms: copy }));
                                        }}
                                    />
                                    </div>

                                    <div className="md:col-span-1 flex items-end">
                                    <Button
                                        className="cursor-pointer"
                                        type="button"
                                        variant="destructive"
                                        onClick={() => {
                                        const copy = [...(data.rooms ?? [])];
                                        copy.splice(idx, 1);
                                        setData((prev) => ({ ...prev, rooms: copy }));
                                        }}
                                    >
                                        Remove
                                    </Button>
                                    </div>
                                </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                className="cursor-pointer"
                                onClick={() =>
                                setData((prev) => ({
                                    ...prev,
                                    rooms: [
                                    ...(prev.rooms ?? []),
                                    { room: "", description: "" },
                                    ],
                                }))
                                }
                            >
                                Add another room
                            </Button>
                        </div>
                    )}
                </div>
            </EditModal>

            <DeleteConfirmationModal
                show={showDeleteModal}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setRoomToDelete(null);
                }}
                onConfirm={() => {
                    if (roomToDelete) {
                        router.delete(`/building-rooms/${roomToDelete.id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setShowDeleteModal(false);
                                setRoomToDelete(null);
                            },
                        });
                    }
                }}
            />
        </>
    );
}
