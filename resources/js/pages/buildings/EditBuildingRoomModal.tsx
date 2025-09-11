import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
                  }))
                : [],
            remove_sub_area_ids: [],
        });

        setRemovedIds([]);
        clearErrors();
    }, [show, room, setData, clearErrors]);

    const addSubAreaRow = () => {
        setData('sub_areas', [...(data.sub_areas ?? []), { name: '', description: '' }]);
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
            <div className="col-span-2 mt-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="font-medium">Sub Areas</label>
                    <Button
                        type="button"
                        onClick={addSubAreaRow}
                        disabled={processing}
                        className="cursor-pointer"
                    >
                        Add Sub Area
                    </Button>
                </div>

                {(data.sub_areas ?? []).map((sa, idx) => (
                    <div key={idx} className="rounded-lg border p-3 mb-2">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium">Name</label>
                                <Input
                                    placeholder="Sub Area Name"
                                    value={sa.name}
                                    onChange={(e) =>
                                        updateSubAreaField(idx, 'name', e.target.value)
                                    }
                                />
                                {errors[`sub_areas.${idx}.name` as keyof typeof errors] && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {
                                            errors[
                                                `sub_areas.${idx}.name` as keyof typeof errors
                                            ] as unknown as string
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-3">
                                <label className="mb-1 block text-sm font-medium">
                                    Description
                                </label>
                                <Input
                                    placeholder="Optional description"
                                    value={sa.description ?? ''}
                                    onChange={(e) =>
                                        updateSubAreaField(idx, 'description', e.target.value)
                                    }
                                />
                            </div>

                            <div className="md:col-span-1 flex items-end">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => removeSubAreaRow(idx)}
                                    disabled={processing}
                                    className="cursor-pointer"
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </EditModal>
    );
}
