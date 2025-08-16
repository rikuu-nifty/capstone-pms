import { useEffect } from 'react';
import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';
import type { AssetModelWithCounts, AssetModelFormData, StatusOption, } from '@/types/asset-model';

interface UpdateModelProps {
    show: boolean;
    onClose: () => void;
    model: AssetModelWithCounts;
    categories: { 
        id: number; 
        name: string 
    }[];
};

type CategoryOption = { 
    value: number; 
    label: string 
};

export default function EditAssetModelModal({
    show,
    onClose,
    model,
    categories,
}: UpdateModelProps) {

    const { data, setData, put, processing, errors, clearErrors } = useForm<AssetModelFormData>({
        category_id: model.category_id,
        brand: model.brand ?? '',
        model: model.model ?? '',
        status: model.status,
    });

    useEffect(() => {
        if (!show) return;

        setData(prev => ({
            ...prev,
            category_id: model.category_id,
            brand: model.brand ?? '',
            model: model.model ?? '',
            status: model.status,
        }));

        clearErrors();
    }, [
        show, 
        model, 
        setData, 
        clearErrors
    ]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('asset-models.update', model.id), {
            preserveScroll: true,
            onSuccess: () => {
                clearErrors();
                onClose();
            },
        });
    };

    return (
        <EditModal
            show={show}
            onClose={() => {
                onClose();
                clearErrors();
            }}
            title={`Edit Asset Model #${model.id}`}
            onSubmit={handleSubmit}
            processing={processing}
        >
        {/* Category */}
        <div className="col-span-2">
            <label className="mb-1 block font-medium">Category</label>
            <Select<CategoryOption, false>
                className="w-full"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={
                    data.category_id
                    ? {
                        value: data.category_id,
                        label: categories.find((c) => c.id === data.category_id)?.name || '',
                        }
                    : null
                }
                onChange={(opt) => 
                    setData('category_id', opt ? opt.value : data.category_id)
                }
                placeholder="Search or select a category..."
                isSearchable
            />
            {errors.category_id && (
                <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>
            )}
        </div>

        {/* Brand */}
        <div className="col-span-1">
            <label className="mb-1 block font-medium">Brand</label>
            <input
                type="text"
                placeholder="e.g., Lenovo"
                className="w-full rounded-lg border p-2"
                value={data.brand}
                onChange={e => setData('brand', e.target.value)}
            />
            {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand}</p>}
        </div>

        {/* Model / Specifications */}
        <div className="col-span-1">
            <label className="mb-1 block font-medium">Model / Specifications</label>
            <input
                type="text"
                placeholder="e.g., ThinkPad T480 or Office Desk"
                className="w-full rounded-lg border p-2"
                value={data.model}
                onChange={e => setData('model', e.target.value)}
            />
            {errors.model && <p className="mt-1 text-xs text-red-500">{errors.model}</p>}
        </div>

        {/* Status (includes blank option; 'Archived' label) */}
        <div className="col-span-1">
            <label className="mb-1 block font-medium">Status</label>
            <select
                className="w-full rounded-lg border p-2"
                value={data.status}
                onChange={e => setData('status', e.target.value as StatusOption)}
            >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="is_archived">Archived</option>
            </select>
            {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
        </div>
        </EditModal>
    );
}
