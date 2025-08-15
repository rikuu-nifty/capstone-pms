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
        category_id: asset.category_id ?? '',

        asset_type: asset.asset_model?.category?.name || '', // or map from asset_model.category.name if needed
        brand: asset.asset_model?.brand || '',
        asset_model_id: asset.asset_model?.id || '',
        unit_or_department_id: asset.unit_or_department?.id || '',
        building_id: asset.building?.id || '',
        building_room_id: asset.building_room?.id || '',
        status: asset.status || 'archived',
    });

    const handleChange = <K extends keyof AssetFormData>(field: K, value: AssetFormData[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const filteredRooms = buildingRooms.filter((room) => room.building_id === form.building_id);
    const filteredModels = assetModels.filter((model) => model.brand === form.brand);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/inventory-list/${asset.id}`, form, {
            onSuccess: () => {
                onClose(); // Closes the modal after successful save
            },
            onError: (errors) => {
                console.error(errors); // Optional: log any validation errors
            },
        });
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
                                onChange={(e) => handleChange('category_id', e.target.value === '' ? '' : Number(e.target.value))}
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
