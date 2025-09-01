import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import AddModal from "@/components/modals/AddModal";
import { UnitOrDepartment, User, InventoryList, formatEnums, ucwords } from '@/types/custom-index';
import { TurnoverDisposalFormData } from '@/types/turnover-disposal';

interface TurnoverDisposalAddModalProps {
    show: boolean;
    onClose: () => void;
    assignedBy: User;
    unitOrDepartments: UnitOrDepartment[];
    assets: InventoryList[];
}

const typeOptions = [ 'turnover', 'disposal' ];
const statusOptions = [ 'pending_review', 'approved', 'rejected', 'cancelled', 'completed' ];

export default function TurnoverDisposalAddModal({
    show,
    onClose,
    unitOrDepartments,
    // assignedBy,
    assets,
}: TurnoverDisposalAddModalProps) {

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<TurnoverDisposalFormData>({
        issuing_office_id: 0,
        type: 'turnover',
        receiving_office_id: 0,
        description: '',
        personnel_in_charge: '',
        document_date: '',
        status: 'pending_review',
        remarks: '',
        
        selected_assets: [],
    });

    const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);

    const filteredAssets = useMemo(() => {
        if (!data.issuing_office_id) return [];

        const selected = new Set(data.selected_assets);
        return assets.filter(
            (a) => a.unit_or_department_id === data.issuing_office_id && !selected.has(a.id)
        );
    }, [
        assets,
        data.issuing_office_id,
        data.selected_assets,
    ]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/turnover-disposal', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setShowAssetDropdown([true]);
                onClose();
            },
        });
    };

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
    
    return (
        <AddModal
            show={show}
            onClose={() => {
                onClose();
                reset();
                clearErrors();
                setShowAssetDropdown([true]);
            }}
            title="Create New Record"
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Type */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Type</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.type}
                    onChange={(e) => 
                        setData('type', e.target.value as 'turnover' | 'disposal')
                    }
                >
                    <option value="">Select Record Type</option>
                    {typeOptions.map((type) => (
                        <option key={type} value={type}>
                            {formatEnums(type)}
                        </option>
                    ))}
                </select>

                {errors.type && (
                    <p className="mt-1 text-xs text-red-500">{errors.type}</p>
                )}                
            </div>

            {/* Status */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Status</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.status}
                    onChange={(e) => 
                        setData('status', e.target.value as 
                            'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'completed'
                        )
                    }
                >
                    <option value="">Select Status</option>
                    {statusOptions.map((status) => (
                        <option key={status} value={status}>
                            {formatEnums(status)}
                        </option>
                    ))}
                </select>

                {errors.type && (
                    <p className="mt-1 text-xs text-red-500">{errors.type}</p>
                )}                
            </div>

            {/* Issuing Office */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Issuing Office</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.issuing_office_id}
                    // onChange={(e) => 
                    //     setData('issuing_office_id', Number(e.target.value))
                    // }
                    onChange={(e) => {
                        const id = Number(e.target.value);
                        setData('issuing_office_id', id);
                        setData('selected_assets', []);
                        setShowAssetDropdown([true]);
                    }}
                >
                    <option value={0}>Select Unit/Dept/Lab</option>
                        {unitOrDepartments.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                                {(unit.code).toUpperCase()} - {unit.name}
                            </option>
                        ))}
                </select>

                {errors.issuing_office_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.issuing_office_id}</p>
                )}                
            </div>

            {/* Receiving Office */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Receiving Office</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.receiving_office_id}
                    onChange={(e) => setData('receiving_office_id', Number(e.target.value))}
                >
                    <option value={0}>Select Unit/Dept/Lab</option>
                    {unitOrDepartments.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                            {(unit.code).toUpperCase()} - {unit.name}
                        </option>
                    ))}
                </select>

                {errors.receiving_office_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.receiving_office_id}</p>
                )}                
            </div>

            {/* Description */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Description</label>
                <textarea
                    placeholder="Enter description of the record (e.g., reason for turnover or disposal"
                    rows={3}
                    className="w-full resize-none rounded-lg border p-2"
                    value={data.description ?? ''}
                    onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Personnel In Charge*/}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Personnel in Charge</label>
                <input
                    placeholder="Enter the full name of the personnel"
                    type="text"
                    className="w-full rounded-lg border p-2"
                    value={data.personnel_in_charge ?? ''}
                    onChange={(e) => 
                        setData('personnel_in_charge', ucwords(e.target.value))
                    }
                />
                {errors.personnel_in_charge && (
                    <p className="mt-1 text-xs text-red-500">{errors.personnel_in_charge}</p>
                )}              
            </div>

            {/* Document Date */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Document Date</label>
                <input
                    type="date"
                    className="w-full rounded-lg border p-2 uppercase "
                    value={data.document_date}
                    onChange={(e) => setData('document_date', e.target.value)}
                />
                {errors.document_date && <p className="mt-1 text-xs text-red-500">{errors.document_date}</p>}
            </div>

            {/* Selected Assets */}
            <div className="col-span-2 flex flex-col gap-4">
                <label className="block font-medium">Assets Covered</label>

                {data.selected_assets.map((assetId, index) => {
                    const selectedAsset = assets.find((a) => a.id === assetId);

                    return (
                        <div key={index} className="flex items-center gap-2">
                            <span className="text-sm text-blue-800">
                                {selectedAsset
                                    ? ` ${selectedAsset.asset_name} (${selectedAsset.serial_no})`
                                    : 'Asset not found'}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    const updated = [...data.selected_assets];
                                    updated.splice(index, 1);
                                    setData('selected_assets', updated);

                                    setShowAssetDropdown((prev) => {
                                        const newState = [...prev];
                                        newState.splice(index, 1);
                                        return newState;
                                    });
                                }}
                                className="text-red-500 text-xs hover:underline cursor-pointer"
                            >
                                Remove
                            </button>
                            
                        </div>
                    );
                })}

                {showAssetDropdown.map((visible, index) =>
                    visible && (
                        <div key={`dropdown-${index}`} className="flex items-center gap-2">
                            <Select
                                key={`asset-${data.issuing_office_id}-${index}-${data.selected_assets.length}`}
                                className="w-full"
                                isDisabled={!data.issuing_office_id}
                                options={filteredAssets.map((asset) => ({
                                    value: asset.id,
                                    label: `${asset.serial_no} – ${asset.asset_name ?? ''}`,
                                }))}
                                placeholder={
                                data.issuing_office_id
                                    ? 'Select Asset(s) Covered...'
                                    : 'Select an Issuing Office first'
                                }
                                noOptionsMessage={() =>
                                data.issuing_office_id
                                    ? 'No Assets Available'
                                    : 'Select an Issuing Office first'
                                }
                                onChange={(opt) => {
                                    if (opt && !data.selected_assets.includes(opt.value)) {
                                        setData('selected_assets', [...data.selected_assets, opt.value]);
                                        setShowAssetDropdown((prev) => {
                                            const updated = [...prev];
                                            updated[index] = false;
                                            return [...updated, true];
                                        });
                                    }
                                }}
                            />
                        </div>
                    )
                )}
                
                {errors.selected_assets && (
                    <p className="mt-1 text-sm text-red-500">{errors.selected_assets}</p>
                )}
            </div>

            {/* Remarks */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Remarks</label>
                <textarea
                    placeholder="Provide notes, clarifications, or other relevant information"
                    rows={3}
                    className="w-full resize-none rounded-lg border p-2"
                    value={data.remarks ?? ''}
                    onChange={(e) => setData('remarks', e.target.value)}
                />
                {errors.remarks && <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>}
            </div>

        </AddModal>
    );
}