import { PickerInput } from '@/components/picker-input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { useState } from 'react';

import type { Asset, AssetFormData, AssetModel, Building, BuildingRoom, Category, UnitOrDepartment } from '@/pages/inventory-list/index';

type Props = {
    asset: Asset;
    onClose: () => void;
    buildings: Building[];
    unitOrDepartments: UnitOrDepartment[];
    buildingRooms: BuildingRoom[];
    categories: Category[];
    assetModels: AssetModel[];
    uniqueBrands: string[];
};

export const EditAssetModalForm = ({ asset, onClose, buildings, unitOrDepartments, buildingRooms, categories, assetModels, uniqueBrands }: Props) => {
    const [form, setForm] = useState<AssetFormData>({
        asset_name: asset.asset_name,
        supplier: asset.supplier,
        date_purchased: asset.date_purchased,
        quantity: asset.quantity,
        serial_no: asset.serial_no || '', // or asset.serial_no if available
        unit_cost: asset.unit_cost || '', // or asset.unit_cost if available NAGKAKAEEROR KAPAG NILALAGAY KOTO
        memorandum_no: asset.memorandum_no || '', // or asset.memorandum_no if available
        transfer_status: asset.transfer_status || '',
        description: asset.description || '',

        // ✅ ensure we have the FK even if only relation is loaded
        category_id: (asset.category_id ?? asset.asset_model?.category_id ?? '') as number | '',

        // ✅ read from the row, not from category name
        asset_type: (asset.asset_type ?? '') as '' | 'fixed' | 'not_fixed',
        brand: asset.asset_model?.brand || '',
        asset_model_id: asset.asset_model?.id || '',
        unit_or_department_id: asset.unit_or_department?.id || '',
        building_id: asset.building?.id || '',
        building_room_id: asset.building_room?.id || '',
        status: asset.status || 'archived',
        // ✅ new field
        image: null,
    });

    const handleChange = <K extends keyof AssetFormData>(field: K, value: AssetFormData[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const filteredRooms = buildingRooms.filter((room) => room.building_id === form.building_id);
    const filteredModels = assetModels.filter((model) => model.brand === form.brand);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(
            `/inventory-list/${asset.id}`,
            {
                ...form,
                _method: 'put', // ✅ Laravel will interpret this as a PUT
            },
            {
                forceFormData: true, // ✅ ensures File objects get sent as FormData
                onSuccess: () => onClose(),
                onError: (errors) => console.error(errors),
            },
        );
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <form onSubmit={handleSubmit}>
                <DialogContent className="max-h-[90vh] w-[98vw] max-w-none overflow-y-auto p-6 sm:w-[90vw] sm:max-w-none md:w-[85vw] lg:w-[80vw] xl:w-[1200px]">
                    <DialogHeader>
                        <DialogTitle>Update Asset - Asset Record #{asset.id}</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        {/* Building */}
                        <div>
                            <Label>Building</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.building_id}
                                onChange={(e) => handleChange('building_id', Number(e.target.value))}
                            >
                                <option value="">Select Building</option>
                                {buildings.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} ({b.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Unit/Department */}
                        <div>
                            <Label>Unit/Department</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.unit_or_department_id}
                                onChange={(e) => handleChange('unit_or_department_id', Number(e.target.value))}
                            >
                                <option value="">Select Unit/Department</option>
                                {unitOrDepartments.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.code} - {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Room */}
                        <div>
                            <Label>Room</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.building_room_id}
                                onChange={(e) => handleChange('building_room_id', Number(e.target.value))}
                                disabled={!form.building_id}
                            >
                                <option value="">Select Room</option>
                                {filteredRooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        {room.room}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label>Status</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.status}
                                onChange={(e) => handleChange('status', e.target.value as 'active' | 'archived')}
                            >
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Divider */}
                        <div className="col-span-2 border-t"></div>

                        {/* Date Purchased */}
                        <div>
                            <Label>Date Purchased</Label>
                            <PickerInput type="date" value={form.date_purchased} onChange={(v) => handleChange('date_purchased', v)} />
                        </div>

                        {/* Asset Type */}
                        <div>
                            <Label>Asset Type</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.asset_type}
                                onChange={(e) => handleChange('asset_type', e.target.value as 'fixed' | 'not_fixed' | '')}
                            >
                                <option value="">Select Asset Type</option>
                                <option value="fixed">Fixed</option>
                                <option value="not_fixed">Not Fixed</option>
                            </select>
                            {/* {errors.asset_type && <p className="mt-1 text-xs text-red-500">{errors.asset_type}</p>} */}
                        </div>

                        {/* Asset Category */}
                        <div>
                            <Label>Asset Category</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.category_id ?? ''} // FK on the row
                                onChange={(e) => handleChange('category_id', Number(e.target.value))}
                            >
                                <option value="">Select Asset Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {/* {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>} */}
                        </div>

                        {/* Asset Name */}
                        <div>
                            <Label>Asset Name</Label>
                            <Input placeholder="Enter Assets" value={form.asset_name} onChange={(e) => handleChange('asset_name', e.target.value)} />
                        </div>

                        {/* Supplier */}
                        <div>
                            <Label>Supplier</Label>
                            <Input placeholder="Enter Suppliers" value={form.supplier} onChange={(e) => handleChange('supplier', e.target.value)} />
                        </div>

                        {/* Serial Number */}
                        <div>
                            <Label>Serial Number</Label>
                            <Input
                                placeholder="Enter Serial No."
                                value={form.serial_no}
                                onChange={(e) => handleChange('serial_no', e.target.value)}
                            />
                        </div>

                        {/* Quantity */}
                        <div>
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                placeholder="Enter Quantity"
                                value={form.quantity}
                                onChange={(e) => handleChange('quantity', e.target.value)}
                            />
                        </div>

                        {/* Unit Cost */}
                        <div>
                            <Label>Unit Cost</Label>
                            <Input
                                type="number"
                                placeholder="Enter Unit Cost"
                                value={form.unit_cost}
                                onChange={(e) => handleChange('unit_cost', e.target.value)}
                            />
                        </div>

                        {/* Brand */}
                        <div>
                            <Label>Brand</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.brand}
                                onChange={(e) => {
                                    handleChange('brand', e.target.value);
                                    handleChange('asset_model_id', '');
                                }}
                            >
                                <option value="">Select Brand</option>
                                {uniqueBrands.map((b) => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Asset Model */}
                        <div>
                            <Label>Asset Model</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.asset_model_id}
                                onChange={(e) => handleChange('asset_model_id', Number(e.target.value))}
                                disabled={!form.brand}
                            >
                                <option value="">Select Asset Model</option>
                                {filteredModels.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Memorandum Number */}
                        <div>
                            <Label>Memorandum Number</Label>
                            <Input
                                type="number"
                                className="w-full rounded-lg border p-2"
                                value={form.memorandum_no}
                                onChange={(e) => handleChange('memorandum_no', Number(e.target.value))}
                            />
                        </div>

                        {/* Transfer Status */}
                        <div>
                            <Label>Transfer Status</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.transfer_status}
                                onChange={(e) => handleChange('transfer_status', e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="transferred">Transferred</option>
                                <option value="not_transferred">Not Transferred</option>
                            </select>
                        </div>

                        {/* Asset Image */}
                        <div>
                            <Label>Asset Image (Before & After)</Label>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Before (current DB image) */}
                                <div className="rounded-lg border bg-gray-50 p-3 text-center">
                                    <p className="mb-2 text-sm font-medium text-gray-600">Current Image</p>
                                    {asset.image_path ? (
                                        <img
                                            src={`/storage/${asset.image_path}`}
                                            alt={asset.asset_name}
                                            className="mx-auto h-24 w-24 rounded-md border object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-400">No image available</span>
                                    )}
                                </div>

                                {/* After (upload new) */}
                                <div className="rounded-lg border bg-gray-50 p-3 text-center">
                                    <p className="mb-2 text-sm font-medium text-gray-600">Update Image</p>

                                    {/* Hidden real file input */}
                                    <input
                                        id="asset-image-edit"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                handleChange('image', e.target.files[0]); // ✅ new File
                                            }
                                        }}
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                    />

                                    {/* Styled fake input */}
                                    <label
                                        htmlFor="asset-image-edit"
                                        className="flex w-full cursor-pointer items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-gray-500 shadow-sm transition hover:border-gray-400 hover:bg-gray-50"
                                    >
                                        {form.image ? (
                                            <span className="truncate text-gray-800">{(form.image as File).name}</span>
                                        ) : (
                                            <span className="text-gray-400">Choose File</span>
                                        )}
                                        <span className="ml-2 rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-200">
                                            Browse
                                        </span>
                                    </label>

                                    {/* Preview newly selected image */}
                                    {form.image && (
                                        <div className="mt-3 flex flex-col items-center gap-2">
                                            <img
                                                src={URL.createObjectURL(form.image)}
                                                alt="Preview"
                                                className="h-24 w-24 rounded-md border object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleChange('image', null)}
                                                className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Total Cost */}
                        <div>
                            <Label>Total Cost</Label>
                            <Input
                                value={form.quantity && form.unit_cost ? `₱ ${(Number(form.quantity) * Number(form.unit_cost)).toFixed(2)}` : ''}
                                readOnly
                                disabled
                            />
                        </div>

                        {/* Description */}
                        <div className="col-span-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Enter Description"
                                value={form.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                            />
                        </div>
                        <div className="col-span-2 border-t"></div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="button" onClick={handleSubmit}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
};
