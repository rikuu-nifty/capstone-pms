import { useEffect } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import AddModal from '@/components/modals/AddModal'
import type { EquipmentCodeFormData } from '@/types/equipment-code'
import type { Category } from '@/types/category'

type Props = { show: boolean; onClose: () => void }

export default function AddEquipmentCodeModal({ show, onClose }: Props) {
    const categories = usePage<{ categories: Category[] }>().props.categories ?? []

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<EquipmentCodeFormData>({
        code_number: '',
        description: '',
        category_id: '',
        })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        post('/equipment-codes', {
        preserveScroll: true,
        onSuccess: () => { reset(); clearErrors(); onClose() },
        })
    }

    useEffect(() => { if (show) { reset(); clearErrors() } }, [show, reset, clearErrors])

    return (
        <AddModal
        show={show}
        onClose={() => { onClose(); reset(); clearErrors() }}
        title="Add Equipment Code"
        onSubmit={handleSubmit}
        processing={processing}
        >
        <div className="col-span-1">
            <label className="mb-1 block font-medium">Code Number</label>
            <input
            type="text"
            className="w-full rounded-lg border p-2"
            placeholder="e.g., 406"
            value={data.code_number}
            onChange={(e) => setData('code_number', e.target.value)}
            required
            />
            {errors.code_number && <p className="mt-1 text-xs text-red-500">{errors.code_number}</p>}
        </div>

        <div className="col-span-2">
            <label className="mb-1 block font-medium">Description</label>
            <textarea
            rows={3}
            className="w-full resize-none rounded-lg border p-2"
            placeholder="e.g., Aircondition / air curtain / air cooler"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            required
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
        </div>

        <div className="col-span-2">
            <label className="mb-1 block font-medium">Category</label>
            <select
            className="w-full rounded-lg border p-2"
            value={data.category_id}
            onChange={(e) => setData('category_id', e.target.value ? Number(e.target.value) : '')}
            required
            >
            <option value="">Select Category</option>
            {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
        </div>
        </AddModal>
    )
}
