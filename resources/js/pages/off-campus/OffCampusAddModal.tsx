import { PickerInput } from '@/components/picker-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';

type UnitOrDepartment = {
    id: number;
    name: string;
    code: string;
};

type AssetModel = {
    id: number;
    brand: string;
    model: string;
};

type Asset = {
    id: number;
    asset_model_id: number | null;
    asset_name: string;
    description?: string | null;
    serial_no?: string | null;

    unit_or_department_id: number;
};

type User = {
    id: number;
    name: string;
};

type AssetOption = {
    value: number;
    label: string;
    model_id?: number | null;
};

type Props = {
    show: boolean;
    onClose: () => void;
    unitOrDepartments: UnitOrDepartment[];
    assets: Asset[];
    assetModels: AssetModel[]; // in case asset_id is not provided and you need manual model pick
    users: User[]; // for issued_by_id (PMO staff)
    units?: string[]; // optional override for units list
};

const UNITS = ['pcs', 'set', 'unit', 'pair', 'dozen', 'box', 'pack', 'roll', 'bundle', 'ream', 'kg', 'g', 'lb', 'ton', 'L', 'ml', 'gal'];

export default function OffCampusAddModal({ show, onClose, unitOrDepartments = [], assets = [], assetModels = [], users = [], units }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        requester_name: '',
        college_or_unit_id: '' as number | '',
        purpose: '',
        date_issued: '',
        status: 'pending_review',
        return_date: '',
        quantity: '' as number | '',
        units: 'pcs',
        asset_id: '' as number | '',
        asset_model_id: '' as number | '',
        comments: '',
        remarks: 'official_use' as 'official_use' | 'repair',
        approved_by: '',
        issued_by_id: '' as number | '',
        checked_by: '',
        selected_assets: [] as { asset_id: number; asset_model_id?: number | null }[],
    });

    // 1) Shared close handler (memoized so we can safely use in effects)
    const handleClose = useCallback(() => {
        reset(); // clears all form fields back to initial state
        onClose(); // closes the modal
    }, [reset, onClose]);

    // 2) Close on ESC key just like Cancel/outside
    useEffect(() => {
        if (!show) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [show, handleClose]);

    // Autofill asset_model_id when asset_id changes
    useEffect(() => {
        if (data.asset_id) {
            const a = assets.find((x) => x.id === Number(data.asset_id));
            if (a?.asset_model_id) {
                setData('asset_model_id', a.asset_model_id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.asset_id, assets]);

    const handleAssetsChange = (assetsSelected: AssetOption[]) => {
        const maxSelectable = Number(data.quantity) || 0;

        // Enforce trimming if user tries to exceed quantity
        let limited = assetsSelected;
        if (maxSelectable > 0 && assetsSelected.length > maxSelectable) {
            limited = assetsSelected.slice(0, maxSelectable);
        }

        // Update selected_assets only
        setData(
            'selected_assets',
            limited.map((a) => ({
                asset_id: a.value,
                asset_model_id: a.model_id ?? null,
            })),
        );

        // ❌ DO NOT override quantity here!
        // Keep quantity as the user entered value
    };

    // const assetOptions: AssetOption[] = assets.map((a) => {
    //     const model = assetModels.find((m) => m.id === a.asset_model_id);
    //     return {
    //         value: a.id,
    //         label: `${a.asset_name} | ${model ? `${model.brand} ${model.model}` : ''}${
    //             a.serial_no ? ` | SN: ${a.serial_no}` : ''
    //         }${a.description ? ` | ${a.description}` : ''}`,
    //         model_id: model ? model.id : null,
    //     };
    // });

    // Only keep assets that belong to the chosen unit/department
    const filteredAssets = data.college_or_unit_id
    ? assets.filter((a) => a.unit_or_department_id === Number(data.college_or_unit_id))
    : assets;

    const assetOptions: AssetOption[] = filteredAssets.map((a) => {
        const model = assetModels.find((m) => m.id === a.asset_model_id);
        return {
            value: a.id,
            label: `${a.asset_name} | ${model ? `${model.brand} ${model.model}` : ''}${
            a.serial_no ? ` | SN: ${a.serial_no}` : ''
            }${a.description ? ` | ${a.description}` : ''}`,
            model_id: model ? model.id : null,
        };
    });


    // How many assets can be selected based on Quantity
    const maxSelectable = Number(data.quantity) || 0;

    // Disable new options when at limit (but keep already-selected options enabled so user can deselect)
    const isOptionDisabled = (opt: AssetOption) =>
        data.selected_assets.length >= maxSelectable && !data.selected_assets.some((sa) => sa.asset_id === opt.value);

    // const [submitAttempted, setSubmitAttempted] = useState(false);
    const [quantityError, setQuantityError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // setSubmitAttempted(true); // mark that user tried to save

        if (Number(data.quantity) > 0 && data.selected_assets.length !== Number(data.quantity)) {
            setQuantityError(`You set the quantity to ${data.quantity}, but selected ${data.selected_assets.length}. They must match before saving.`);
            return; // stop submit
        }
        setQuantityError(null); // clear any previous errors
        post('/off-campus', {
            preserveScroll: true,
            onSuccess: () => {
                // on success we also reset + close (same behavior)
                handleClose();
            },
        });
    };

    const UNITS_TO_USE = units && units.length ? units : UNITS;

    return (
        <div className={`fixed inset-0 z-50 flex transition-all duration-300 ease-in-out ${show ? 'visible' : 'invisible'}`}>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose} // unified close behavior
            />

            {/* Slide-In Panel */}
            <div
                className={`relative ml-auto w-full max-w-3xl transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900 ${
                    show ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{ display: 'flex', flexDirection: 'column' }}
            >
                {/* Header */}
                <div className="mb-4 flex items-center justify-between p-6">
                    <h2 className="text-xl font-semibold">Add Off Campus</h2>
                    <button onClick={handleClose} className="cursor-pointer text-2xl font-medium">
                        &times;
                    </button>
                </div>

                {/* Body / Form */}
                <div className="auto overflow-y-auto px-6" style={{ flex: 1 }}>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4 pb-6 text-sm">
                        {/* Requester & Unit */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Authorized / Requester Name</label>
                            <Input
                                placeholder="e.g., Juan Dela Cruz"
                                value={data.requester_name}
                                onChange={(e) => setData('requester_name', e.target.value)}
                            />
                            {errors.requester_name && <p className="mt-1 text-xs text-red-500">{errors.requester_name}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Unit/Dept/Lab</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.college_or_unit_id}
                                onChange={(e) => {
                                    const val = e.target.value === '' ? '' : Number(e.target.value);
                                    setData('college_or_unit_id', val);
                                    setData('selected_assets', []);
                                }}
                            >
                                <option value="">Select Unit/Department</option>
                                {unitOrDepartments.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.code})
                                    </option>
                                ))}
                            </select>
                            {errors.college_or_unit_id && <p className="mt-1 text-xs text-red-500">{errors.college_or_unit_id}</p>}
                        </div>

                        {/* Dates */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Date Issued</label>
                            <PickerInput type="date" value={data.date_issued} onChange={(e) => setData('date_issued', e)} />
                            {errors.date_issued && <p className="mt-1 text-xs text-red-500">{errors.date_issued}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Return Date</label>
                            <PickerInput type="date" value={data.return_date ?? ''} onChange={(e) => setData('return_date', e)} />
                            {errors.return_date && <p className="mt-1 text-xs text-red-500">{errors.return_date}</p>}
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Status</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as typeof data.status)}
                            >
                                <option value="pending_review">Pending Review</option>
                                <option value="pending_return">Pending Return</option>
                                <option value="returned">Returned</option>
                                <option value="overdue">Overdue</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                        </div>



                        {/* Purpose */}
                        <div className="col-span-2">
                            <label className="mb-1 block font-medium">Purpose</label>
                            <textarea
                                rows={3}
                                className="w-full resize-none rounded-lg border p-2"
                                placeholder="State the purpose of bringing out the item(s)"
                                value={data.purpose}
                                onChange={(e) => setData('purpose', e.target.value)}
                            />
                            {errors.purpose && <p className="mt-1 text-xs text-red-500">{errors.purpose}</p>}
                        </div>

                        {/* Quantity / Units */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Quantity</label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                placeholder="Enter Quantity"
                                min={1}
                                value={data.quantity}
                                onChange={(e) => {
                                    // sanitize to integers only
                                    const raw = e.target.value;
                                    const num = parseInt(String(raw).replace(/[^\d]/g, ''), 10);

                                    if (Number.isNaN(num) || num < 1) {
                                        setData('quantity', '');
                                        return;
                                    }

                                    // enforce upper bound: trim selected assets if they exceed the new quantity
                                    if (data.selected_assets.length > num) {
                                        setData('selected_assets', data.selected_assets.slice(0, num));
                                    }

                                    setData('quantity', num);
                                }}
                            />
                            {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Units</label>
                            <select className="w-full rounded-lg border p-2" value={data.units} onChange={(e) => setData('units', e.target.value)}>
                                <option value="">Select Units</option>
                                {UNITS_TO_USE.map((u) => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </select>
                            {errors.units && <p className="mt-1 text-xs text-red-500">{errors.units}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1 block font-medium">Assets Covered</label>
                            <Select<AssetOption, true>
                                isMulti
                                options={assetOptions}
                                placeholder="Select one or more assets..."
                                className="text-sm"
                                isClearable
                                isOptionDisabled={isOptionDisabled}
                                closeMenuOnSelect={data.selected_assets.length + 1 >= maxSelectable}
                                value={assetOptions.filter((opt) => data.selected_assets.some((sa) => sa.asset_id === opt.value))}
                                onChange={(selected) => {
                                    const picked = (selected ?? []) as AssetOption[];
                                    const limited = maxSelectable ? picked.slice(0, maxSelectable) : picked;
                                    handleAssetsChange(limited);
                                }}
                                isDisabled={!data.quantity || Number(data.quantity) <= 0}
                            />

                            {/* 🔴 Inline error (only after save attempt) */}
                            {quantityError && <p className="mt-1 text-xs text-red-500">{quantityError}</p>}

                            {/* Helper / limit message */}
                            {maxSelectable > 0 && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {data.selected_assets.length >= maxSelectable
                                        ? 'You have reached your limit based on your chosen quantity.'
                                        : `You can select up to ${maxSelectable} asset${maxSelectable > 1 ? 's' : ''}.`}
                                </p>
                            )}
                        </div>

                        {/* Remarks */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Remarks</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value as 'official_use' | 'repair')}
                            >
                                <option value="official_use">Official Use</option>
                                <option value="repair">Repair</option>
                            </select>
                            {errors.remarks && <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>}
                        </div>

                        {/* Approved / Issued / Checked */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Approved By (Dean/Head)</label>
                            <Input
                                placeholder="e.g., Dr. Maria Santos"
                                value={data.approved_by ?? ''}
                                onChange={(e) => setData('approved_by', e.target.value)}
                            />
                            {errors.approved_by && <p className="mt-1 text-xs text-red-500">{errors.approved_by}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Issued By (PMO Staff)</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.issued_by_id}
                                onChange={(e) => setData('issued_by_id', e.target.value === '' ? '' : Number(e.target.value))}
                            >
                                <option value="">Select User</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                            {errors.issued_by_id && <p className="mt-1 text-xs text-red-500">{errors.issued_by_id}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Checked By (Chief, Security)</label>
                            <Input
                                placeholder="e.g., Chief D. Cruz"
                                value={data.checked_by ?? ''}
                                onChange={(e) => setData('checked_by', e.target.value)}
                            />
                            {errors.checked_by && <p className="mt-1 text-xs text-red-500">{errors.checked_by}</p>}
                        </div>

                        {/* Comments */}
                        <div className="col-span-2">
                            <label className="mb-1 block font-medium">Comments</label>
                            <textarea
                                rows={3}
                                className="w-full resize-none rounded-lg border p-2"
                                placeholder="Additional notes (optional)"
                                value={data.comments ?? ''}
                                onChange={(e) => setData('comments', e.target.value)}
                            />
                            {errors.comments && <p className="mt-1 text-xs text-red-500">{errors.comments}</p>}
                        </div>

                        {/* Footer Buttons */}
                        <div className="col-span-2 flex justify-end gap-2 border-t border-muted pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose} // unified behavior
                                className="cursor-pointer"
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="cursor-pointer" disabled={processing}>
                                Create Off Campus
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
