import { PickerInput } from '@/components/picker-input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
// import Select, { type MultiValue } from 'react-select';
import Select from 'react-select';

type UnitOrDepartment = { id: number; name: string; code: string };
type AssetModel = { id: number; brand: string; model: string };
type User = { id: number; name: string };
type Asset = {
    id: number;
    asset_model_id: number | null;
    asset_name: string;
    description?: string | null;
    serial_no?: string | null;
};

type OffCampusAssetRow = {
    id?: number;
    asset_id: number;
    asset_model_id?: number | null;
    quantity?: number;
    units?: string;
    comments?: string | null;
};

type OffCampusRow = {
    id: number;
    requester_name: string;
    college_or_unit_id: number | null;
    purpose: string;
    date_issued: string; // YYYY-MM-DD
    return_date: string | null;
    quantity: number | ''; // header quantity (cap for selections)
    units: string;
    remarks: 'official_use' | 'repair';
    comments?: string | null;
    approved_by?: string | null;
    issued_by_id?: number | null;
    checked_by?: string | null;

    // legacy single-asset columns (may be null if moving to multi)
    asset_id?: number | null;
    asset_model_id?: number | null;

    // when eager loaded as child lines (recommended long-term)
    assets?: OffCampusAssetRow[];
    college_or_unit?: { id: number; name: string; code: string } | null;
};

type AssetOption = {
    value: number;
    label: string;
    model_id?: number | null;
};

type Props = {
    offCampus: OffCampusRow;
    onClose: () => void;

    unitOrDepartments: UnitOrDepartment[];
    assets: Asset[];
    assetModels: AssetModel[];
    users: User[];
    unitsList?: string[]; // optional override
};

const DEFAULT_UNITS = ['pcs', 'set', 'unit', 'pair', 'dozen', 'box', 'pack', 'roll', 'bundle', 'ream', 'kg', 'g', 'lb', 'ton', 'L', 'ml', 'gal'];

