import { PickerInput } from '@/components/picker-input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Asset, AssetFormData, AssetModel, Building, BuildingRoom, Category } from '@/pages/inventory-list/index';
import { WebcamCapture } from '@/pages/inventory-list/WebcamCapture';
import type { SubArea, UnitOrDepartment } from '@/types/custom-index';
import { router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Select from 'react-select';

type Props = {
    asset: Asset;
    onClose: () => void;
    buildings: Building[];
    unitOrDepartments: UnitOrDepartment[];
    buildingRooms: BuildingRoom[];
    categories: Category[];
    assetModels: AssetModel[];
    uniqueBrands: string[];
    subAreas: SubArea[];
    personnels: { id: number; full_name: string; position?: string | null }[]; // new
};

const safeDate = (val?: string | null) => {
    if (!val) return '';
    const d = new Date(val);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const EditAssetModalForm = ({
    onClose,
    asset,
    subAreas,
    buildings,
    unitOrDepartments,
    buildingRooms,
    categories,
    assetModels,
    personnels, // add this
}: Props) => {
    const [form, setForm] = useState<AssetFormData>({
        asset_name: asset.asset_name,
        supplier: asset.supplier,
        date_purchased: asset.date_purchased,
        // maintenance_due_date: asset.maintenance_due_date || '',
        maintenance_due_date: safeDate(asset.maintenance_due_date),
        assigned_to: asset.assigned_to ?? '',
        quantity: asset.quantity,
        serial_no: asset.serial_no || '',
        unit_cost: asset.unit_cost || '', // or asset.unit_cost if available NAGKAKAEEROR KAPAG NILALAGAY KOTO
        depreciation_value: asset.depreciation_value || '',
        memorandum_no: asset.memorandum_no || '',
        // transfer_status: asset.transfer_status || '',
        description: asset.description || '',

        // ensure we have the FK even if only relation is loaded
        category_id: (asset.category_id ?? asset.asset_model?.category_id ?? '') as number | '',

        // read from the row, not from category name
        asset_type: (asset.asset_type ?? '') as '' | 'fixed' | 'not_fixed',
        brand: asset.asset_model?.brand || '',
        asset_model_id: asset.asset_model?.id || '',
        unit_or_department_id: asset.unit_or_department?.id || '',
        building_id: asset.building?.id || '',
        building_room_id: asset.building_room?.id || '',
        status: asset.status || 'archived',
        image: null,

        sub_area_id: asset.sub_area?.id || '',
    });


    const handleChange = <K extends keyof AssetFormData>(field: K, value: AssetFormData[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const filteredRooms = buildingRooms.filter((room) => room.building_id === form.building_id);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [showWebcam, setShowWebcam] = useState(false); // webcam toggle

    // Filter models based on selected category
    const filteredModels = assetModels.filter((m) => m.category_id === Number(form.category_id));

    // Memoize filteredBrands so it doesn’t trigger unnecessary re-renders
    const filteredBrands = useMemo(() => {
        // No category selected → no brands
        if (!form.category_id) return [];

        // If a model is selected, show only brands tied to that model within the category
        if (form.asset_model_id) {
            const selectedModel = assetModels.find((m) => m.id === Number(form.asset_model_id));

            if (selectedModel) {
                return Array.from(
                    new Map(
                        assetModels
                            .filter(
                                (m) =>
                                    m.category_id === selectedModel.category_id &&
                                    m.model.toLowerCase().trim() === selectedModel.model.toLowerCase().trim() &&
                                    m.brand &&
                                    m.brand.trim() !== '',
                            )
                            .map((m) => [m.brand.trim().toLowerCase(), m.brand.charAt(0).toUpperCase() + m.brand.slice(1).toLowerCase()]),
                    ).values(),
                );
            }
        }

        // Otherwise, return all brands under the category
        return Array.from(
            new Map(
                assetModels
                    .filter((m) => m.category_id === Number(form.category_id) && m.brand && m.brand.trim() !== '')
                    .map((m) => [m.brand.trim().toLowerCase(), m.brand.charAt(0).toUpperCase() + m.brand.slice(1).toLowerCase()]),
            ).values(),
        );
    }, [form.category_id, form.asset_model_id, assetModels]);

    // Check if there is only one unique brand
    const isSingleBrand = filteredBrands.length === 1;

    // Auto-select brand if only one exists
    useEffect(() => {
        if (form.category_id && filteredBrands.length === 0 && form.brand) {
            handleChange('brand', '');
            return;
        }

        if (isSingleBrand && form.category_id && !form.brand && filteredBrands.length > 0) {
            handleChange('brand', filteredBrands[0]);
        }
    }, [form.category_id, form.asset_model_id, form.brand, filteredBrands, isSingleBrand]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Explicitly create FormData for file-safe uploads
        const formData = new FormData();

        // Safely append fields (type-checked)
        Object.entries({
            ...form,
            sub_area_id: form.sub_area_id === '' ? null : form.sub_area_id,
            _method: 'put', // Laravel expects this for updates
        }).forEach(([key, value]) => {
            if (value instanceof File) {
                // append files directly
                formData.append(key, value);
            } else if (typeof value === 'number') {
                // convert numbers to string
                formData.append(key, value.toString());
            } else if (typeof value === 'string') {
                formData.append(key, value);
            } else if (value === null) {
                // represent nulls as empty strings for backend consistency
                formData.append(key, '');
            }
            // undefined values are ignored
        });

        // Send multipart/form-data via Inertia
        router.post(`/inventory-list/${asset.id}`, formData, {
            forceFormData: true, // ensures file fields are preserved
            onSuccess: () => {
                onClose();
                // refresh notifications if due date was set to today/past
                router.reload({ only: ['notifications'] });
            },
            onError: (errors) => console.error(errors),
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <form onSubmit={handleSubmit}>
                <DialogContent className="max-h-[90vh] w-[98vw] max-w-none overflow-y-auto p-6 sm:w-[90vw] sm:max-w-none md:w-[85vw] lg:w-[80vw] xl:w-[1200px]">
                    <DialogHeader>
                        <DialogTitle>Update Asset - Asset Record #{asset.id}</DialogTitle>
                        <VisuallyHidden>
                            <DialogDescription>Edit the details of this asset record below and click Save Changes when done.</DialogDescription>
                        </VisuallyHidden>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div>
                            <Label>Asset Name</Label>
                            <Input placeholder="Enter Assets" value={form.asset_name} onChange={(e) => handleChange('asset_name', e.target.value)} />
                        </div>

                        <div>
                            <Label>Serial Number</Label>
                            <Input
                                placeholder="Enter Serial No."
                                value={form.serial_no}
                                onChange={(e) => handleChange('serial_no', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Asset Category</Label>
                            <Select
                                classNamePrefix="react-select"
                                placeholder="Select Category"
                                isClearable
                                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                                value={
                                    categories.find((c) => c.id === form.category_id)
                                        ? { value: form.category_id, label: categories.find((c) => c.id === form.category_id)!.name }
                                        : null
                                }
                                onChange={(option) => {
                                    handleChange('category_id', option ? option.value : '');
                                    handleChange('asset_model_id', '');
                                    handleChange('brand', '');
                                }}
                            />
                        </div>

                        <div>
                            <Label>Asset Model</Label>
                            <Select
                                placeholder="Select Asset Model"
                                isClearable
                                isDisabled={!form.category_id}
                                options={filteredModels.map((m) => ({ value: m.id, label: m.model || '(No Model)' }))}
                                value={
                                    filteredModels.find((m) => m.id === form.asset_model_id)
                                        ? {
                                              value: form.asset_model_id,
                                              label: filteredModels.find((m) => m.id === form.asset_model_id)!.model,
                                          }
                                        : null
                                }
                                onChange={(option) => {
                                    handleChange('asset_model_id', option ? option.value : '');
                                    const model = assetModels.find((m) => m.id === option?.value);
                                    if (model?.brand) {
                                        const formattedBrand = model.brand.charAt(0).toUpperCase() + model.brand.slice(1).toLowerCase();
                                        handleChange('brand', formattedBrand);
                                    }
                                }}
                            />
                        </div>

                        <div>
                            <Label>Brand</Label>
                            <Select
                                placeholder={
                                    !form.category_id
                                        ? 'Select a category first'
                                        : filteredBrands.length === 0
                                          ? 'No brands available'
                                          : 'Select Brand'
                                }
                                isClearable={!isSingleBrand}
                                isDisabled={!form.category_id || isSingleBrand}
                                options={filteredBrands.map((b) => ({ value: b, label: b }))}
                                value={form.brand ? { value: form.brand, label: form.brand } : null}
                                onChange={(option) => handleChange('brand', option ? option.value : '')}
                            />
                        </div>

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
                        </div>

                        <div>
                            <Label>Status</Label>
                            <select
                                className="w-full rounded-lg border p-2"
                                value={form.status}
                                onChange={(e) => handleChange('status', e.target.value as 'active' | 'archived' | 'missing' | '')}
                            >
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                                <option value="missing">Missing</option>
                            </select>
                        </div>

                        {/* Asset Image */}
                        <div className="col-span-2">
                            <Label className="mb-4 block text-left text-base font-semibold">Asset Image (Before & After)</Label>

                            <div className="flex justify-center gap-6">
                                {/* Before (current DB image) */}
                                {/* Before (current DB image) */}
                                <div className="flex min-h-[300px] flex-1 flex-col items-center justify-center rounded-lg border bg-gray-50 p-6">
                                    <p className="mb-3 text-sm font-medium text-gray-600">Current Image</p>

                                    {asset.image_path ? (
                                        <img
                                            src={
                                                asset.image_path.startsWith('http')
                                                    ? asset.image_path
                                                    : `https://${import.meta.env.VITE_AWS_BUCKET}.s3.${import.meta.env.VITE_AWS_DEFAULT_REGION}.amazonaws.com/${asset.image_path}`
                                            }
                                            alt={asset.asset_name}
                                            className="max-h-64 w-auto rounded-md border object-contain"
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/placeholder.png'; // fallback
                                            }}
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-400">No image available</span>
                                    )}
                                </div>

                                {/* After (upload new or camera) */}
                                <div className="flex min-h-[300px] flex-1 flex-col items-center justify-center rounded-lg border bg-gray-50 p-6">
                                    <p className="mb-3 text-sm font-medium text-gray-600">Update Image</p>

                                    {showWebcam ? (
                                        <WebcamCapture
                                            onCapture={(file) => {
                                                handleChange('image', file);
                                                setShowWebcam(false);
                                            }}
                                            onCancel={() => setShowWebcam(false)}
                                        />
                                    ) : (
                                        <>
                                            <div className="flex gap-2">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            handleChange('image', e.target.files[0]);
                                                        }
                                                    }}
                                                    className="block w-full max-w-xs cursor-pointer rounded-lg border p-2 text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-200"
                                                />
                                                <Button type="button" onClick={() => setShowWebcam(true)}>
                                                    Use Camera
                                                </Button>
                                            </div>

                                            {form.image && (
                                                <div className="mt-4 flex flex-col items-center gap-3">
                                                    <img
                                                        src={URL.createObjectURL(form.image)}
                                                        alt="Preview"
                                                        className="max-h-64 w-auto rounded-md border object-contain"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleChange('image', null);
                                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                                            }}
                                                            className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
                                                        >
                                                            Remove
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleChange('image', null);
                                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                                                setShowWebcam(true);
                                                            }}
                                                            className="rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600"
                                                        >
                                                            Retake
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="col-span-2 border-t"></div>

                        {/* Unit/Department */}
                        <div>
                            <Label>Unit/Department</Label>
                            <Select
                                placeholder="Select Unit/Department"
                                isClearable
                                options={unitOrDepartments.map((u) => ({
                                    value: u.id,
                                    label: `${u.name}`,
                                }))}
                                value={
                                    unitOrDepartments.find((u) => u.id === form.unit_or_department_id)
                                        ? {
                                              value: form.unit_or_department_id,
                                              label: `${unitOrDepartments.find((u) => u.id === form.unit_or_department_id)!.name}`,
                                          }
                                        : null
                                }
                                onChange={(option) => handleChange('unit_or_department_id', option ? option.value : '')}
                            />
                        </div>

                        {/* Building */}
                        <div>
                            <Label>Building</Label>
                            <Select
                                placeholder="Select Building"
                                isClearable
                                options={buildings.map((b) => ({
                                    value: b.id,
                                    label: `${b.name}`,
                                }))}
                                value={
                                    buildings.find((b) => b.id === form.building_id)
                                        ? {
                                              value: form.building_id,
                                              label: `${buildings.find((b) => b.id === form.building_id)!.name}`,
                                          }
                                        : null
                                }
                                onChange={(option) => {
                                    handleChange('building_id', option ? option.value : '');
                                    handleChange('building_room_id', '');
                                    handleChange('sub_area_id', '');
                                }}
                            />
                        </div>

                        {/* Room */}
                        <div>
                            <Label>Room</Label>
                            <Select
                                placeholder="Select Room"
                                isClearable
                                isDisabled={!form.building_id}
                                options={filteredRooms.map((r) => ({ value: r.id, label: r.room.toString() }))}
                                value={
                                    filteredRooms.find((r) => r.id === form.building_room_id)
                                        ? {
                                              value: form.building_room_id,
                                              label: filteredRooms.find((r) => r.id === form.building_room_id)!.room.toString(),
                                          }
                                        : null
                                }
                                onChange={(option) => {
                                    handleChange('building_room_id', option ? option.value : '');
                                    handleChange('sub_area_id', '');
                                }}
                            />
                        </div>

                        {/* Sub Area */}
                        <div>
                            <Label>Sub Area</Label>
                            <Select
                                placeholder="Select Sub Area"
                                isClearable
                                isDisabled={!form.building_room_id}
                                options={subAreas
                                    .filter((s) => s.building_room_id === Number(form.building_room_id))
                                    .map((s) => ({ value: s.id, label: s.name }))}
                                value={
                                    subAreas.find((s) => s.id === form.sub_area_id)
                                        ? { value: form.sub_area_id, label: subAreas.find((s) => s.id === form.sub_area_id)!.name }
                                        : null
                                }
                                onChange={(option) => handleChange('sub_area_id', option ? option.value : null)}
                            />
                        </div>

                        {/* Assigned To */}
                        <div className="col-span-1">
                            <Label>Assigned To</Label>
                            <Select
                                placeholder="Select Personnel"
                                isClearable
                                options={personnels.map((p) => ({
                                    value: p.id,
                                    label: `${p.full_name}${p.position ? ` – ${p.position}` : ''}`,
                                }))}
                                value={
                                    personnels.find((p) => p.id === form.assigned_to)
                                        ? {
                                              value: form.assigned_to,
                                              label: `${personnels.find((p) => p.id === form.assigned_to)!.full_name}${personnels.find((p) => p.id === form.assigned_to)!.position ? ` – ${personnels.find((p) => p.id === form.assigned_to)!.position}` : ''}`,
                                          }
                                        : null
                                }
                                onChange={(option) => handleChange('assigned_to', option ? option.value : null)}
                            />
                        </div>

                        {/* Divider */}
                        <div className="col-span-2 border-t"></div>

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

                        {/* Supplier */}
                        <div>
                            <Label>Supplier</Label>
                            <Input placeholder="Enter Suppliers" value={form.supplier} onChange={(e) => handleChange('supplier', e.target.value)} />
                        </div>

                        {/* Unit Cost */}
                        <div>
                            <Label>Unit Cost</Label>
                            <Input
                                type="number"
                                placeholder="Enter Unit Cost"
                                value={form.unit_cost}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleChange('unit_cost', value);

                                    // Auto-calc depreciation (straight-line, 5 years as placeholder)
                                    const depreciation = value ? (Number(value) / 5).toFixed(2) : '0.00';
                                    handleChange('depreciation_value', depreciation);
                                }}
                            />
                        </div>

                        {/* Depreciation Value */}
                        <div>
                            <Label>Depreciation Value (per year)</Label>
                            <Input
                                type="text"
                                value={form.depreciation_value ? `₱ ${Number(form.depreciation_value).toFixed(2)}` : ''}
                                readOnly // same as Total Cost, user can’t edit
                                className="bg-white text-black"
                            />
                        </div>

                        {/* Date Purchased */}
                        <div>
                            <Label>Date Purchased</Label>
                            <PickerInput type="date" value={form.date_purchased} onChange={(v) => handleChange('date_purchased', v)} />
                        </div>

                        {/* Maintenance Due Date */}
                        <div>
                            <Label>Maintenance Due Date</Label>
                            <PickerInput type="date" value={form.maintenance_due_date} onChange={(v) => handleChange('maintenance_due_date', v)} />
                        </div>

                        <div className="col-span-2">
                            <Label>Total Cost</Label>
                            <Input
                                type="text"
                                value={
                                    form.quantity && form.unit_cost
                                        ? `₱ ${(Number(form.quantity) * Number(form.unit_cost)).toLocaleString('en-PH', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                          })}`
                                        : ''
                                }
                                readOnly
                                className="cursor-default bg-white text-black"
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
                            <Button variant="outline" className="cursor-pointer">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="button" className="cursor-pointer" onClick={handleSubmit}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
};
