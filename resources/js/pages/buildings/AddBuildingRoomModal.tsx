import { useEffect } from 'react';
import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import AddModal from '@/components/modals/AddModal';
import { Input } from '@/components/ui/input';
import type { Building } from '@/types/building';
import type { BuildingRoomFormData } from '@/types/building-room';

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
    const { data, setData, post, processing, reset, errors, clearErrors, } = useForm<BuildingRoomFormData>({
        building_id: '',
        room: '',
        description: '',
    });

    useEffect(() => {
        if (!show) return;
        reset();
        clearErrors();

        if (defaultBuildingId != null) {
        setData('building_id', Number(defaultBuildingId));
        }
    }, [show, defaultBuildingId, reset, clearErrors, setData]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload: BuildingRoomFormData = {
            building_id:
                data.building_id === '' ? '' : Number(data.building_id),
            room: (data.room ?? '').trim(),
            description: (data.description ?? '').toString().trim() || null,
        };

        setData(payload);

        post('/building-rooms', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
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
                        label: `${b.code} : ${b.name}`,
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
        </AddModal>
    );
}