export default function OffCampusEditModal({ offCampus, onClose, unitOrDepartments, assets, assetModels, users, unitsList = DEFAULT_UNITS }: Props) {
    // Build react-select options once
    const assetOptions: AssetOption[] = useMemo(() => {
        return assets.map((a) => {
            const m = assetModels.find((x) => x.id === a.asset_model_id);
            return {
                value: a.id,
                label: [a.asset_name, m ? `${m.brand} ${m.model}` : null, a.serial_no ? `SN: ${a.serial_no}` : null, a.description || null]
                    .filter(Boolean)
                    .join(' • '),
                model_id: m ? m.id : null,
            };
        });
    }, [assets, assetModels]);

    // Initialize selected_assets:
    // - Prefer offCampus.assets[] (child rows) if present
    // - Else fall back to legacy header asset_id/asset_model_id
    const initialSelected = ((): { asset_id: number; asset_model_id?: number | null }[] => {
        let selected: { asset_id: number; asset_model_id?: number | null }[] = [];

        if (offCampus.assets && offCampus.assets.length) {
            selected = offCampus.assets.filter((r) => r.asset_id).map((r) => ({ asset_id: r.asset_id, asset_model_id: r.asset_model_id ?? null }));
        } else if (offCampus.asset_id) {
            selected = [{ asset_id: offCampus.asset_id, asset_model_id: offCampus.asset_model_id ?? null }];
        }

        // ✅ Trim down to quantity limit
        const max = Number(offCampus.quantity) || 0;
        return max > 0 ? selected.slice(0, max) : selected;
    })();

    const { data, setData, put, processing, errors } = useForm({
        requester_name: offCampus.requester_name ?? '',
        college_or_unit_id: (offCampus.college_or_unit_id ?? '') as number | '',
        purpose: offCampus.purpose ?? '',
        date_issued: offCampus.date_issued ? offCampus.date_issued.substring(0, 10) : '',
        return_date: offCampus.return_date ? offCampus.return_date.substring(0, 10) : '',
        quantity: (offCampus.quantity ?? '') as number | '',
        units: offCampus.units ?? 'pcs',
        remarks: (offCampus.remarks ?? 'official_use') as 'official_use' | 'repair',
        approved_by: offCampus.approved_by ?? '',
        issued_by_id: (offCampus.issued_by_id ?? '') as number | '',
        checked_by: offCampus.checked_by ?? '',
        comments: offCampus.comments ?? '',

        // legacy header (kept for compatibility; we’ll mirror first selection)
        asset_id: (offCampus.asset_id ?? '') as number | '',
        asset_model_id: (offCampus.asset_model_id ?? '') as number | '',

        // multi-select selections
        selected_assets: initialSelected as { asset_id: number; asset_model_id?: number | null }[],
    });

    useEffect(() => {
        let selected = offCampus.assets
            ? offCampus.assets
                  .filter((r) => !('deleted_at' in r && r.deleted_at)) // ignore soft-deleted rows
                  .map((r) => ({
                      asset_id: r.asset_id,
                      asset_model_id: r.asset_model_id ?? null,
                  }))
            : [];

        // ✅ Trim down to match quantity
        const max = Number(offCampus.quantity) || 0;
        if (max > 0 && selected.length > max) {
            selected = selected.slice(0, max);
        }

        setData({
            requester_name: offCampus.requester_name ?? '',
            college_or_unit_id: (offCampus.college_or_unit_id ?? '') as number | '',
            purpose: offCampus.purpose ?? '',
            date_issued: offCampus.date_issued ? offCampus.date_issued.substring(0, 10) : '',
            return_date: offCampus.return_date ? offCampus.return_date.substring(0, 10) : '',
            quantity: (offCampus.quantity ?? '') as number | '',
            units: offCampus.units ?? 'pcs',
            remarks: (offCampus.remarks ?? 'official_use') as 'official_use' | 'repair',
            approved_by: offCampus.approved_by ?? '',
            issued_by_id: (offCampus.issued_by_id ?? '') as number | '',
            checked_by: offCampus.checked_by ?? '',
            comments: offCampus.comments ?? '',
            asset_id: (offCampus.asset_id ?? '') as number | '',
            asset_model_id: (offCampus.asset_model_id ?? '') as number | '',
            selected_assets: selected,
        });
    }, [setData, offCampus]);

    // limit for multi-select equals header quantity
    const maxSelectable = Number(data.quantity) || 0;

    const handleAssetsChange = (assetsSelected: AssetOption[]) => {
        const maxSelectable = Number(data.quantity) || 0;

        // ✅ Trim the selected assets if more than allowed by quantity
        let limited = assetsSelected;
        if (maxSelectable > 0 && assetsSelected.length > maxSelectable) {
            limited = assetsSelected.slice(0, maxSelectable);
        }

        // update array
        setData(
            'selected_assets',
            limited.map((a) => ({
                asset_id: a.value,
                asset_model_id: a.model_id ?? null,
            })),
        );

        // mirror first selection to legacy header cols
        if (limited.length > 0) {
            setData('asset_id', limited[0].value);
            setData('asset_model_id', limited[0].model_id ?? '');
        } else {
            setData('asset_id', '');
            setData('asset_model_id', '');
        }

        // ✅ Keep quantity in sync when assets shrink
        if (limited.length < data.selected_assets.length) {
            setData('quantity', limited.length);
        }
    };

    const isOptionDisabled = (opt: AssetOption) =>
        maxSelectable > 0 && data.selected_assets.length >= maxSelectable && !data.selected_assets.some((sa) => sa.asset_id === opt.value);

    const selectedValue: AssetOption[] = useMemo(() => {
        return assetOptions.filter((opt) => data.selected_assets.some((sa) => sa.asset_id === opt.value));
    }, [assetOptions, data.selected_assets]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/off-campus/${offCampus.id}`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <form onSubmit={handleSubmit}>
                <DialogContent className="w-full max-w-[700px] p-6 sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Update Off Campus — Record #{offCampus.id}</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        {/* Requester */}
                        <div>
                            <Label>Authorized / Requester Name</Label>
                            <Input
                                placeholder="e.g., Juan Dela Cruz"
                                value={data.requester_name}
                                onChange={(e) => setData('requester_name', e.target.value)}
                            />
                            {errors.requester_name && <p className="mt-1 text-xs text-red-500">{errors.requester_name}</p>}
                        </div>

                        {/* College / Unit */}
                        <div>
                            <Label>College / Unit</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.college_or_unit_id}
                                onChange={(e) => setData('college_or_unit_id', e.target.value === '' ? '' : Number(e.target.value))}
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
                        <div>
                            <Label>Date Issued</Label>
                            <PickerInput type="date" value={data.date_issued} onChange={(e) => setData('date_issued', e)} />
                            {errors.date_issued && <p className="mt-1 text-xs text-red-500">{errors.date_issued}</p>}
                        </div>

                        <div>
                            <Label>Return Date</Label>
                            <PickerInput type="date" value={data.return_date} onChange={(e) => setData('return_date', e)} />
                            {errors.return_date && <p className="mt-1 text-xs text-red-500">{errors.return_date}</p>}
                        </div>

                        {/* Purpose */}
                        <div className="col-span-2">
                            <Label>Purpose</Label>
                            <Textarea
                                rows={3}
                                placeholder="State the purpose of bringing in/out the item(s)"
                                value={data.purpose}
                                onChange={(e) => setData('purpose', e.target.value)}
                            />
                            {errors.purpose && <p className="mt-1 text-xs text-red-500">{errors.purpose}</p>}
                        </div>

                        {/* Quantity */}
                        <div>
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                placeholder="Enter Quantity"
                                min={1}
                                value={data.quantity}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const num = parseInt(String(raw).replace(/[^\d]/g, ''), 10);

                                    if (Number.isNaN(num) || num < 1) {
                                        setData('quantity', '');
                                        setData('selected_assets', []);
                                        setData('asset_id', '');
                                        setData('asset_model_id', '');
                                        return;
                                    }

                                    // trim selections if needed
                                    if (data.selected_assets.length > num) {
                                        const trimmed = data.selected_assets.slice(0, num);
                                        setData('selected_assets', trimmed);
                                        // re-mirror first
                                        if (trimmed.length) {
                                            setData('asset_id', trimmed[0].asset_id);
                                            setData('asset_model_id', trimmed[0].asset_model_id ?? '');
                                        } else {
                                            setData('asset_id', '');
                                            setData('asset_model_id', '');
                                        }
                                    }

                                    setData('quantity', num);
                                }}
                            />
                            {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
                            {Number(data.quantity) > 0 && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    You can select up to {data.quantity} asset{Number(data.quantity) > 1 ? 's' : ''}.
                                </p>
                            )}
                        </div>

                        {/* Units */}
                        <div>
                            <Label>Units</Label>
                            <select className="w-full rounded-lg border p-2" value={data.units} onChange={(e) => setData('units', e.target.value)}>
                                <option value="">Select Units</option>
                                {unitsList.map((u) => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </select>
                            {errors.units && <p className="mt-1 text-xs text-red-500">{errors.units}</p>}
                        </div>

                        {/* Assets Covered */}
                        <div className="col-span-2">
                            <Label>Assets Covered</Label>
                            <Select<AssetOption, true>
                                isMulti
                                options={assetOptions}
                                placeholder="Select one or more assets..."
                                className="text-sm"
                                isClearable
                                isOptionDisabled={isOptionDisabled}
                                closeMenuOnSelect={false}
                                value={selectedValue}
                                onChange={(selected) => {
                                    const arr = (selected ?? []) as AssetOption[];
                                    handleAssetsChange(arr);
                                }}
                                isDisabled={!data.quantity || Number(data.quantity) <= 0}
                            />
                            {(!data.quantity || Number(data.quantity) <= 0) && (
                                <p className="mt-1 text-xs text-muted-foreground">Please enter a quantity first to select assets.</p>
                            )}
                            {errors.selected_assets && <p className="mt-1 text-xs text-red-500">{String(errors.selected_assets)}</p>}

                            {maxSelectable > 0 && data.selected_assets.length >= maxSelectable && (
                                <p className="mt-1 text-xs text-muted-foreground">You have reached your limit based on your chosen quantity.</p>
                            )}
                        </div>

                        {/* Remarks */}
                        <div>
                            <Label>Remarks</Label>
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
                        <div>
                            <Label>Approved By (Dean/Head)</Label>
                            <Input
                                placeholder="e.g., Dr. Maria Santos"
                                value={data.approved_by ?? ''}
                                onChange={(e) => setData('approved_by', e.target.value)}
                            />
                            {errors.approved_by && <p className="mt-1 text-xs text-red-500">{errors.approved_by}</p>}
                        </div>

                        <div>
                            <Label>Issued By (PMO Staff)</Label>
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

                        <div>
                            <Label>Checked By (Chief, Security)</Label>
                            <Input
                                placeholder="e.g., Chief D. Cruz"
                                value={data.checked_by ?? ''}
                                onChange={(e) => setData('checked_by', e.target.value)}
                            />
                            {errors.checked_by && <p className="mt-1 text-xs text-red-500">{errors.checked_by}</p>}
                        </div>

                        {/* Comments */}
                        <div className="col-span-2">
                            <Label>Comments</Label>
                            <Textarea
                                rows={3}
                                placeholder="Additional notes (optional)"
                                value={data.comments ?? ''}
                                onChange={(e) => setData('comments', e.target.value)}
                            />
                            {errors.comments && <p className="mt-1 text-xs text-red-500">{errors.comments}</p>}
                        </div>
                        <div className="col-span-2 border-t" />
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={processing}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing} onClick={handleSubmit}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
