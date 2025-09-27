import { useEffect } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import EditModal from '@/components/modals/EditModal'
import type { EquipmentCode, EquipmentCodeFormData } from '@/types/equipment-code'
import type { Category } from '@/types/category'

interface Props {
    show: boolean
    onClose: () => void
    equipmentCode: EquipmentCode
}

export default function EditEquipmentCodeModal({ show, onClose, equipmentCode }: Props) {
    const categories = usePage<{ categories: Category[] }>().props.categories ?? []

    const { data, setData, put, processing, errors, clearErrors } =
        useForm<EquipmentCodeFormData>({
        code_number: '',
        description: '',
        category_id: '',
        })

    useEffect(() => {
        if (!show) return
        setData({
        code_number: equipmentCode?.code_number ?? '',
        description: equipmentCode?.description ?? '',
        category_id: equipmentCode?.category_id ?? '',
        })
        clearErrors()
    }, [show, equipmentCode, setData, clearErrors])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!equipmentCode?.id) return
        put(`/equipment-codes/${equipmentCode.id}`, {
        preserveScroll: true,
        onSuccess: () => { clearErrors(); onClose() },
        })
    }

    const handleClose = () => { onClose(); clearErrors() }

    return (
        <EditModal
        show={show}
        onClose={handleClose}
        title={`Edit Code #${equipmentCode?.id ?? ''}`}
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
        </EditModal>
    )
}
