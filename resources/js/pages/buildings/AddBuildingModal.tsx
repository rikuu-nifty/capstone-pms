import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AddModal from '@/components/modals/AddModal';
import { Input } from '@/components/ui/input';
import { BuildingFormData } from '@/types/building';

interface AddBuildingModalProps {
    show: boolean;
    onClose: () => void;
}

export default function AddBuildingModal({ 
    show, 
    onClose,
    // buildingRooms,
}: AddBuildingModalProps) {
    
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<BuildingFormData>({
        name: '',
        code: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload: BuildingFormData = {
            name: (data.name ?? '').trim(),
            code: (data.code ?? '').trim().toUpperCase(),
            description: (data.description ?? '').trim() || null,
        };

        setData(payload);

        post('/buildings', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                onClose();
            },
        });
    };

    useEffect(() => {
        if (show) {
            reset();
            clearErrors();
        }
    }, [
        show,
        reset,
        clearErrors
    ]);

    return (
        <AddModal
            show={show}
            onClose={() => {
                onClose();
                reset();
                clearErrors();
            }}
            title="Add New Building"
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Building Name */}
            <div>
                <label className="mb-1 block font-medium">Building Name</label>
                <Input
                    type="text"
                    placeholder="Enter building name (e.g., Main Building)"
                    value={data.name}
                    onChange={(e) => 
                        setData('name', e.target.value)
                    }
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
                    onChange={(e) => 
                        setData('code', e.target.value)
                    }
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
        </AddModal>
    );
}
