import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import type { Building } from '@/types/building';
import type { BuildingRoom, BuildingRoomFormData } from '@/types/building-room';
import { ucwords } from '@/types/custom-index';

interface EditRoomModalProps {
    show: boolean;
    onClose: () => void;
    buildings: Building[];
    room: BuildingRoom | null;
};

export default function EditBuildingRoomModal({
    show,
    onClose,
    buildings,
    room,
}: EditRoomModalProps) {

    const { data, setData, put, processing, reset, errors, clearErrors } = useForm<BuildingRoomFormData>({
        building_id: '',
        room: '',
        description: '',
        sub_areas: [],
        remove_sub_area_ids: [],
    });

    const [removedIds, setRemovedIds] = useState<number[]>([]);

    useEffect(() => {
        if (!show || !room) return;

        setData({
            building_id: room.building_id ?? '',
            room: room.room ?? '',
            description: room.description ?? '',
            sub_areas: room.sub_areas
                ? room.sub_areas.map((sa) => ({
                        id: sa.id,
                        name: sa.name,
                        description: sa.description ?? '',
                        _open: false,
                    }))
                : [],
            remove_sub_area_ids: [],
        });

        setRemovedIds([]);
        clearErrors();
    }, [show, room, setData, clearErrors]);

    const addSubAreaRow = () => {
        setData('sub_areas', [
            ...(data.sub_areas ?? []), 
            { name: '', description: '', _open: true }]);
    };

    const updateSubAreaField = (index: number, key: 'name' | 'description', value: string) => {
        const copy = [...(data.sub_areas ?? [])];
        copy[index] = { ...copy[index], [key]: value };
        setData('sub_areas', copy);
    };

    const removeSubAreaRow = (index: number) => {
        const copy = [...(data.sub_areas ?? [])];
        const [removed] = copy.splice(index, 1);
        if (removed?.id) {
            setRemovedIds([...removedIds, removed.id]);
        }
        setData('sub_areas', copy);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!room?.id) return;

        const payload: BuildingRoomFormData = {
            building_id: data.building_id === '' ? '' : Number(data.building_id),
            room: (data.room ?? '').trim(),
            description: (data.description ?? '')?.toString().trim() || null,
            sub_areas: (data.sub_areas ?? [])
                .map((sa) => ({
                    id: sa.id,
                    name: (sa.name ?? '').trim(),
                    description: (sa.description ?? '').trim() || null,
                }))
                .filter((sa) => sa.name.length > 0),
            remove_sub_area_ids: removedIds,
        };

        setData(payload);

        put(`/building-rooms/${room.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const options = buildings.map((b) => ({
        value: b.id,
        label: `${(b.code.toUpperCase())} : ${ucwords(b.name)}`,
    }));

    const selectedOption =
        data.building_id === ''
        ? null
        : options.find((o) => Number(o.value) === Number(data.building_id)) ?? null;

    return (
        <EditModal
            show={show}
            onClose={() => {
                onClose();
                reset();
                clearErrors();
            }}
            title={`Edit Room #${room?.id ?? ''}`}
            onSubmit={handleSubmit}
            processing={processing}
        >

            <div className="col-span-1">
                <label className="mb-1 block font-medium">Building</label>
                <Select
                    className="w-full"
                    classNamePrefix="react-select"
                    isSearchable
                    isClearable={false}
                    placeholder="Select a building…"
                    options={options}
                    value={selectedOption}
                    onChange={(opt) => setData('building_id', opt ? Number(opt.value) : '')}
                />
                {errors.building_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.building_id}</p>
                )}
            </div>

            {/* Room */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Room (Name/Number)</label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2"
                    placeholder="e.g., 101, AVR, Lab A"
                    value={data.room}
                    onChange={(e) => setData('room', e.target.value)}
                    required
                />
                {errors.room && <p className="mt-1 text-xs text-red-500">{errors.room}</p>}
            </div>

            {/* Description */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Description</label>
                <textarea
                    rows={4}
                    className="w-full rounded-lg border p-2"
                    placeholder="Optional description"
                    value={data.description ?? ''}
                    onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && (
                    <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                )}
            </div>

            {/* Sub Areas */}
            <div className="col-span-2 flex flex-col gap-4 mt-4">
                <label className="block font-medium">Sub Areas</label>

                {(data.sub_areas ?? []).map((sa, index) => (
                    <div
                        key={sa.id ?? `new-${index}`}
                        className="flex flex-col gap-2 rounded-lg border"
                    >
                    {/* Card header */}
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="truncate text-base font-semibold text-gray-900">
                                    {sa.name || `Sub Area ${index + 1}`}
                                </span>
                            </div>
                            {!sa._open && (
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                    Click to show sub-area details
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                const copy = [...(data.sub_areas ?? [])];
                                copy[index]._open = !copy[index]._open;
                                setData('sub_areas', copy);
                                }}
                                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50 cursor-pointer"
                            >
                                {sa._open ? 'Hide Details' : 'Show Details'}
                            </button>

                            <button
                                type="button"
                                onClick={() => removeSubAreaRow(index)}
                                disabled={processing}
                                className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white shadow-sm 
                                    hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
                                    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Remove
                            </button>

                        </div>
                    </div>

                    {/* Details */}
                    {sa._open && (
                        <div className="px-2 pb-2 grid grid-cols-2 gap-3 text-sm">
                            <div className="col-span-1">
                                <label className="mb-0.5 block font-medium">Name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border p-1.5"
                                    value={sa.name}
                                    onChange={(e) => updateSubAreaField(index, 'name', e.target.value)}
                                    placeholder="Sub Area name"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="mb-0.5 block font-medium">Description</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border p-1.5"
                                    value={sa.description ?? ''}
                                    onChange={(e) =>
                                        updateSubAreaField(index, 'description', e.target.value)
                                    }
                                    placeholder="Optional description"
                                />
                            </div>
                        </div>
                    )}
                    </div>
                ))}

                <Button
                    type="button"
                    onClick={addSubAreaRow}
                    disabled={processing}
                    variant="primary"
                    className="cursor-pointer self-start"
                >
                    Add New Sub-Area
                </Button>
            </div>
        </EditModal>
    );
}
