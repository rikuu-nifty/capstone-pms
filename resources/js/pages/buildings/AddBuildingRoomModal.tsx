import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import AddModal from '@/components/modals/AddModal';
import { Input } from '@/components/ui/input';
import type { Building } from '@/types/building';
import type { BuildingRoomFormData } from '@/types/building-room';
import { ucwords } from '@/types/custom-index';

interface AddNewRoomProps {
    show: boolean;
    onClose: () => void;
    buildings: Building[];
    defaultBuildingId?: number | null;
    lockBuildingSelect?: boolean;
};

export default function AddBuildingRoomModal({
    show,
    onClose,
    buildings,
    defaultBuildingId = null,
    lockBuildingSelect = false,
}: AddNewRoomProps) {

    const { data, setData, post, processing, reset, errors, clearErrors, setError } = useForm<BuildingRoomFormData>({
        building_id: '',
        room: '',
        description: '',
        sub_areas: [],
    });

    const [addSubAreasNow, setAddSubAreasNow] = useState(false);

    useEffect(() => {
        if (!show) return;
        reset();
        clearErrors();
        setAddSubAreasNow(false);

        if (defaultBuildingId != null) {
            setData('building_id', Number(defaultBuildingId));
        }
    }, [show, defaultBuildingId, reset, clearErrors, setData]);

    const addSubAreaRow = () => {
        setData('sub_areas', [...(data.sub_areas ?? []), { name: '', description: '' }]);
    };

    const removeSubAreaRow = (index: number) => {
        const copy = [...(data.sub_areas ?? [])];
        copy.splice(index, 1);
        setData('sub_areas', copy);
    };

    const updateSubAreaField = (index: number, key: 'name' | 'description', value: string) => {
        const copy = [...(data.sub_areas ?? [])];
        copy[index] = { ...copy[index], [key]: value };
        setData('sub_areas', copy);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload: BuildingRoomFormData = {
            building_id: data.building_id === '' ? '' : Number(data.building_id),
            room: (data.room ?? '').trim(),
            description: (data.description ?? '').toString().trim() || null,
            sub_areas: addSubAreasNow
                ? (data.sub_areas ?? [])
                      .map((sa) => ({
                          name: (sa.name ?? '').trim(),
                          description: (sa.description ?? '').trim() || null,
                      }))
                      .filter((sa) => sa.name.length > 0)
                : []
            ,
        };

        setData(payload);

        post('/building-rooms', {
            preserveScroll: true,
            onError: (serverErrors: Record<string, string>) => {
                Object.entries(serverErrors).forEach(([field, message]) => {
                    setError(field as keyof BuildingRoomFormData, message);
                });
            },
            onSuccess: () => {
                reset();
                clearErrors();
                setAddSubAreasNow(false);
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
                setAddSubAreasNow(false);
            }}
            title="Add New Building Room"
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Building */}
            <div>
                <label className="mb-1 block font-medium">Building</label>
                <Select
                    className="w-full"
                    classNamePrefix="react-select"
                    isClearable
                    isSearchable
                    isDisabled={lockBuildingSelect}
                    placeholder="Select a building…"
                    value={
                        data.building_id
                        ? {
                            value: data.building_id,
                            label:
                                buildings.find((b) => b.id === data.building_id)
                                ? `${buildings.find((b) => b.id === data.building_id)!.code} : ${buildings.find((b) => b.id === data.building_id)!.name}`
                                : '',
                            }
                        : null
                    }
                    onChange={(option) =>
                        setData('building_id', option ? Number(option.value) : '')
                    }
                    options={buildings.map((b) => ({
                        value: b.id,
                        label: `${(b.code.toUpperCase())} : ${ucwords(b.name)}`,
                    }))}
                />
                {errors.building_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.building_id}</p>
                )}
            </div>

            {/* Room */}
            <div>
                <label className="mb-1 block font-medium">Room (Name/Number)</label>
                <Input
                    type="text"
                    placeholder="e.g., 101, AVR, Lab A"
                    value={data.room}
                    onChange={(e) => setData('room', e.target.value)}
                    required
                />
                {errors.room && (
                    <p className="mt-1 text-xs text-red-500">{errors.room}</p>
                )}
            </div>

            {/* Description */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Description</label>
                <textarea
                    rows={4}
                    className="w-full rounded-lg border p-2"
                    placeholder="Optional description (e.g., Audio-Visual Room near lobby)"
                    value={data.description ?? ''}
                    onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && (
                    <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                )}
            </div>

             {/* Toggle for Sub Areas */}
            <div className="col-span-2 flex items-center justify-between">
                <div>
                    <label className="font-medium">Add Sub Areas now (optional)</label>
                    <p className="text-xs text-muted-foreground">
                        Add one or more sub areas that belong under this room.
                    </p>
                </div>
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={addSubAreasNow}
                        onChange={(e) => setAddSubAreasNow(e.target.checked)}
                    />
                    <span className="text-sm">Enable</span>
                </label>
            </div>

            {/* Sub Area fields */}
            {addSubAreasNow && (
                <div className="col-span-2 space-y-3">
                    {(data.sub_areas ?? []).map((sa, idx) => (
                        <div key={idx} className="rounded-lg border p-3">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-medium">
                                        Sub Area Name
                                    </label>
                                    <Input
                                        placeholder="e.g., Front Left, Cabinet A"
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
                                        Description (optional)
                                    </label>
                                    <Input
                                        placeholder="Short description"
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

                    <Button type="button" onClick={addSubAreaRow} disabled={processing}>
                        Add a new Sub-Area
                    </Button>
                </div>
            )}
        </AddModal>
    );
}
