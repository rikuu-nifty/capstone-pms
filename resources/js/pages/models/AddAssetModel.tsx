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
    equipment_codes: { id: number; code: string; description?: string | null; category_id: number; }[];
    defaultCategoryId?: number;
};

const statusOptions = ['active', 'is_archived'];

export default function AddAssetModelModal({
    show,
    onClose,
    categories,
    equipment_codes,
    defaultCategoryId,
}: AddAssetModelProps) {

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<AssetModelFormData>({
        brand: '',
        model: '',
        category_id: defaultCategoryId ?? 0,
        equipment_code_id: null,
        status: 'active',
    });

    const filteredEquipmentCodes = equipment_codes.filter(
        (ec) => ec.category_id === data.category_id
    );
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
            {/* Category */}
            <div>
                <label className="mb-1 block font-medium">Category</label>
                <Select
                    className="w-full"
                    isClearable
                    options={categories.map((c) => ({
                        value: c.id,
                        label: c.name,
                    }))}
                    value={
                    data.category_id
                        ? { value: data.category_id, label: categories.find(c => c.id === data.category_id)?.name || "" }
                        : null
                    }
                    onChange={(opt) => {
                        setData("category_id", opt ? opt.value : 0);
                        setData("equipment_code_id", null);
                    }}
                    placeholder="Search or select a category..."
                    isSearchable
                />
                {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
            </div>

            {/* Equipment Code */}
            <div>
                <label className="mb-1 block font-medium">Equipment Code</label>
                <Select
                    className="w-full"
                    isClearable
                    options={filteredEquipmentCodes.map((ec) => ({
                        value: ec.id,
                        label: `${ec.code} ${ec.description ? `- ${ec.description}` : ''}`,
                    }))}
                    value={
                    data.equipment_code_id
                        ? {
                            value: data.equipment_code_id,
                            label:
                            filteredEquipmentCodes.find((ec) => ec.id === data.equipment_code_id)?.code ||
                            '',
                        }
                        : null
                    }
                    onChange={(opt) => setData('equipment_code_id', opt ? opt.value : null)}
                    placeholder={
                    data.category_id
                        ? "Search or select an equipment code..."
                        : "Select a Category first"
                    }
                    isDisabled={!data.category_id}
                    isSearchable
                />
                {errors.equipment_code_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.equipment_code_id}</p>
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
                onChange={(e) => setData('brand', e.target.value)}
                />
                {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand}</p>}
            </div>

            {/* Model */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Model / Specifications</label>
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
                        <option 
                            key={s || 'all'} 
                            value={s}
                        >
                            {s === 'is_archived' ? 'Archived' : formatEnums(s)}
                        </option>
                    ))}
                </select>
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
            </div>
        </AddModal>
    );
}
