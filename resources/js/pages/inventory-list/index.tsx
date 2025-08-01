import { DeleteAssetModal } from '@/components/delete-modal-form';
import { EditAssetModalForm } from '@/components/edit-modal-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewAssetModal } from '@/components/view-modal-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Eye, Filter, Grid, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory List',
        href: '/inventory-list',
    },
];

export type Category = {
    id: number;
    name: string;
    description: string;
};

export type AssetModel = {
    id: number;
    category_id: number;
    brand: string;
    model: string;
    category?: Category;
};

export type Building = {
    id: number;
    name: string;
    code: string | number;
    description: string;
};

export type BuildingRoom = {
    id: number;
    building_id: number;
    room: string | number;
    description: string;
};

export type UnitOrDepartment = {
    id: number;
    name: string;
    code: string | number;
    description: string;
};

export type Asset = {
    id: number;
    asset_name: string;
    supplier: string;
    date_purchased: string;
    quantity: number;
    building: Building | null;
    building_room?: BuildingRoom | null;
    unit_or_department: UnitOrDepartment | null;
    asset_model: AssetModel | null;
    asset_type: string;
    status: 'active' | 'archived';
    memorandum_no: number | string;
    unit_cost: number | string;
    serial_no: string;
    description: string;
    transfer_status: string;
    brand: string;
    // Kapag pinasok ko yun serial_no pati unit_cost ayaw mag save
};

export type AssetFormData = {
    unit_or_department_id: number | string;
    building_room_id: number | string;
    date_purchased: string;
    asset_type: string;
    asset_name: string;
    brand: string;
    quantity: number | string; // can be number or string
    supplier: string;
    unit_cost: number | string; // can be number or string
    serial_no: string;
    asset_model_id: number | string; // can be number or string
    building_id: number | string;
    transfer_status: string;
    description: string;
    memorandum_no: number | string; // can be number or string
    status: 'active' | 'archived' | '';
};

