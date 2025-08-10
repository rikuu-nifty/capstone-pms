import { useEffect, useState } from 'react';
// import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import AddModal from "@/components/modals/AddModal";
import { UnitOrDepartment, User, InventoryList } from '@/types/custom-index';
import { TurnoverDisposalFormData } from '@/types/turnover-disposal';

interface TurnoverDisposalAddModalProps {
    show: boolean;
    onClose: () => void;
    assignedBy: User;
    unitOrDepartments: UnitOrDepartment[];
    assets: InventoryList[];
}

export default function TurnoverDisposalAddModal({
    show,
    onClose,
    unitOrDepartments,
    // assignedBy,
    // assets,
}: TurnoverDisposalAddModalProps) {

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<TurnoverDisposalFormData>({
        issuing_office_id: 0,
        type: 'turnover',
        receiving_office_id: 0,
        description: '',
        personnel_in_charge_id: '',
        document_date: '',
        status: 'pending_review',
        remarks: '',
        
        selected_assets: [],
    });

    const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);

    useEffect(() => {
        if (show) {
            reset();
            clearErrors();
            setShowAssetDropdown([true]);
        }
    }, [
        show, 
        reset, 
        clearErrors
    ]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/turnover-disposals', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setShowAssetDropdown([true]);
                onClose();
            },
        });
    };

    return (
        <AddModal
            show={show}
            onClose={() => {
                onClose();
                reset();
                clearErrors();
                setShowAssetDropdown([true]);
            }}
            title="Create New Turnover/Disposal"
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Issuing Office */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Issuing Office</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.issuing_office_id}
                    onChange={(e) => setData('issuing_office_id', Number(e.target.value))}
                >
                    <option value={0}>Select Unit/Dept/Lab</option>
                    {unitOrDepartments.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                        {unit.code} - {unit.name}
                        </option>
                    ))}
                </select>

                {errors.issuing_office_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.issuing_office_id}</p>
                )}
            </div>
        </AddModal>
    );
}