import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';
import Select from 'react-select';
import type { Building } from '@/types/building';
import type { BuildingRoom, BuildingRoomFormData } from '@/types/building-room';

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
        });

    useEffect(() => {
        if (!show || !room) return;
        setData({
            building_id: room.building_id ?? '',
            room: room.room ?? '',
            description: room.description ?? '',
        });
        clearErrors();
    }, [show, room, setData, clearErrors]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!room?.id) return;

        const payload = {
            building_id: data.building_id === '' ? null : Number(data.building_id),
            room: (data.room ?? '').trim(),
            description: (data.description ?? '')?.toString().trim() || null,
        };

        setData({
            building_id: payload.building_id ?? '',
            room: payload.room,
            description: payload.description,
        });

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
        label: `${b.code} : ${b.name}`,
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
        </EditModal>
    );
}
