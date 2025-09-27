import { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';
import type { EquipmentCode, EquipmentCodeFormData } from '@/types/equipment-code';
import type { Category } from '@/types/category';
import Select from 'react-select';

interface Props {
    show: boolean;
    onClose: () => void;
    equipmentCode: EquipmentCode;
}

export default function EditEquipmentCodeModal({ show, onClose, equipmentCode }: Props) {
    const categories = usePage<{ categories: Category[] }>().props.categories ?? [];

    const { data, setData, put, processing, errors, clearErrors } =
        useForm<EquipmentCodeFormData>({
            code: '',
            description: '',
            category_id: '',
        });

    useEffect(() => {
        if (!show) return;
        setData({
            code: (equipmentCode?.code ?? '').toUpperCase(),
            description: equipmentCode?.description ?? '',
            category_id: equipmentCode?.category_id ?? '',
        });
        clearErrors();
    }, [show, equipmentCode, setData, clearErrors]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!equipmentCode?.id) return;

        setData('code', (data.code.trim()).toUpperCase());
        setData('description', data.description ? data.description.trim() : null);

        put(`/equipment-codes/${equipmentCode.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                clearErrors();
                onClose();
            },
        });
    };

    const handleClose = () => {
        onClose();
        clearErrors();
    };

    const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

    return (
        <EditModal
            show={show}
            onClose={handleClose}
            title={`Edit Code #${equipmentCode?.id ?? ''}`}
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Category first */}
            <div>
                <label className="mb-1 block font-medium">Category</label>
                <Select
                    options={categoryOptions}
                    isClearable
                    value={categoryOptions.find((o) => o.value === data.category_id) || null}
                    onChange={(opt) => setData('category_id', opt ? opt.value : '')}
                    placeholder="Select Category"
                    className="text-sm"
                    maxMenuHeight={180}
                    styles={{
                        container: (base) => ({ ...base, width: '100%' }),
                        control: (base) => ({ ...base, minHeight: 36, width: '100%' }),
                        menu: (base) => ({ ...base, width: '100%' }),
                    }}
                />
                {errors.category_id && <p className="mt-1 text-xs text-red-500">You need to select a category.</p>}
            </div>

            {/* Code Number */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Code Number</label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2"
                    placeholder="e.g., 406"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value)}
                />
                {errors.code && <p className="mt-1 text-xs text-red-500">You need to fill the Code field.</p>}
            </div>

            {/* Description (nullable) */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Description</label>
                <textarea
                    rows={4}
                    className="w-full resize-none rounded-lg border p-2"
                    placeholder="Short description (optional)"
                    value={data.description ?? ''}
                    onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>
        </EditModal>
    );
}
