import { useEffect, useState } from 'react';
// import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import AddModal from "@/components/modals/AddModal";
import { UnitOrDepartment, User, InventoryList } from '@/types/custom-index';

interface TurnoverDisposalAddModalProps {
    show: boolean;
    onClose: () => void;
    currentUser: User;
    unitOrDepartments: UnitOrDepartment[];
    assets: InventoryList[];
}

export default function TurnoverDisposalAddModal({
    show,
    onClose,
    currentUser,
    // assets,
}: TurnoverDisposalAddModalProps) {

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<TurnoverDisposalFormData>({
        type: 'turnover',
        currentUser: currentUser.id,
        personnel_in_charge: '',
        document_date: '',
        status: 'pending_review',
        
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
            {/* Organization */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Unit/Dept/Lab</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.current_organization}
                    onChange={(e) => setData('current_organization', Number(e.target.value))}
                >
                    <option value="">Select Unit/Dept</option>
                    {unitOrDepartments.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                            {unit.code} - {unit.name}
                        </option>
                    ))}
                </select>
                {errors.current_organization && <p className="mt-1 text-xs text-red-500">{errors.current_organization}</p>}
            </div>
        </AddModal>
    );
}