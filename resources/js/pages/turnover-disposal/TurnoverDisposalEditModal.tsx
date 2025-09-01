import React, { useMemo, useEffect, useState } from 'react';
import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import 'react-datepicker/dist/react-datepicker.css';

import EditModal from '@/components/modals/EditModal';
import { UnitOrDepartment, InventoryList, formatEnums, ucwords, formatForInputDate } from '@/types/custom-index';
import { TurnoverDisposalFormData, TurnoverDisposals } from '@/types/turnover-disposal';

interface TurnoverDisposalEditModalProps {
    show: boolean;
    onClose: () => void;
    turnoverDisposal: TurnoverDisposals;
    unitOrDepartments: UnitOrDepartment[];
    assets: InventoryList[];
    
}

const typeOptions = ['turnover', 'disposal'] as const;
const statusOptions = ['pending_review', 'approved', 'rejected', 'cancelled', 'completed'] as const;

export default function TurnoverDisposalEditModal({
    show,
    onClose,
    turnoverDisposal,
    unitOrDepartments,
    assets,
}: TurnoverDisposalEditModalProps) {

    const { data, setData, put, processing, errors, clearErrors } = useForm<TurnoverDisposalFormData>({
        issuing_office_id: turnoverDisposal.issuing_office_id ?? 0,
        type: turnoverDisposal.type,
        receiving_office_id: turnoverDisposal.receiving_office_id ?? 0,
        description: turnoverDisposal.description ?? '',
        personnel_in_charge: turnoverDisposal.personnel_in_charge ?? '',
        document_date: turnoverDisposal.document_date ?? '',
        status: turnoverDisposal.status,
        remarks: turnoverDisposal.remarks ?? '',
        selected_assets: (turnoverDisposal.turnover_disposal_assets ?? []).map(a => a.asset_id),
    });

    const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);

    // useEffect(() => {
    //     if (!show) return;
    //     reset({
    //         issuing_office_id: turnoverDisposal.issuing_office_id ?? 0,
    //         type: turnoverDisposal.type,
    //         receiving_office_id: turnoverDisposal.receiving_office_id ?? 0,
    //         description: turnoverDisposal.description ?? '',
    //         personnel_in_charge: turnoverDisposal.personnel_in_charge ?? '',
    //         document_date: turnoverDisposal.document_date ?? '',
    //         status: turnoverDisposal.status,
    //         remarks: turnoverDisposal.remarks ?? '',
    //         selected_assets: (turnoverDisposal.turnover_disposal_assets ?? []).map(a => a.asset_id),
    //     });
    //     clearErrors();
    //     setShowAssetDropdown([true]);
    // }, [
    //     show, 
    //     turnoverDisposal, 
    //     reset, 
    //     clearErrors
    // ]);

    useEffect(() => {
        if (show) 
            setData(prev => ({
                ...prev,
                issuing_office_id: turnoverDisposal.issuing_office_id ?? 0,
                type: turnoverDisposal.type,
                receiving_office_id: turnoverDisposal.receiving_office_id ?? 0,
                description: turnoverDisposal.description ?? '',
                personnel_in_charge: turnoverDisposal.personnel_in_charge ?? '',
                document_date: formatForInputDate(turnoverDisposal.document_date) ?? '',
                status: turnoverDisposal.status,
                remarks: turnoverDisposal.remarks ?? '',
                selected_assets: (
                    turnoverDisposal.turnover_disposal_assets ?? []
                ).map(a => a.asset_id)
            }));
            clearErrors();
            setShowAssetDropdown([true]);
        }, [
        show,
        clearErrors,
        setData,
        turnoverDisposal,
    ]);

    const filteredAssets = useMemo(() => {
        if (!data.issuing_office_id) return [];
        const selected = new Set(data.selected_assets);
        return assets.filter(
            a => a.unit_or_department_id === data.issuing_office_id && !selected.has(a.id),
        );
    }, [
        assets, 
        data.issuing_office_id, 
        data.selected_assets
    ]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/turnover-disposal/${turnoverDisposal.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                clearErrors();
                setShowAssetDropdown([true]);
                onClose();
            },
        });
    };

    const handleClose = () => {
        onClose();
        clearErrors();
        setShowAssetDropdown([true]);
    };

    return (
        <EditModal
            show={show}
            onClose={handleClose}
            title={`Edit ${formatEnums(turnoverDisposal.type)} Record #${turnoverDisposal.id}`}
            onSubmit={handleSubmit}
            processing={processing}
            >
            {/* Type */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Type</label>
                <select
                className="w-full rounded-lg border p-2"
                value={data.type}
                onChange={e => setData('type', e.target.value as (typeof typeOptions)[number])}
                >
                <option value="">Select Record Type</option>
                {typeOptions.map(type => (
                    <option key={type} value={type}>
                    {formatEnums(type)}
                    </option>
                ))}
                </select>
                {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
            </div>

            {/* Status */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Status</label>
                <select
                className="w-full rounded-lg border p-2"
                value={data.status}
                onChange={e => setData('status', e.target.value as (typeof statusOptions)[number])}
                >
                <option value="">Select Status</option>
                {statusOptions.map(status => (
                    <option key={status} value={status}>
                    {formatEnums(status)}
                    </option>
                ))}
                </select>
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
            </div>

            {/* Issuing Office */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Issuing Office</label>
                <select
                className="w-full rounded-lg border p-2"
                value={data.issuing_office_id}
                onChange={e => {
                    const id = Number(e.target.value);
                    setData('issuing_office_id', id);
                    setData('selected_assets', []);
                    setShowAssetDropdown([true]);
                }}
                >
                <option value={0}>Select Unit/Dept/Lab</option>
                    {unitOrDepartments.map(unit => (
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
                onChange={e => setData('receiving_office_id', Number(e.target.value))}
                >
                <option value={0}>Select Unit/Dept/Lab</option>
                    {unitOrDepartments.map(unit => (
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
                placeholder="Enter description of the record (e.g., reason for turnover or disposal)"
                rows={3}
                className="w-full resize-none rounded-lg border p-2"
                value={data.description ?? ''}
                onChange={e => setData('description', e.target.value)}
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Personnel In Charge */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Personnel in Charge</label>
                <input
                    placeholder="Enter the full name of the personnel"
                    type="text"
                    className="w-full rounded-lg border p-2"
                    value={data.personnel_in_charge ?? ''}
                    onChange={e => setData('personnel_in_charge', ucwords(e.target.value))}
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
                className="w-full rounded-lg border p-2 uppercase"
                value={data.document_date}
                onChange={e => setData('document_date', e.target.value)}
                />
                {errors.document_date && <p className="mt-1 text-xs text-red-500">{errors.document_date}</p>}
            </div>

            {/* Selected Assets */}
            <div className="col-span-2 flex flex-col gap-3">
                <label className="block font-medium text-gray-800">Assets Covered</label>

                <div className="flex flex-wrap gap-2">
                    {data.selected_assets.length > 0 ? (
                        data.selected_assets.map((assetId, index) => {
                            const selectedAsset = assets.find(a => a.id === assetId);
                            return (
                                <div
                                    key={`selected-${assetId}-${index}`}
                                    className="cursor-default flex items-center justify-between rounded-md border border-blue-200 bg-white px-3 py-2 shadow-sm hover:shadow-md transition w-fit"
                                >
                                    <span className="font-medium text-blue-700">
                                    {selectedAsset
                                        ? `${selectedAsset.asset_name ?? 'Unnamed'} (${selectedAsset.serial_no ?? 'N/A'})`
                                        : 'Asset not found'}
                                    </span>
                                    <button
                                    type="button"
                                    onClick={() => {
                                        const updated = [...data.selected_assets];
                                        updated.splice(index, 1);
                                        setData('selected_assets', updated);
                                        setShowAssetDropdown(prev => {
                                            const next = [...prev];
                                            next.splice(index, 1);
                                            return next.length ? next : [true];
                                        });
                                    }}
                                    className="cursor-pointer ml-3 text-blue-400 hover:text-red-600 font-extrabold transition text-lg leading-none"
                                    title="Remove asset"
                                    >
                                    ×
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-xs text-red-500">No assets linked yet.</p>
                    )}
                </div>

                {showAssetDropdown.map(
                    (visible, index) => visible && (
                        <div key={`dropdown-${index}`} className="flex items-center gap-2">
                            <Select
                                key={`asset-${data.issuing_office_id}-${index}-${data.selected_assets.length}`}
                                className="w-full text-sm"
                                isDisabled={!data.issuing_office_id}
                                options={filteredAssets.map(asset => ({
                                    value: asset.id,
                                    label: `${asset.serial_no} – ${asset.asset_name ?? ''}`,
                                }))}
                                placeholder={
                                data.issuing_office_id
                                    ? 'Add an asset...'
                                    : 'Select an Issuing Office first'
                                }
                                noOptionsMessage={() =>
                                data.issuing_office_id
                                    ? 'No available assets'
                                    : 'Select an Issuing Office first'
                                }
                                onChange={opt => {
                                if (opt && !data.selected_assets.includes(opt.value)) {
                                    setData('selected_assets', [...data.selected_assets, opt.value]);
                                    setShowAssetDropdown(prev => {
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
                onChange={e => setData('remarks', e.target.value)}
                />
                {errors.remarks && <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>}
            </div>
        </EditModal>
    );
}
