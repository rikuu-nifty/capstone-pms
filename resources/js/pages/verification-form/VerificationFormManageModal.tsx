import { useEffect, useMemo, useState } from 'react';
import Select, { SingleValue } from 'react-select';
import { useForm } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';
import AssetVfItem from './AssetVfItem';
import { VerificationFormRecord } from './index';

type Option = { value: number; label: string };

type UnitLite = { id: number; name: string };
type PersonnelLite = { id: number; unit_or_department_id: number; full_name: string };

export type InventoryLite = {
    id: number;
    unit_or_department_id: number;
    asset_name: string;
    serial_no?: string | null;
    building?: { id: number; name: string } | null;
    buildingRoom?: { id: number; room: string } | null;
    subArea?: { id: number; name: string } | null;
};

interface Props {
    show: boolean;
    onClose: () => void;
    verificationId: number | null;
    unitOrDepartments: UnitLite[];
    personnels: PersonnelLite[];
    assets: InventoryLite[];
    verifications: { data: VerificationFormRecord[] };
}

const statusOptions = ['pending', 'verified', 'rejected'] as const;

export default function VerificationFormManageModal({
    show,
    onClose,
    verificationId,
    unitOrDepartments,
    personnels,
    assets,
    verifications,
}: Props) {
    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({
        unit_or_department_id: 0,
        requested_by_personnel_id: null as number | null,
        requested_by_name: '',
        requested_by_title: '',
        requested_by_contact: '',
        notes: '',
        status: 'pending' as (typeof statusOptions)[number],
        remarks: '',
        verification_assets: [] as Array<{ inventory_list_id: number; remarks?: string }>,
    });

    const [personOptions, setPersonOptions] = useState<Option[]>([]);
    const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);

    // Load data for edit
    useEffect(() => {
        if (!show || !verificationId) return;
        clearErrors();

        const list = verifications?.data ?? [];
        const found = list.find((v) => v.id === verificationId);
        if (found) {
            setData({
            unit_or_department_id: found.unit_or_department?.id ?? 0,
            requested_by_personnel_id: found.requested_by_personnel?.id ?? null,
            requested_by_name: found.requested_by_snapshot?.name ?? '',
            requested_by_title: found.requested_by_snapshot?.title ?? '',
            requested_by_contact: found.requested_by_snapshot?.contact ?? '',
            notes: found.notes ?? '',
            status: (found.status ?? 'pending') as (typeof statusOptions)[number],
            remarks: found.remarks ?? '',
            verification_assets: found.verification_assets ?? [],
            });
            setShowAssetDropdown([true]);
        }
    }, [show, verificationId, clearErrors, verifications?.data, setData]);

    // Refresh personnel options when unit changes
    useEffect(() => {
        const opts = personnels
        .filter((p) => p.unit_or_department_id === data.unit_or_department_id)
        .map((p) => ({ value: p.id, label: p.full_name }));
        setPersonOptions(opts);
    }, [data.unit_or_department_id, personnels]);

    const selectedIds = useMemo(
        () => new Set<number>(data.verification_assets.map((li) => li.inventory_list_id)),
        [data.verification_assets],
    );

    const filteredAssets = useMemo(() => {
        if (!data.unit_or_department_id) return [] as InventoryLite[];
        return assets.filter(
        (a) => a.unit_or_department_id === data.unit_or_department_id && !selectedIds.has(a.id),
        );
    }, [assets, data.unit_or_department_id, selectedIds]);

    const addLine = (inventory_list_id: number) => {
        const next = { inventory_list_id, remarks: '' };
        setData('verification_assets', [...data.verification_assets, next]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationId) return;

        patch(`/verification-form/${verificationId}`, {
        preserveScroll: true,
        onSuccess: () => {
            reset();
            onClose();
        },
        });
    };

    return (
        <EditModal
        show={show}
        onClose={() => {
            reset();
            clearErrors();
            onClose();
        }}
        title={`Edit Verification Form #${verificationId ?? '—'}`}
        onSubmit={handleSubmit}
        processing={processing}
        >
        {/* Unit / Department */}
        <div className="col-span-1">
            <label className="mb-1 block font-medium">Unit / Department</label>
            <Select<Option, false>
            className="w-full text-sm"
            placeholder="Select Unit/Dept"
            options={unitOrDepartments.map((u) => ({ value: u.id, label: u.name }))}
            value={
                data.unit_or_department_id
                ? {
                    value: data.unit_or_department_id,
                    label:
                        unitOrDepartments.find((u) => u.id === data.unit_or_department_id)?.name ?? '',
                    }
                : null
            }
            onChange={(opt) => {
                setData('unit_or_department_id', opt?.value ?? 0);
                setData('requested_by_personnel_id', null);
                setData('verification_assets', []);
                setShowAssetDropdown([true]);
            }}
            />
            {errors.unit_or_department_id && (
            <p className="mt-1 text-xs text-red-500">{String(errors.unit_or_department_id)}</p>
            )}
        </div>

        {/* Requester (Personnel) */}
        <div className="col-span-1">
            <label className="mb-1 block font-medium">Requester (Personnel)</label>
            <Select<Option, false>
            className="w-full text-sm"
            placeholder={data.unit_or_department_id ? 'Select Personnel (Optional)' : 'Select Unit first'}
            isDisabled={!data.unit_or_department_id}
            options={personOptions}
            value={
                data.requested_by_personnel_id
                ? {
                    value: data.requested_by_personnel_id,
                    label:
                        personnels.find((p) => p.id === data.requested_by_personnel_id)?.full_name ?? '',
                    }
                : null
            }
            onChange={(opt) => setData('requested_by_personnel_id', opt?.value ?? null)}
            isClearable
            />
            {errors.requested_by_personnel_id && (
            <p className="mt-1 text-xs text-red-500">{String(errors.requested_by_personnel_id)}</p>
            )}
        </div>

        {/* Snapshot Fields */}
        <div className="col-span-1">
            <label className="mb-1 block font-medium">Requester Name</label>
            <input
            className="w-full rounded-lg border p-2"
            value={data.requested_by_name}
            onChange={(e) => setData('requested_by_name', e.target.value)}
            placeholder="Optional"
            />
        </div>
        <div className="col-span-1">
            <label className="mb-1 block font-medium">Requester Title</label>
            <input
            className="w-full rounded-lg border p-2"
            value={data.requested_by_title}
            onChange={(e) => setData('requested_by_title', e.target.value)}
            placeholder="e.g., Staff"
            />
        </div>

        {/* Assets Covered */}
        <div className="col-span-2 flex flex-col gap-4">
            <label className="block font-medium">Assets Covered</label>

            {data.verification_assets.map((line, idx) => {
            const asset = assets.find((a) => a.id === line.inventory_list_id);
            if (!asset) return null;

            return (
                <AssetVfItem
                key={`${line.inventory_list_id}-${idx}`}
                line={line}
                asset={asset}
                onRemove={() => {
                    const next = [...data.verification_assets];
                    next.splice(idx, 1);
                    setData('verification_assets', next);
                }}
                onChange={(next) => {
                    const copy = [...data.verification_assets];
                    copy[idx] = next;
                    setData('verification_assets', copy);
                }}
                />
            );
            })}

            {/* Add-asset dropdowns */}
            {showAssetDropdown.map(
            (visible, index) =>
                visible && (
                <div key={`dropdown-${index}`} className="flex items-center gap-2">
                    <Select<Option, false>
                    key={`asset-${data.unit_or_department_id}-${index}-${data.verification_assets.length}`}
                    className="w-full"
                    isDisabled={!data.unit_or_department_id}
                    options={filteredAssets.map((a) => ({
                        value: a.id,
                        label: `${a.serial_no ? a.serial_no + ' – ' : ''}${a.asset_name ?? ''}`,
                    }))}
                    placeholder={
                        data.unit_or_department_id ? 'Select Asset...' : 'Select a Unit/Department first'
                    }
                    noOptionsMessage={() =>
                        data.unit_or_department_id
                        ? 'No Assets Available'
                        : 'Select a Unit/Department first'
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

            {'verification_assets' in errors && (
            <p className="mt-1 text-sm text-red-500">{String(errors.verification_assets)}</p>
            )}
        </div>

        {/* Status */}
        <div className="col-span-1">
            <label className="mb-1 block font-medium">Status</label>
            <select
            className="w-full rounded-lg border p-2"
            value={data.status}
            onChange={(e) => setData('status', e.target.value as (typeof statusOptions)[number])}
            >
            {statusOptions.map((s) => (
                <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
            ))}
            </select>
            {errors.status && <p className="mt-1 text-xs text-red-500">{String(errors.status)}</p>}
        </div>

        {/* Notes */}
        <div className="col-span-2">
            <label className="mb-1 block font-medium">Notes</label>
            <textarea
            className="w-full rounded-lg border p-2 resize-none"
            rows={3}
            value={data.notes}
            onChange={(e) => setData('notes', e.target.value)}
            />
            {errors.notes && <p className="mt-1 text-xs text-red-500">{String(errors.notes)}</p>}
        </div>

        {/* Remarks */}
        <div className="col-span-2">
            <label className="mb-1 block font-medium">Remarks</label>
            <textarea
            className="w-full rounded-lg border p-2 resize-none"
            rows={3}
            value={data.remarks}
            onChange={(e) => setData('remarks', e.target.value)}
            />
            {errors.remarks && <p className="mt-1 text-xs text-red-500">{String(errors.remarks)}</p>}
        </div>
        </EditModal>
    );
}
