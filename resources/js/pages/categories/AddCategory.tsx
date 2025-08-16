import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

import AddModal from '@/components/modals/AddModal';
import { CategoryFormData } from '@/types/category';

type Props = {
    show: boolean;
    onClose: () => void;
};

export default function AddCategoryModal({ show, onClose }: Props) {

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<CategoryFormData>({
        name: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/categories', {
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
            title="Add Category"
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
                    onChange={(e) => 
                        setData('name', e.target.value)
                    }
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
        </AddModal>
    );
}
