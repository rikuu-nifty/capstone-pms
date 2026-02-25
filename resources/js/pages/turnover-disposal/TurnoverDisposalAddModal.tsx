import AddModal from '@/components/modals/AddModal';
import { formatEnums, InventoryList, Personnel, UnitOrDepartment, User } from '@/types/custom-index';
import { TurnoverDisposalFormData } from '@/types/turnover-disposal';
import type { TdaStatus, TurnoverDisposalAssetInput } from '@/types/turnover-disposal-assets';
import { useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import Select, { SingleValue } from 'react-select';
import AssetTdaItem from './AssetTdaItem';

type Option = { value: number; label: string };

interface TurnoverDisposalAddModalProps {
    show: boolean;
    onClose: () => void;
    assignedBy: User;
    unitOrDepartments: UnitOrDepartment[];
    assets: InventoryList[];
    personnels: Personnel[];
}

const typeOptions = ['turnover', 'disposal'] as const;
const statusOptions = ['pending_review', 'approved', 'rejected', 'cancelled', 'completed'] as const;
const categoryOptions = ['sharps', 'breakages', 'chemical', 'hazardous', 'non_hazardous'] as const;

export default function TurnoverDisposalAddModal({ show, onClose, unitOrDepartments, assets, personnels }: TurnoverDisposalAddModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors, setError } = useForm<TurnoverDisposalFormData>({
        issuing_office_id: 0,
        type: 'turnover',
        turnover_category: null,

        receiving_office_id: null, // null not 0 for nullable to be less buggy
        external_recipient: '',

        description: '',
        personnel_in_charge: '',
        document_date: '',
        status: 'pending_review',
        remarks: '',
        is_donation: false,

        turnover_disposal_assets: [],

        personnel_id: null,
    });

    const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);

    // ✅ PUT THIS HERE
    const pmoUnit = useMemo(() => {
        return (
            unitOrDepartments.find((u) => {
                const code = (u.code || '').trim().toLowerCase();
                const name = (u.name || '').trim().toLowerCase();
                return code === 'pmo' || name.includes('property management office');
            }) ?? null
        );
    }, [unitOrDepartments]);

    const pmoUnitId = pmoUnit?.id ?? null;

    // ✅ PUT THIS HERE (after pmoUnitId)
    useEffect(() => {
        if (!show) return;
        if (!pmoUnitId) return;

        setData('receiving_office_id', pmoUnitId);

        // ✅ if old error exists, clear it because PMO is auto-selected
        clearErrors('receiving_office_id');
    }, [show, pmoUnitId, setData, clearErrors]);

    useEffect(() => {
        if (show) {
            reset();
            clearErrors();
            setShowAssetDropdown([true]);

            if (pmoUnitId) {
                setData('receiving_office_id', pmoUnitId);
                clearErrors('receiving_office_id');
            }
        }
    }, [show, reset, clearErrors, pmoUnitId, setData]);

    const selectedIds = useMemo(() => new Set<number>(data.turnover_disposal_assets.map((li) => li.asset_id)), [data.turnover_disposal_assets]);

    // const filteredAssets = useMemo<InventoryList[]>(() => {
    //   if (!data.issuing_office_id) return [];
    //   return assets.filter((a) => a.unit_or_department_id === data.issuing_office_id && !selectedIds.has(a.id));
    // }, [assets, data.issuing_office_id, selectedIds]);

    const filteredAssets = useMemo<InventoryList[]>(() => {
        if (!data.issuing_office_id) return [];

        return assets.filter((a) => {
            const matchesOffice = a.unit_or_department_id === data.issuing_office_id; // issuing office
            const notSelected = !selectedIds.has(a.id); // must not already be selected
            const matchesPersonnel = !data.personnel_id || a.assigned_to === data.personnel_id; // if a personnel is selected, must match their assigned assets

            return matchesOffice && notSelected && matchesPersonnel;
        });
    }, [assets, data.issuing_office_id, data.personnel_id, selectedIds]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearErrors();

        let hasError = false;

        // ✅ Always ensure PMO is set before validating (prevents false receiving office error)
        const effectiveReceivingOfficeId = pmoUnitId ?? data.receiving_office_id ?? null;

        if (!effectiveReceivingOfficeId) {
            // This should almost never happen unless PMO doesn't exist in DB
            hasError = true;
            setError('receiving_office_id', 'Property Management Office (PMO) is not configured. Please contact admin.');
        } else if (data.receiving_office_id !== effectiveReceivingOfficeId) {
            // keep form state aligned
            setData('receiving_office_id', effectiveReceivingOfficeId);
            clearErrors('receiving_office_id');
        }

        if (data.is_donation) {
            // ✅ Donation: PMO is still receiving office, but external recipient must be provided
            const isExternalRecipientEmpty = !data.external_recipient || data.external_recipient.trim() === '';

            if (isExternalRecipientEmpty) {
                hasError = true;
                setError('external_recipient', 'External Recipient is required for donation.');
            }

            // ✅ Do NOT set error for receiving_office_id since it is auto-selected
        } else {
            // ✅ Non-donation: do NOT validate receiving office (auto-selected PMO)
            clearErrors('receiving_office_id');
        }

        if (hasError) return;

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

    const addLine = (asset_id: number) => {
        const defaultStatus: TdaStatus = 'pending';
        const next: TurnoverDisposalAssetInput = {
            asset_id,
            asset_status: defaultStatus,
            date_finalized: null,
            remarks: '',
        };
        setData('turnover_disposal_assets', [...data.turnover_disposal_assets, next]);
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
                    onChange={(e) => setData('type', e.target.value as (typeof typeOptions)[number])}
                >
                    <option value="">Select Record Type</option>
                    {typeOptions.map((type) => (
                        <option key={type} value={type}>
                            {formatEnums(type)}
                        </option>
                    ))}
                </select>
                {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
            </div>

            {/* Turnover Category */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Turnover Category</label>
                <select
                    className="w-full cursor-pointer rounded-lg border p-2"
                    value={data.turnover_category ?? ''}
                    onChange={(e) =>
                        setData('turnover_category', e.target.value === '' ? null : (e.target.value as (typeof categoryOptions)[number]))
                    }
                >
                    <option value="">Select Category</option>
                    {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                            {formatEnums(cat)}
                        </option>
                    ))}
                </select>
                {errors.turnover_category && <p className="mt-1 text-xs text-red-500">{errors.turnover_category}</p>}
            </div>

            <div className="col-span-2 flex items-center gap-2">
                <input
                    id="is_donation"
                    type="checkbox"
                    className="cursor-pointer"
                    checked={!!data.is_donation}
                    onChange={(e) => setData('is_donation', e.target.checked)}
                />
                <label htmlFor="is_donation" className="text-sm font-medium">
                    For Donation
                </label>
            </div>

            {/* External Recipient */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">External Recipient</label>
                <input
                    type="text"
                    className={`w-full rounded-lg border p-2 ${!data.is_donation ? 'bg-gray-100 text-gray-500' : ''}`}
                    placeholder="Enter recipient name or organization for donation"
                    value={data.external_recipient ?? ''}
                    onChange={(e) => setData('external_recipient', e.target.value)}
                    disabled={!data.is_donation}
                />
                {errors.external_recipient && <p className="mt-1 text-xs text-red-500">{errors.external_recipient}</p>}
            </div>

            {/* Issuing Office */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Issuing Office</label>
                <Select
                    className="w-full text-sm"
                    isClearable
                    value={
                        unitOrDepartments
                            .map((unit) => ({
                                value: unit.id,
                                label: ` ${unit.name}`,
                            }))
                            .find((opt) => opt.value === data.issuing_office_id) ?? null
                    }
                    onChange={(opt) => {
                        const id = opt ? opt.value : 0;
                        setData('issuing_office_id', id);
                        setData('personnel_id', null);
                        setData('turnover_disposal_assets', []);
                        setShowAssetDropdown([true]);
                    }}
                    options={unitOrDepartments.map((unit) => ({
                        value: unit.id,
                        label: `${unit.name}`,
                    }))}
                    placeholder="Select Unit/Dept/Lab"
                />
                {errors.issuing_office_id && <p className="mt-1 text-xs text-red-500">{errors.issuing_office_id}</p>}
            </div>

            {/* Issuing Office (exclude PMO) */}
            {/* <div className="col-span-1">
        <label className="mb-1 block font-medium">Issuing Office</label>
        <Select
          className="w-full text-sm"
          isClearable
          value={
            unitOrDepartments
              .filter((unit) => {
                const code = (unit.code || '').trim().toLowerCase();
                const name = (unit.name || '').trim().toLowerCase();
                return code !== 'pmo' && !name.includes('property management office');
              })
              .map((unit) => ({
                value: unit.id,
                label: `${unit.name}`,
              }))
              .find((opt) => opt.value === data.issuing_office_id) ?? null
          }
          onChange={(opt) => {
            const id = opt ? opt.value : 0;
            setData('issuing_office_id', id);
            setData('personnel_id', null);
            setData('turnover_disposal_assets', []);
            setShowAssetDropdown([true]);
          }}
          options={unitOrDepartments
            .filter((unit) => {
              const code = (unit.code || '').trim().toLowerCase();
              const name = (unit.name || '').trim().toLowerCase();
              return code !== 'pmo' && !name.includes('property management office');
            })
            .map((unit) => ({
              value: unit.id,
              label: `${unit.name}`,
            }))}
          placeholder="Select Unit/Dept/Lab"
        />
        {errors.issuing_office_id && (
          <p className="mt-1 text-xs text-red-500">{errors.issuing_office_id}</p>
        )}
      </div> */}

            {/* Receiving Office
      <div className="col-span-1">
        <label className="mb-1 block font-medium">Receiving Office</label>
        <Select
          className="w-full text-sm"
          isClearable
          value={
            unitOrDepartments
              .map((unit) => ({
                value: unit.id,
                label: `${unit.name}`,
              }))
              .find((opt) => opt.value === data.receiving_office_id) ?? null
          }
          onChange={(opt) => {
            const id = opt ? opt.value : 0;
            setData('receiving_office_id', id);
          }}
          options={unitOrDepartments.map((unit) => ({
            value: unit.id,
            label: `${unit.name}`,
          }))}
          placeholder="Select Unit/Dept/Lab"
        />
        {errors.receiving_office_id && (
          <p className="mt-1 text-xs text-red-500">{errors.receiving_office_id}</p>
        )}
      </div> */}

            {/* Receiving Office (fixed to PMO but shows all departments) */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Receiving Office</label>

                <Select
                    className="w-full text-sm"
                    isDisabled
                    value={
                        unitOrDepartments
                            .map((unit) => ({
                                value: unit.id,
                                label: unit.name,
                            }))
                            .find((opt) => opt.value === data.receiving_office_id) ?? null
                    }
                    options={unitOrDepartments.map((unit) => ({
                        value: unit.id,
                        label: unit.name,
                    }))}
                />

                {/* <p className="mt-1 text-xs text-muted-foreground">
    Auto-selected to Property Management Office.
  </p> */}

                {errors.receiving_office_id && <p className="mt-1 text-xs text-red-500">{errors.receiving_office_id}</p>}
            </div>

            {/* Status */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Status</label>
                <select
                    className="w-full rounded-lg border p-2"
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value as (typeof statusOptions)[number])}
                >
                    {statusOptions.map((status) => (
                        <option key={status} value={status} disabled={status !== 'pending_review'}>
                            {formatEnums(status)}
                        </option>
                    ))}
                </select>
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
            </div>

            {/* Description */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Description</label>
                <textarea
                    placeholder="Enter description (e.g., reason for turnover or disposal)"
                    rows={3}
                    className="w-full resize-none rounded-lg border p-2"
                    value={data.description ?? ''}
                    onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* PIC */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Personnel in Charge</label>
                <Select
                    className="w-full"
                    isClearable
                    isDisabled={!data.issuing_office_id}
                    options={personnels
                        .filter((p) => p.unit_or_department_id === data.issuing_office_id)
                        .map((p) => ({ value: p.id, label: p.full_name }))}
                    placeholder={data.issuing_office_id ? 'Select Personnel...' : 'Select an Issuing Office first'}
                    value={
                        personnels.find((p) => p.id === data.personnel_id)
                            ? { value: data.personnel_id!, label: personnels.find((p) => p.id === data.personnel_id)!.full_name }
                            : null
                    }
                    // onChange={(opt) => setData('personnel_id', opt?.value ?? null)}
                    onChange={(opt) => {
                        const id = opt?.value ?? null;
                        setData('personnel_id', id);
                        setData('turnover_disposal_assets', []); // reset selected assets
                        setShowAssetDropdown([true]); // reset asset dropdown
                    }}
                />
                {errors.personnel_id && <p className="mt-1 text-xs text-red-500">{errors.personnel_id}</p>}
            </div>

            {/* Document Date */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Document Date</label>
                <input
                    type="date"
                    className="w-full rounded-lg border p-2 uppercase"
                    value={data.document_date}
                    onChange={(e) => setData('document_date', e.target.value)}
                />
                {errors.document_date && <p className="mt-1 text-xs text-red-500">{errors.document_date}</p>}
            </div>

            {/* Assets (cards) */}
            <div className="col-span-2 flex flex-col gap-4">
                <label className="block font-medium">Assets Covered</label>

                {/* ✅ WARNING BANNER (this is the fix for "not showing warning text")
                {(errors.turnover_disposal_assets || errors.external_recipient || errors.receiving_office_id) && (
                    <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                        <p className="font-semibold">Please fix the following:</p>

                        {errors.turnover_disposal_assets && <p className="mt-1">• {String(errors.turnover_disposal_assets)}</p>}

                        {errors.external_recipient && <p className="mt-1">• {errors.external_recipient}</p>}

                        {errors.receiving_office_id && <p className="mt-1">• {errors.receiving_office_id}</p>}
                    </div>
                )} */}

                {data.turnover_disposal_assets.map((line, idx) => {
                    const asset = assets.find((a) => a.id === line.asset_id);
                    if (!asset) {
                        return (
                            <div key={`${line.asset_id}-${idx}`} className="rounded-lg border p-2 text-sm text-red-600">
                                Asset not found
                            </div>
                        );
                    }

                    return (
                        <AssetTdaItem
                            key={`${line.asset_id}-${idx}`}
                            line={line}
                            asset={asset}
                            parentStatus={data.status}
                            onRemove={() => {
                                const next = [...data.turnover_disposal_assets];
                                next.splice(idx, 1);
                                setData('turnover_disposal_assets', next);
                            }}
                            onChange={(next) => {
                                const copy = [...data.turnover_disposal_assets];
                                copy[idx] = next;
                                setData('turnover_disposal_assets', copy);
                            }}
                        />
                    );
                })}

                {/* Add asset dropdown(s) */}
                {showAssetDropdown.map(
                    (visible, index) =>
                        visible && (
                            <div key={`dropdown-${index}`} className="flex items-center gap-2">
                                <Select<Option, false>
                                    key={`asset-${data.issuing_office_id}-${index}-${data.turnover_disposal_assets.length}`}
                                    className="w-full"
                                    // isDisabled={!data.issuing_office_id}
                                    isDisabled={!data.issuing_office_id || !data.personnel_id}
                                    options={filteredAssets.map((a) => ({ value: a.id, label: `${a.serial_no} – ${a.asset_name ?? ''}` }))}
                                    // placeholder={data.issuing_office_id ? 'Select Asset...' : 'Select an Issuing Office first'}

                                    placeholder={
                                        !data.issuing_office_id
                                            ? 'Select an Issuing Office first'
                                            : !data.personnel_id
                                              ? 'Select a Personnel in Charge first'
                                              : 'Select Asset...'
                                    }
                                    // noOptionsMessage={() => (data.issuing_office_id ? 'No Assets Available' : 'Select an Issuing Office first')}

                                    noOptionsMessage={() =>
                                        !data.issuing_office_id
                                            ? 'Select an Issuing Office first'
                                            : !data.personnel_id
                                              ? 'Select Personnel in Charge first'
                                              : 'No Assets Available'
                                    }
                                    onChange={(opt: SingleValue<Option>) => {
                                        if (opt && !selectedIds.has(opt.value)) {
                                            addLine(opt.value);
                                            setShowAssetDropdown((prev) => {
                                                const updated = [...prev];
                                                updated[index] = false;
                                                return [...updated, true];
                                            });
                                        }
                                    }}
                                />
                            </div>
                        ),
                )}

                {errors.turnover_disposal_assets && <p className="text-xs text-red-500">{String(errors.turnover_disposal_assets)}</p>}
            </div>

            {/* Remarks */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Remarks</label>
                <textarea
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
