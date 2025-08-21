import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';

import type { UnitOrDepartment, UnitOrDepartmentFormData } from '@/types/unit-or-department';

interface EditUnitDeptProps {
    show: boolean;
    onClose: () => void;
    record: UnitOrDepartment | null;
}

const NAME_MAX = 255;
const CODE_MAX = 20;
const UNIT_MAX = 255;

export default function EditUnitOrDepartmentModal({ show, onClose, record }: EditUnitDeptProps) {
    const { data, setData, put, processing, errors, clearErrors } = useForm<UnitOrDepartmentFormData>({
        name: '',
        code: '',
        description: '',
        unit_head: '',
    });

    useEffect(() => {
        if (!show || !record) return;

        setData({
            name: (record.name ?? '').slice(0, NAME_MAX),
            code: (record.code ?? '').slice(0, CODE_MAX),
            description: record.description ?? '',
            unit_head: (record.unit_head ?? '').slice(0, UNIT_MAX),
        });
        clearErrors();
    }, [
        show, 
        record, 
        setData, 
        clearErrors
    ]);

    const handleClose = () => {
        onClose();
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!record?.id) return;

        const payload: UnitOrDepartmentFormData = {
            name: (data.name ?? '').trim(),
            code: (data.code ?? '').trim().toUpperCase(),
            description: (data.description ?? '').trim() || null,
            unit_head: (data.unit_head ?? '').trim(),
        };

        setData(payload);

        put(`/unit-or-departments/${record.id}`, {
            preserveScroll: true,
            onSuccess: handleClose,
        });
    };

    return (
        <EditModal
            show={show}
            onClose={handleClose}
            title={`Edit Unit/Department #${record?.id ?? ''} Record`}
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Name */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Name</label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2"
                    placeholder="Enter name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value.slice(0, NAME_MAX))}
                    required
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Code */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Code</label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2 uppercase"
                    placeholder="e.g., PMO, CITE"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value.toUpperCase().slice(0, CODE_MAX))}
                />
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>

            {/* Code */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Unit Head</label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2 uppercase"
                    placeholder="Enter the name of the Unit Head"
                    value={data.unit_head}
                    onChange={(e) => 
                        setData('unit_head', 
                            e.target.value.toUpperCase().slice(0, UNIT_MAX)
                        )
                    }
                />
                {errors.unit_head && <p className="mt-1 text-xs text-red-500">{errors.unit_head}</p>}
            </div>

            {/* Description */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Description</label>
                <textarea
                    rows={3}
                    className="w-full resize-none rounded-lg border p-2"
                    placeholder="Short description (optional)"
                    value={data.description ?? ''}
                    onChange={(e) => 
                        setData('description', 
                            e.target.value)
                        }
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>
        </EditModal>
    );
}
