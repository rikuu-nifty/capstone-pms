import { PickerInput } from '@/components/picker-input';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { AssetModel, Building, BuildingRoom, Category, UnitOrDepartment } from './index';

type Props = {
    open: boolean;
    onClose: () => void;
    buildings: Building[];
    buildingRooms: BuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
    categories: Category[];
    assetModels: AssetModel[];
};

export function AddBulkAssetModalForm({ open, onClose, buildings, buildingRooms, unitOrDepartments, categories, assetModels }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        building_id: '',
        unit_or_department_id: '',
        building_room_id: '',
        date_purchased: '',
        category_id: '',
        asset_type: '',
        asset_name: '',
        brand: '',
        supplier: '',
        unit_cost: '',
        memorandum_no: '',
        transfer_status: '',
        description: '',
        asset_model_id: '',
        image: null as File | null,
        quantity: '',
        serial_numbers: [] as string[], // ✅ for multiple serials
        status: '',
        mode: 'bulk',
    });

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [enableMultipleSerials, setEnableMultipleSerials] = useState(false);

    const filteredRooms = buildingRooms.filter((room) => room.building_id === Number(data.building_id));
    const uniqueBrands = Array.from(new Set(assetModels.map((m) => m.brand)));
    const filteredModels = assetModels.filter((m) => m.brand === data.brand);
    

    const addSerialField = () => {
        setData('serial_numbers', [...data.serial_numbers, '']);
    };

    const updateSerial = (i: number, value: string) => {
        const copy = [...data.serial_numbers];
        copy[i] = value;
        setData('serial_numbers', copy);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inventory-list', {
            onSuccess: () => {
                reset();
                clearErrors();
                onClose();
            },
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex transition-all duration-300 ease-in-out">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/40" onClick={onClose}></div>

            {/* Slide-In Panel */}
            <div
                className={`relative ml-auto w-full max-w-3xl transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900 ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{ display: 'flex', flexDirection: 'column' }}
            >
                {/* Header */}
                <div className="mb-4 flex items-center justify-between p-6">
                    <h2 className="text-xl font-semibold">Add Bulk Assets</h2>
                    <button onClick={onClose} className="cursor-pointer text-2xl font-medium">
                        &times;
                    </button>
                </div>

                {/* Scrollable Form Section */}
                <div className="auto overflow-y-auto px-6" style={{ flex: 1 }}>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4 pb-6 text-sm">
                        {/* Building */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Building</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.building_id}
                                onChange={(e) => setData('building_id', e.target.value)}
                            >
                                <option value="">Select Building</option>
                                {buildings.map((b) => (
                                    <option key={b.id} value={b.id.toString()}>
                                        {b.name} ({b.code})
                                    </option>
                                ))}
                            </select>
                              {errors.building_id && <p className="mt-1 text-xs text-red-500">{errors.building_id}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Unit/Department</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.unit_or_department_id}
                                onChange={(e) => setData('unit_or_department_id', e.target.value)}
                            >
                                <option value="">Select Unit/Department</option>
                                {unitOrDepartments.map((u) => (
                                    <option key={u.id} value={u.id.toString()}>
                                        {u.name} ({u.code})
                                    </option>
                                ))}
                            </select>
                            {errors.unit_or_department_id && <p className="mt-1 text-xs text-red-500">{errors.unit_or_department_id}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Room</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.building_room_id}
                                onChange={(e) => setData('building_room_id', e.target.value)}
                                disabled={!data.building_id}
                            >
                                <option value="">Select Room</option>
                                {filteredRooms.map((room) => (
                                    <option key={room.id} value={room.id.toString()}>
                                        {room.room}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Status</label>
                            <select className="w-full rounded-lg border p-2" value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                <option value="">Select Status</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Divider */}
                        <div className="col-span-2 border-t"></div>

                        {/* Date + Type */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Date Purchased</label>
                            <PickerInput type="date" value={data.date_purchased} onChange={(v) => setData('date_purchased', v)} />
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Asset Type</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.asset_type}
                                onChange={(e) => setData('asset_type', e.target.value)}
                            >
                                <option value="">Select Asset Type</option>
                                <option value="fixed">Fixed</option>
                                <option value="not_fixed">Not Fixed</option>
                            </select>
                        </div>

                        {/* Category + Name */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Asset Category</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id.toString()}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Asset Name</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border p-2"
                                placeholder="Enter Asset"
                                value={data.asset_name}
                                onChange={(e) => setData('asset_name', e.target.value)}
                            />
                        </div>

                        {/* Supplier + Quantity */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Supplier</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border p-2"
                                value={data.supplier}
                                onChange={(e) => setData('supplier', e.target.value)}
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Quantity</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border p-2"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', e.target.value)}
                            />
                        </div>

                        {/* ✅ Enable Multiple Serials */}
                        <div className="col-span-2 flex items-center gap-2">
                            <input type="checkbox" checked={enableMultipleSerials} onChange={(e) => setEnableMultipleSerials(e.target.checked)} />
                            <span>Enable multiple serial numbers</span>
                        </div>

                        {enableMultipleSerials && (
                            <div className="col-span-2 space-y-2">
                                {data.serial_numbers.map((sn, i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        placeholder={`Serial ${i + 1}`}
                                        className="w-full rounded-lg border p-2"
                                        value={sn}
                                        onChange={(e) => updateSerial(i, e.target.value)}
                                    />
                                ))}
                                <Button type="button" onClick={addSerialField}>
                                    + Add Another Serial
                                </Button>
                            </div>
                        )}

                        {/* Unit Cost + Brand */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Unit Cost</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border p-2"
                                value={data.unit_cost}
                                onChange={(e) => setData('unit_cost', e.target.value)}
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Brand</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.brand}
                                onChange={(e) => {
                                    setData('brand', e.target.value);
                                    setData('asset_model_id', '');
                                }}
                            >
                                <option value="">Select Brand</option>
                                {uniqueBrands.map((brand, index) => (
                                    <option key={index} value={brand}>
                                        {brand}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Model + Memo */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Asset Model</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.asset_model_id}
                                onChange={(e) => setData('asset_model_id', e.target.value)}
                                disabled={!data.brand}
                            >
                                <option value="">Select Asset Model</option>
                                {filteredModels.map((model) => (
                                    <option key={model.id} value={model.id.toString()}>
                                        {model.model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Memorandum Number</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border p-2"
                                value={data.memorandum_no}
                                onChange={(e) => setData('memorandum_no', e.target.value)}
                            />
                        </div>

                        {/* Transfer + Image */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Transfer Status</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={data.transfer_status}
                                onChange={(e) => setData('transfer_status', e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="transferred">Transferred</option>
                                <option value="not_transferred">Not Transferred</option>
                            </select>
                        </div>

                        

                        {/* Total Cost */}
                        <div className="col-span-1">
                            <label className="mb-1 block font-medium">Total Cost</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border p-2"
                                value={data.quantity && data.unit_cost ? `₱ ${(Number(data.quantity) * Number(data.unit_cost)).toFixed(2)}` : ''}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1 block font-medium">Asset Image</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setData('image', e.target.files[0]);
                                    }
                                }}
                                className="block w-full cursor-pointer rounded-lg border p-2 text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-200"
                            />
                            {data.image && (
                                <div className="mt-3 flex items-center gap-3 rounded-lg border bg-gray-50 p-2 shadow-sm">
                                    <img
                                        src={URL.createObjectURL(data.image as File)}
                                        alt="Preview"
                                        className="h-20 w-20 rounded-md border object-cover"
                                    />
                                    <div className="flex flex-col">
                                        <span className="max-w-[140px] truncate text-sm font-medium text-gray-700">{(data.image as File).name}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('image', null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                            className="mt-1 w-fit rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="col-span-2">
                            <label className="mb-1 block font-medium">Description</label>
                            <textarea
                                rows={4}
                                className="w-full resize-none rounded-lg border p-2"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="col-span-2 flex justify-end gap-2 border-t border-muted pt-4">
                            <Button type="button" variant="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Add Bulk Assets
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
