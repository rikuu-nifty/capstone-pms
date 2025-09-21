import AddModal from '@/components/modals/AddModal';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';
import Select from "react-select";

import type { PersonnelFormData, UserLite, UnitLite } from '@/types/personnel';

interface Props {
    show: boolean;
    onClose: () => void;
    users: UserLite[];
    units: UnitLite[];
}

export default function AddPersonnelModal({ 
    show, 
    onClose, 
    users, 
    units
}: Props) {
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<PersonnelFormData>({
        first_name: '',
        middle_name: '',
        last_name: '',
        position: '',
        unit_or_department_id: '',
        user_id: null,
        status: 'active',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload: PersonnelFormData = {
            first_name: (data.first_name ?? '').trim(),
            middle_name: (data.middle_name ?? '').trim() || null,
            last_name: (data.last_name ?? '').trim(),
            position: (data.position ?? '').trim(),
            unit_or_department_id: data.unit_or_department_id || null,
            user_id: data.user_id || null,
            status: data.status,
        };

        setData(payload);

        post('/personnels', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                onClose();
            },
        });
    };

    useEffect(() => {
        if (show) {
            reset();
            clearErrors();
        }
    }, [show, reset, clearErrors]);

    return (
        <AddModal
            show={show}
            onClose={() => {
                onClose();
                reset();
                clearErrors();
            }}
            title="Add New Personnel"
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* First Name */}
            <div>
                <label className="mb-1 block font-medium">First Name</label>
                <Input
                    type="text"
                    placeholder="Enter first name (e.g., Juan)"
                    value={data.first_name}
                    onChange={(e) => setData('first_name', e.target.value)}
                    className="w-full cursor-text rounded-lg border p-2"
                    required
                />
                {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
            </div>

            {/* Middle Name */}
            <div>
                <label className="mb-1 block font-medium">Middle Name</label>
                <Input
                    type="text"
                    placeholder="Enter middle name (e.g., Dela)"
                    value={data.middle_name ?? ''}
                    onChange={(e) => setData('middle_name', e.target.value)}
                    className="w-full cursor-text rounded-lg border p-2"
                />
            </div>

            {/* Last Name */}
            <div>
                <label className="mb-1 block font-medium">Last Name</label>
                <Input
                    type="text"
                    placeholder="Enter last name (e.g., Cruz)"
                    value={data.last_name}
                    onChange={(e) => setData('last_name', e.target.value)}
                    className="w-full cursor-text rounded-lg border p-2"
                    required
                />
                {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
            </div>

            <div className="col-span-2 border-t"></div>

            {/* Unit/Department */}
            <div>
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
            <div>
                <label className="mb-1 block font-medium">Position</label>
                <Input
                    type="text"
                    placeholder="Enter position (e.g., Dean, Program Chair)"
                    value={data.position ?? ''}
                    onChange={(e) => setData('position', e.target.value)}
                    className="w-full cursor-text rounded-lg border p-2"
                />
            </div>

            <div className="col-span-2 border-t"></div>

            {/* User Dropdown */}
            <div>
                <label className="mb-1 block font-medium">Link to User (optional)</label>
                <Select
                    className="w-full"
                    value={ data.user_id
                            ? {
                                value: data.user_id,
                                label:
                                users.find((u) => u.id === data.user_id)?.name +
                                " (" +
                                users.find((u) => u.id === data.user_id)?.email +
                                ")",
                            }
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
            <div>
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
            </div>
        </AddModal>
    );
}
