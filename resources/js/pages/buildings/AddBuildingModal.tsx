import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddModal from '@/components/modals/AddModal';
import { useForm, router } from '@inertiajs/react';
import { BuildingFormData, NewRoomPayload } from '@/types/building';
import { ucwords } from '@/types/custom-index';

interface AddBuildingModalProps {
  show: boolean;
  onClose: () => void;
}

type FormShape = BuildingFormData & {
  addRoomsNow: boolean;
  rooms: NewRoomPayload[];
};

export default function AddBuildingModal({ show, onClose }: AddBuildingModalProps) {
    const { data, setData, reset, errors, clearErrors, setError } = useForm<FormShape>({
        name: '',
        code: '',
        description: '',
        addRoomsNow: false,
        rooms: [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const addRoomRow = () => {
        setData('rooms', [...data.rooms, { room: '', description: '' }]);
    };

    const removeRoomRow = (index: number) => {
        const copy = [...data.rooms];
        copy.splice(index, 1);
        setData('rooms', copy);
    };

    const updateRoomField = (index: number, key: keyof NewRoomPayload, value: string) => {
        const copy = [...data.rooms];
        copy[index] = { ...copy[index], [key]: value };
        setData('rooms', copy);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload: Omit<BuildingFormData, 'addRoomsNow'> & { rooms?: NewRoomPayload[] } = {
            name: (data.name ?? '').trim(),
            code: (data.code ?? '').trim().toUpperCase(),
            description: (data.description ?? '').trim() || null,
            ...(data.addRoomsNow
                ? {
                    rooms: data.rooms
                    .map((r) => ({
                        room: (r.room ?? '').trim(),
                        description: (r.description ?? '')?.trim() || null,
                    }))
                    .filter((r) => r.room.length > 0),
                }
                : {}),
        };

        clearErrors();

        router.post('/buildings', payload, {
            preserveScroll: true,
            onStart: () => setIsSubmitting(true),
            onError: (serverErrors: Record<string, string>) => {
                Object.entries(serverErrors).forEach(([field, message]) => {
                setError(field as keyof FormShape, message);
                });
            },
            onSuccess: () => {
                reset();
                onClose();
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    useEffect(() => {
        if (show) {
            reset();
            clearErrors();
            setIsSubmitting(false);
        }
    }, [show, reset, clearErrors]);

    return (
        <AddModal
            show={show}
            onClose={() => {
                onClose();
                reset();
                clearErrors();
                setIsSubmitting(false);
            }}
            title="Add New Building"
            onSubmit={handleSubmit}
            processing={isSubmitting}
        >
        {/* Building Name */}
        <div>
            <label className="mb-1 block font-medium">Building Name</label>
            <Input
                type="text"
                placeholder="Enter building name (e.g., Main Building)"
                value={data.name}
                onChange={(e) => setData('name', ucwords(e.target.value))}
                className="cursor-text w-full rounded-lg border p-2"
                required
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Code */}
        <div>
            <label className="mb-1 block font-medium">Code</label>
            <Input
                value={data.code}
                onChange={(e) => setData('code', (e.target.value).toUpperCase())}
                placeholder="Enter building code (e.g., MB, AUF-MB)"
                required
            />
            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
        </div>

        {/* Description */}
        <div className="col-span-2">
            <label className="mb-1 block font-medium">Description</label>
            <textarea
                rows={5}
                value={data.description ?? ''}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Enter description"
                className="w-full rounded-lg border p-2"
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
        </div>

        {/* Add rooms toggle */}
        <div className="col-span-2 flex items-center justify-between">
            <div>
                <label className="font-medium">Add building rooms now (optional)</label>
                <p className="text-xs text-muted-foreground">
                    Add one or more rooms that will be saved under this building.
                </p>
            </div>
            <label className="inline-flex items-center gap-2">
            <input
                type="checkbox"
                className="h-4 w-4"
                checked={data.addRoomsNow}
                onChange={(e) => setData('addRoomsNow', e.target.checked)}
            />
            <span className="text-sm">Enable</span>
            </label>
        </div>

        {data.addRoomsNow && (
            <div className="col-span-2 space-y-3">
                {data.rooms.map((r, idx) => (
                    <div key={idx} className="rounded-lg border p-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                            <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium">Room</label>
                            <Input
                                placeholder="e.g., 101, AVR, Lab A"
                                value={r.room}
                                onChange={(e) => updateRoomField(idx, 'room', e.target.value)}
                            />
                            {/* Handles nested validation like rooms.0.room */}
                            {errors[`rooms.${idx}.room` as keyof typeof errors] && (
                                <p className="mt-1 text-xs text-red-500">
                                {errors[`rooms.${idx}.room` as keyof typeof errors] as unknown as string}
                                </p>
                            )}
                            </div>

                            <div className="md:col-span-3">
                            <label className="mb-1 block text-sm font-medium">Room Description (optional)</label>
                            <Input
                                placeholder="e.g., Audio-Visual Room near lobby"
                                value={r.description ?? ''}
                                onChange={(e) => updateRoomField(idx, 'description', e.target.value)}
                            />
                            </div>

                            <div className="md:col-span-1 flex items-end">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => removeRoomRow(idx)}
                                disabled={isSubmitting}
                            >
                                Remove
                            </Button>
                            </div>
                        </div>
                    </div>
                ))}

                <Button type="button" onClick={addRoomRow} disabled={isSubmitting}>
                    Add another room
                </Button>
            </div>
        )}
        </AddModal>
    );
}
