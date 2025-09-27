import { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AddModal from '@/components/modals/AddModal';
import type { EquipmentCodeFormData } from '@/types/equipment-code';
import type { Category } from '@/types/category';
import Select from 'react-select';

type Props = { show: boolean; onClose: () => void };

export default function AddEquipmentCodeModal({ show, onClose }: Props) {
    const categories = usePage<{ categories: Category[] }>().props.categories ?? [];

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<EquipmentCodeFormData>({
            code: '',
            description: '',
            category_id: '',
        });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setData('code', data.code.trim());
        setData('description', data.description ? data.description.trim() : null);

        post('/equipment-codes', {
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

    const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

    return (
        <AddModal
            show={show}
            onClose={() => {
                onClose();
                reset();
                clearErrors();
            }}
            title="Add Equipment Code"
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
                <label className="mb-1 block font-medium">Code</label>
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
        </AddModal>
    );
}
