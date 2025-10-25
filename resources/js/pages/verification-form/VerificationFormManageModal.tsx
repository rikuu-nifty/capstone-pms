import { useEffect, useMemo } from 'react';
import Select from 'react-select';
import { useForm, usePage } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';
import type { UnitOrDepartment, Personnel } from '@/types/custom-index';

type Option = { value: number; label: string };

interface Props {
    show: boolean;
    onClose: () => void;
    verificationId: number | null;
}

const statusOptions = ['pending', 'verified', 'rejected'] as const;

export default function VerificationFormManageModal({
    show,
    onClose,
    verificationId,
}: Props) {
    const { unitOrDepartments, personnels } = usePage().props as unknown as {
        unitOrDepartments: UnitOrDepartment[];
        personnels: Personnel[];
    };

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        unit_or_department_id: 0,
        requested_by_personnel_id: null as number | null,
        requested_by_name: '',
        requested_by_title: '',
        requested_by_contact: '',
        notes: '',
        status: 'pending' as (typeof statusOptions)[number],
        remarks: '',
    });

    const personOptions = useMemo<Option[]>(
        () =>
        personnels
            .filter((p) => p.unit_or_department_id === data.unit_or_department_id)
            .map((p) => ({ value: p.id, label: p.full_name })),
        [personnels, data.unit_or_department_id],
    );

    // Prefill from list in page props
    useEffect(() => {
        if (!show || !verificationId) return;
        clearErrors();

        const list = (usePage().props as any).verifications?.data ?? [];
        const found = list.find((v: any) => v.id === verificationId);

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
        });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, verificationId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationId) return;

        put(`/verification-form/${verificationId}`, {
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
        <div className="col-span-2">
            <label className="mb-1 block font-medium">Unit / Department</label>
            <Select<Option, false>
            className="w-full text-sm"
            placeholder="Select Unit/Dept"
            options={unitOrDepartments.map((u) => ({ value: u.id, label: u.name }))}
            value={
                data.unit_or_department_id
                ? {
                    value: data.unit_or_department_id,
                    label: unitOrDepartments.find((u) => u.id === data.unit_or_department_id)?.name ?? '',
                    }
                : null
            }
            onChange={(opt) => {
                setData('unit_or_department_id', opt?.value ?? 0);
                setData('requested_by_personnel_id', null);
            }}
            />
            {errors.unit_or_department_id && (
            <p className="mt-1 text-xs text-red-500">{String(errors.unit_or_department_id)}</p>
            )}
        </div>

        {/* Requester (Personnel) */}
        <div className="col-span-2">
            <label className="mb-1 block font-medium">Requester (Personnel)</label>
            <Select<Option, false>
            className="w-full text-sm"
            placeholder={data.unit_or_department_id ? 'Select Personnel (optional)' : 'Select Unit first'}
            isDisabled={!data.unit_or_department_id}
            options={personOptions}
            value={
                data.requested_by_personnel_id
                ? {
                    value: data.requested_by_personnel_id,
                    label: personnels.find((p) => p.id === data.requested_by_personnel_id)?.full_name ?? '',
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

        {/* Snapshot fields */}
        <div className="col-span-2">
            <label className="mb-1 block font-medium">Requester Name (Snapshot)</label>
            <input
            className="w-full rounded-lg border p-2"
            value={data.requested_by_name}
            onChange={(e) => setData('requested_by_name', e.target.value)}
            />
        </div>
        <div className="col-span-1">
            <label className="mb-1 block font-medium">Requester Title (Snapshot)</label>
            <input
            className="w-full rounded-lg border p-2"
            value={data.requested_by_title}
            onChange={(e) => setData('requested_by_title', e.target.value)}
            />
        </div>
        <div className="col-span-1">
            <label className="mb-1 block font-medium">Requester Contact (Snapshot)</label>
            <input
            className="w-full rounded-lg border p-2"
            value={data.requested_by_contact}
            onChange={(e) => setData('requested_by_contact', e.target.value)}
            />
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
