import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';
import Select from "react-select";

import type { Personnel, PersonnelFormData, UserLite, UnitLite } from '@/types/personnel';
import WarningModal from '../inventory-scheduling/WarningModal';

interface EditProps {
    show: boolean;
    onClose: () => void;
    record: Personnel | null;
    users: UserLite[];
    units: UnitLite[];
}

export default function EditPersonnelModal({ 
    show, 
    onClose, 
    record, 
    users,
    units,
}: EditProps) {
    const { data, setData, put, processing, errors, clearErrors } = useForm<PersonnelFormData>({
        first_name: '',
        middle_name: '',
        last_name: '',
        position: '',
        unit_or_department_id: '',
        user_id: '',
        status: 'active',
    });

    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        if (!show || !record) return;

        setData({
            first_name: record.first_name ?? '',
            middle_name: record.middle_name ?? '',
            last_name: record.last_name ?? '',
            position: record.position ?? '',
            unit_or_department_id: record.unit_or_department_id ?? '',
            user_id: record.user_id ?? '',
            status: record.status ?? 'active',
        });
        clearErrors();
    }, [show, record, setData, clearErrors]);

    const handleClose = () => {
        onClose();
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!record?.id) return;

        //  Prevent reassign if unit changed while personnel still has assets
        if (
            record.unit_or_department_id !== data.unit_or_department_id &&
            (record.assignments_count ?? 0) > 0
        ) {
            setShowWarning(true);
            return;
        }

        const payload: PersonnelFormData = {
            first_name: (data.first_name ?? '').trim(),
            middle_name: (data.middle_name ?? '').trim() || null,
            last_name: (data.last_name ?? '').trim(),
            position: (data.position ?? '').trim(),
            unit_or_department_id: data.unit_or_department_id || null, // kept for future (hidden in UI for now)
            user_id: data.user_id ? Number(data.user_id) : null,
            status: data.status,
        };

        setData(payload);

        put(`/personnels/${record.id}`, {
            preserveScroll: true,
            onSuccess: handleClose,
        });
    };

    return (
        <EditModal
            show={show}
            onClose={handleClose}
            title={`Edit Personnel #${record?.id ?? ''}`}
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* First Name */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">First Name</label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2"
                    placeholder="Enter first name"
                    value={data.first_name}
                    onChange={(e) => setData('first_name', e.target.value)}
                    required
                />
                {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
            </div>

            {/* Middle Name */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Middle Name</label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2"
                    placeholder="Enter middle name"
                    value={data.middle_name ?? ''}
                    onChange={(e) => setData('middle_name', e.target.value)}
                />
                {errors.middle_name && <p className="mt-1 text-xs text-red-500">{errors.middle_name}</p>}
            </div>

            {/* Last Name */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Last Name</label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2"
                    placeholder="Enter last name"
                    value={data.last_name}
                    onChange={(e) => setData('last_name', e.target.value)}
                    required
                />
                {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
            </div>

            <div className="col-span-2 border-t"></div>

            {/* Unit/Department */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Unit / Department</label>
                <Select
                    className="w-full"
                    value={
                        data.unit_or_department_id
                            ? units
                                .map((u) => ({ value: u.id, label: u.name }))
                                .find((opt) => opt.value === data.unit_or_department_id) ?? null
                            : null
                    }
                    options={units.map((u) => ({
                        value: u.id,
                        label: u.name,
                    }))}
                    onChange={(opt) => setData("unit_or_department_id", opt ? opt.value : null)}
                    isClearable
                    placeholder="Select unit/dept/lab"
                />
                {errors.unit_or_department_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.unit_or_department_id}</p>
                )}
            </div>

            {/* Position */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Position</label>
                <input
                    type="text"
                    className="w-full rounded-lg border p-2"
                    placeholder="e.g., Dean, Program Chair"
                    value={data.position ?? ''}
                    onChange={(e) => setData('position', e.target.value)}
                />
                {errors.position && <p className="mt-1 text-xs text-red-500">{errors.position}</p>}
            </div>

            <div className="col-span-2 border-t"></div>

            {/* Link to User */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Link to User</label>
                <Select
                    className="w-full"
                    value={
                        data.user_id
                        ? users
                            .map((u) => ({
                                value: u.id,
                                label: `${u.name} (${u.email})`,
                            }))
                            .find((opt) => opt.value === data.user_id) ?? null
                        : null
                    }
                    options={users.map((u) => ({
                        value: u.id,
                        label: `${u.name} (${u.email})`,
                    }))}
                    onChange={(opt) => setData("user_id", opt ? opt.value : null)}
                    isClearable
                    placeholder="Link user account"
                /> 
                {errors.user_id && <p className="mt-1 text-xs text-red-500">{errors.user_id}</p>}
            </div>

            {/* Status */}
            <div className="col-span-1">
                <label className="mb-1 block font-medium">Status</label>
                <select
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value as PersonnelFormData['status'])}
                    className="w-full rounded-lg border p-2 cursor-pointer"
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="left_university">Left The University</option>
                </select>
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
            </div>

            <WarningModal
                show={showWarning}
                onClose={() => setShowWarning(false)}
                title="Cannot Change Unit/Department"
                message="This personnel has assigned assets. Please reassign or unassign them first before moving them to another unit/department."
                details={record?.assigned_assets?.map((a: { id: number | null; name: string }) => a.name) ?? []}
            />
        </EditModal>
    );
}
