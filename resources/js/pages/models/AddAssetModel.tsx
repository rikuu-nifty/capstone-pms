import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AddModal from '@/components/modals/AddModal';
import type { AssetModelFormData } from '@/types/asset-model';
import { formatEnums } from '@/types/custom-index';
import Select from "react-select";

interface AddAssetModelProps {
    show: boolean;
    onClose: () => void;
    categories: { id: number; name: string }[];
    defaultCategoryId?: number;
};

const statusOptions = ['active', 'is_archived'];

export default function AddAssetModelModal({
    show,
    onClose,
    categories,
    defaultCategoryId,
}: AddAssetModelProps) {

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<AssetModelFormData>({
        brand: '',
        model: '',
        category_id: defaultCategoryId ?? 0,
        status: 'active',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/models', {
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
    }, [show, reset, clearErrors, defaultCategoryId]);

    return (
        <AddModal
            show={show}
            onClose={() => {
                onClose();
                reset();
                clearErrors();
            }}
            title="Add New Model"
            onSubmit={handleSubmit}
            processing={processing}
        >
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Category</label>
                <Select
                    className="w-full"
                    options={categories.map((c) => ({
                        value: c.id,
                        label: c.name,
                    }))}
                    value={
                    data.category_id
                        ? { value: data.category_id, label: categories.find(c => c.id === data.category_id)?.name || "" }
                        : null
                    }
                    onChange={(opt) => 
                        setData(
                            "category_id", 
                            opt ? opt.value : 0
                        )
                    }
                    placeholder="Search or select a category..."
                    isSearchable
                />
                {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
            </div>

            

            {/* Brand */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Brand</label>
                <input
                type="text"
                placeholder="e.g., Lenovo"
                className="w-full rounded-lg border p-2"
                value={data.brand}
                onChange={(e) => setData('brand', e.target.value)}
                />
                {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand}</p>}
            </div>

            {/* Model */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Model</label>
                <input
                type="text"
                placeholder="e.g., ThinkPad T480"
                className="w-full rounded-lg border p-2"
                value={data.model}
                onChange={(e) => setData('model', e.target.value)}
                />
                {errors.model && <p className="mt-1 text-xs text-red-500">{errors.model}</p>}
            </div>
            
            {/* Status */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Status</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.status}
                    onChange={(e) => 
                        setData('status', (e.target.value as '' | 'active' | 'is_archived'))
                    }
                >
                    {statusOptions.map((s) => (
                        <option key={s || 'all'} value={s}>
                        {s ? formatEnums(s) : '—'}
                        </option>
                    ))}
                </select>
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
            </div>
        </AddModal>
    );
}
