import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';
import type { Category, CategoryFormData, CategoryWithModels } from '@/types/category';

interface EditCategoryProps {
    show: boolean;
    onClose: () => void;
    category: Category | CategoryWithModels;
};

export default function EditCategoryModal({ 
    show, 
    onClose, 
    category 
}: EditCategoryProps) {
    
    const { data, setData, put, processing, errors, clearErrors } = useForm<CategoryFormData>({
        name: '',
        description: '',
    });

    useEffect(() => {
        if (!show) return;

        setData({
            name: category?.name ?? '',
            description: (category?.description as string | undefined) ?? '',
        });
        clearErrors();
    }, [
        show, 
        category, 
        setData, 
        clearErrors
    ]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!category?.id) return;

        put(`/categories/${category.id}`, {
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

    return (
        <EditModal
            show={show}
            onClose={handleClose}
            title={`Edit Category #${category?.id ?? ''}`}
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Name */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Name</label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2"
                    placeholder="e.g., Computers"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Description</label>
                <textarea
                    rows={3}
                    className="w-full resize-none rounded-lg border p-2"
                    placeholder="Short description (optional)"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>
        </EditModal>
    );
}
