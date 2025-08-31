import AddModal from '@/components/modals/AddModal';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';

import type { UnitOrDepartmentFormData } from '@/types/unit-or-department';

interface Props {
    show: boolean;
    onClose: () => void;
}

export default function AddUnitOrDepartmentModal({ show, onClose }: Props) {
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<UnitOrDepartmentFormData>({
        name: '',
        code: '',
        description: '',
        unit_head: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload: UnitOrDepartmentFormData = {
            name: (data.name ?? '').trim(),
            code: (data.code ?? '').trim().toUpperCase(),
            description: (data.description ?? '').trim() || null,
            unit_head: (data.unit_head ?? '').trim(),
        };

        setData(payload);

        post('/unit-or-departments', {
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
    }, [show, reset, clearErrors]);

    return (
        <AddModal
            show={show}
            onClose={() => {
                onClose();
                reset();
                clearErrors();
            }}
            title="Add New Unit / Department"
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Name */}
            <div>
                <label className="mb-1 block font-medium">Name</label>
                <Input
                    type="text"
                    placeholder="Enter unit/department name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="w-full cursor-text rounded-lg border p-2"
                    required
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Code */}
            <div>
                <label className="mb-1 block font-medium">Code</label>
                <Input
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value.slice(0, 20))}
                    placeholder="Enter code (e.g., PMO, CITE)"
                    required
                />
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>

            <div>
                <label className="mb-1 block font-medium">Unit Head</label>
                <Input
                    value={data.unit_head}
                    onChange={(e) => setData('unit_head', e.target.value)}
                    placeholder="Enter the name of the Unit Head"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                />
                {errors.unit_head && <p className="mt-1 text-xs text-red-500">{errors.unit_head}</p>}
            </div>

            {/* Description */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Description</label>
                <textarea
                    rows={5}
                    value={data.description ?? ''}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Enter description (optional)"
                    className="w-full rounded-lg border p-2"
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>
        </AddModal>
    );
}
