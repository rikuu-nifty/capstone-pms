import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';
import type { Building, BuildingFormData } from '@/types/building';

interface EditBuildingProps {
  show: boolean;
  onClose: () => void;
  building: Building | null;
}

const NAME_MAX = 255;
const CODE_MAX = 50;
const DESC_MAX = 1000;

export default function EditBuildingModalORIG({
    show,
    onClose,
    building,
}: EditBuildingProps) {
    const { data, setData, put, processing, errors, clearErrors } =
        useForm<BuildingFormData>({
        name: '',
        code: '',
        description: '',
        });

    useEffect(() => {
        if (!show || !building) return;

        setData({
        name: (building.name ?? '').slice(0, NAME_MAX),
        code: (building.code ?? '').slice(0, CODE_MAX),
        description: (building.description ?? '').slice(0, DESC_MAX),
        });
        clearErrors();
    }, [
        show, 
        building, 
        setData, 
        clearErrors
    ]);

    const handleClose = () => {
        onClose();
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!building?.id) return;

        const payload: BuildingFormData = {
            name: (data.name ?? '').trim(),
            code: (data.code ?? '').trim().toUpperCase(),
            description: (data.description ?? '').trim() || null,
        };

        setData(payload);

        put(`/buildings/${building.id}`, {
            preserveScroll: true,
            onSuccess: handleClose,
        });
    };

    return (
        <EditModal
            show={show}
            onClose={handleClose}
            title={`Edit Building #${building?.id ?? ''} Record`}
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Name */}
            <div className="col-span-1">
                <label htmlFor="edit-building-name" className="mb-1 block font-medium">
                    Building Name
                </label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2"
                    placeholder="Enter building name"
                    value={data.name}
                    onChange={(e) => 
                        setData('name', e.target.value.slice(0, NAME_MAX))
                    }
                    required
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Code */}
            <div className="col-span-1">
                <label htmlFor="edit-building-code" className="mb-1 block font-medium">
                    Code
                </label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2 uppercase"
                    placeholder="e.g., MH, LIB"
                    value={data.code}
                    onChange={(e) =>
                        setData('code', e.target.value.toUpperCase().slice(0, CODE_MAX))
                    }
                />
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>

            {/* Description */}
            <div className="col-span-2">
                <label htmlFor="edit-building-description" className="mb-1 block font-medium">
                    Description
                </label>
                <textarea
                    id="edit-building-description"
                    rows={3}
                    className="w-full resize-none rounded-lg border p-2"
                    placeholder="Short description (optional)"
                    value={data.description ?? ''}
                    onChange={(e) =>
                        setData('description', e.target.value.slice(0, DESC_MAX))
                    }
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>
        </EditModal>
    );
}