export default function Index({
    assets = [],
    assetModels = [],
    buildings = [],
    buildingRooms = [],
    unitOrDepartments = [],
    categories = [],
}: {
    assets: Asset[];
    assetModels: AssetModel[];
    buildings: Building[];
    buildingRooms: BuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
    categories: Category[];
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<AssetFormData>({
        building_id: '',
        unit_or_department_id: '',
        building_room_id: '',
        date_purchased: '',
        // category: '',
        asset_type: '',
        asset_name: '',
        brand: '',
        quantity: '',
        supplier: '',
        unit_cost: '',
        serial_no: '',
        asset_model_id: '',
        transfer_status: '',
        description: '',
        memorandum_no: '',
        status: '',
    });

    const [search, setSearch] = useState('');
    const [showAddAsset, setShowAddAsset] = useState(false);

    // Filter for Rooms
    const filteredRooms = buildingRooms.filter((room) => room.building_id === Number(data.building_id));

    // Filter for Brand
    const uniqueBrands = Array.from(new Set(assetModels.map((model) => model.brand)));
    const filteredModels = assetModels.filter((model) => model.brand === data.brand);

    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    // For Modal (Edit)
    const [editModalVisible, setEditModalVisible] = useState(false);

    // For Modal (Delete)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // For Modal (View)
    const [viewModalVisible, setViewModalVisible] = useState(false);

    // For Date Format
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inventory-list', {
            onSuccess: () => {
                reset();
                setShowAddAsset(false);
            },
        });
        console.log('Form Submitted', data);
    };

    useEffect(() => {
        if (!showAddAsset) {
            reset();
            clearErrors();
        }
    }, [showAddAsset, reset, clearErrors]);

    const filteredData = assets.filter((item) => {
        const keyword = search.toLowerCase();

        return (
            item.asset_name?.toLowerCase().includes(keyword) ||
            item.supplier?.toLowerCase().includes(keyword) ||
            item.asset_type?.toLowerCase().includes(keyword) ||
            item.transfer_status?.toLowerCase().includes(keyword) ||
            String(item.quantity).padStart(2, '0').includes(keyword) ||
            String(item.date_purchased).toLowerCase().includes(keyword) ||
            item.quantity?.toString().includes(keyword) ||
            item.building?.name?.toLowerCase().includes(keyword) ||
            item.unit_or_department?.name?.toLowerCase().includes(keyword) ||
            item.status?.toLowerCase().includes(keyword)

            // item.asset_model?.brand?.toLowerCase().includes(keyword)
            // item.serial_no?.toLowerCase().includes(keyword) ||
            // item.memorandum_no?.toString().includes(keyword) ||
            // item.building_room?.room?.toString().toLowerCase().includes(keyword) ||
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory List" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Inventory List</h1>
                        <p className="text-sm text-muted-foreground">
                            Provides a comprehensive overview of all university assets to facilitate accurate tracking and auditing.
                        </p>
                        <Input
                            type="text"
                            placeholder="Search by asset name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Grid className="mr-1 h-4 w-4" /> Category
                        </Button>
                        <Button variant="outline">
                            <Filter className="mr-1 h-4 w-4" /> Filter
                        </Button>
                        <Button
                            onClick={() => {
                                reset();
                                clearErrors();
                                setShowAddAsset(true);
                            }}
                            className="cursor-pointer"
                        >
                            <PlusCircle className="mr-1 h-4 w-4" /> Add Asset
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead>Asset Name</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Date Purchased</TableHead>
                                <TableHead>Asset Type</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Building</TableHead>
                                <TableHead>Unit/Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.asset_name}</TableCell>
                                    <TableCell>{item.asset_model?.brand ?? '—'}</TableCell>
                                    <TableCell>{formatDate(item.date_purchased)}</TableCell>
                                    <TableCell>{item.asset_model?.category?.name ?? '—'}</TableCell>
                                    <TableCell>{String(item.quantity).padStart(2, '0')}</TableCell>
                                    <TableCell>{item.building?.name ?? '—'}</TableCell>
                                    <TableCell>{item.unit_or_department?.name ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                            {item.status === 'active' ? 'Active' : 'Archived'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedAsset(item); // item = asset row clicked
                                                setEditModalVisible(true); // show modal
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedAsset(item); // item = asset row clicked
                                                setDeleteModalVisible(true); // show modal
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedAsset(item);
                                                setViewModalVisible(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {editModalVisible && selectedAsset && (
                <EditAssetModalForm
                    asset={selectedAsset}
                    onClose={() => {
                        setEditModalVisible(false);
                        setSelectedAsset(null);
                    }}
                    buildings={buildings}
                    unitOrDepartments={unitOrDepartments}
                    buildingRooms={buildingRooms}
                    categories={categories}
                    assetModels={assetModels}
                    uniqueBrands={[...new Set(assetModels.map((m) => m.brand))]}
                />
            )}

            {deleteModalVisible && selectedAsset && (
                <DeleteAssetModal
                    asset={selectedAsset}
                    onClose={() => {
                        setDeleteModalVisible(false);
                        setSelectedAsset(null);
                    }}
                    onDelete={(id) => {
                        router.delete(`/inventory-list/${id}`, {
                            onSuccess: () => {
                                setDeleteModalVisible(false);
                                setSelectedAsset(null);
                            },
                            onError: (err) => {
                                console.error('Failed to delete asset:', err);
                            },
                        });
                    }}
                />
            )}

            {viewModalVisible && selectedAsset && (
                <ViewAssetModal
                    asset={selectedAsset}
                    onClose={() => {
                        setViewModalVisible(false);
                        setSelectedAsset(null);
                    }}
                />
            )}

            {/* Side Panel Modal with Slide Effect */}
            <div className={`fixed inset-0 z-50 flex transition-all duration-300 ease-in-out ${showAddAsset ? 'visible' : 'invisible'}`}>
                <div
                    className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${showAddAsset ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setShowAddAsset(false)}
                ></div>

                <div
                    className={`relative ml-auto w-full max-w-3xl transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900 ${
                        showAddAsset ? 'translate-x-0' : 'translate-x-full'
                    }`}
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    <div className="mb-4 flex items-center justify-between p-6">
                        <h2 className="text-xl font-semibold">Add New Asset</h2>
                        <button onClick={() => setShowAddAsset(false)} className="cursor-pointer text-2xl font-medium">
                            &times;
                        </button>
                    </div>

                    {/* Scrollable Form Section */}
                    <div className="auto overflow-y-auto px-6" style={{ flex: 1 }}>
                        {' '}
                        {/*overflow-y-auto */}
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4 pb-6 text-sm">
                            {/* Top Section */}

                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Building</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.building_id}
                                    onChange={(e) => setData('building_id', Number(e.target.value))}
                                >
                                    <option value="">Select Building</option>
                                    {buildings.map((building) => (
                                        <option key={building.id} value={building.id}>
                                            {building.name} ({building.code})
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
                                    onChange={(e) => setData('unit_or_department_id', Number(e.target.value))}
                                >
                                    <option value="">Select Unit/Department</option>
                                    {unitOrDepartments.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.code} - {unit.name}
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
                                    onChange={(e) => setData('building_room_id', Number(e.target.value))}
                                    disabled={!data.building_id}
                                >
                                    <option value="">Select Room</option>
                                    {filteredRooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            {room.room}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Status</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as 'active' | 'archived')}
                                >
                                    <option value="">Select Status</option>
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            {/* Divider */}
                            <div className="col-span-2 border-t"></div>

                            {/* Middle Section */}
                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Date Purchased</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border p-2"
                                    value={data.date_purchased}
                                    onChange={(e) => setData('date_purchased', e.target.value)}
                                />
                                {errors.date_purchased && <p className="mt-1 text-xs text-red-500">{errors.date_purchased}</p>}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Asset Type</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.asset_type}
                                    onChange={(e) => setData('asset_type', e.target.value)}
                                >
                                    <option value="">Select Asset Category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.asset_type && <p className="mt-1 text-xs text-red-500">{errors.asset_type}</p>}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Asset Name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Assets"
                                    value={data.asset_name}
                                    onChange={(e) => setData('asset_name', e.target.value)}
                                />
                                {errors.asset_name && <p className="mt-1 text-xs text-red-500">{errors.asset_name}</p>}

                                {/* <InputError message={errors.asset_name}/>  */}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Supplier</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Suppliers"
                                    value={data.supplier}
                                    onChange={(e) => setData('supplier', e.target.value)}
                                />
                                {errors.supplier && <p className="mt-1 text-xs text-red-500">{errors.supplier}</p>}
                            </div>
                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Serial Number</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Serial No."
                                    value={data.serial_no}
                                    onChange={(e) => setData('serial_no', e.target.value)}
                                />
                                {errors.serial_no && <p className="mt-1 text-xs text-red-500">{errors.serial_no}</p>}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Quantity</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Quantity"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                />
                                {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Unit Cost</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Unit Cost"
                                    value={data.unit_cost}
                                    onChange={(e) => setData('unit_cost', e.target.value)}
                                />
                                {errors.unit_cost && <p className="mt-1 text-xs text-red-500">{errors.unit_cost}</p>}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Brand</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.brand}
                                    onChange={(e) => {
                                        setData('brand', e.target.value);
                                        setData('asset_model_id', ''); // Reset model when brand changes
                                    }}
                                >
                                    <option value="">Select Brand</option>
                                    {uniqueBrands.map((brand, index) => (
                                        <option key={index} value={brand}>
                                            {brand}
                                        </option>
                                    ))}
                                </select>
                                {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand}</p>}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Asset Model</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.asset_model_id}
                                    onChange={(e) => setData('asset_model_id', Number(e.target.value))}
                                    disabled={!data.brand}
                                >
                                    <option value="">Select Asset Model</option>
                                    {filteredModels.map((model) => (
                                        <option key={model.id} value={model.id}>
                                            {model.model}
                                        </option>
                                    ))}
                                </select>
                                {errors.asset_model_id && <p className="mt-1 text-xs text-red-500">{errors.asset_model_id}</p>}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Memorandum Number</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Memorandum No."
                                    value={data.memorandum_no}
                                    onChange={(e) => setData('memorandum_no', Number(e.target.value))}
                                />
                                {errors.memorandum_no && <p className="mt-1 text-xs text-red-500">{errors.memorandum_no}</p>}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Transfer Status</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.transfer_status}
                                    onChange={(e) => setData('transfer_status', e.target.value)}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Transferred"> Transferred </option>
                                    <option value="Not Transferred"> Not Transferred </option>
                                </select>
                                {errors.transfer_status && <p className="mt-1 text-xs text-red-500">{errors.transfer_status}</p>}
                            </div>
                            <div className="col-span-1 pt-0.5">
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
                                <label className="mb-1 block font-medium">Description</label>
                                <textarea
                                    rows={4}
                                    className="w-full resize-none rounded-lg border p-2"
                                    placeholder="Enter Description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                            </div>

                            {/* Buttons Footer inside the form */}

                            <div className="col-span-2 flex justify-end gap-2 border-t border-muted pt-4">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowAddAsset(false);
                                    }}
                                    className="cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="cursor-pointer" disabled={processing}>
                                    Add New Asset
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
