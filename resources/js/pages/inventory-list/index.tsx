import { DeleteAssetModal } from '@/components/delete-modal-form';
import { EditAssetModalForm } from '@/components/edit-asset-modal-form';
import { PickerInput } from '@/components/picker-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewAssetModal } from '@/components/view-modal-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Banknote, Boxes, Eye, Filter, Grid, Pencil, PlusCircle, Trash2, FolderArchive, Pin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AddBulkAssetModalForm } from './addBulkAssetModal';
import { ChooseAddTypeModal } from './chooseAddTypeModal';
import { ChooseViewModal } from './chooseViewModal';
import { ViewMemorandumReceiptModal } from './ViewMemorandumReceipt';

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

export type TransferStatus = 'pending' | 'completed' | 'denied';

export type Asset = {
    id: number;
    memorandum_no: number | string;
    asset_model: AssetModel | null;
    asset_name: string;
    asset_type: string;
    description: string;
    status: 'active' | 'archived';
    category_id: number;
    category?: Category | null;
    unit_or_department: UnitOrDepartment | null;
    building: Building | null;
    building_room?: BuildingRoom | null;
    serial_no: string;
    supplier: string;
    unit_cost: number | string;
    date_purchased: string;
    quantity: number;
    transfer_status: TransferStatus; // ✅ strongly typed;
    brand: string;
    image_path?: string | null; // ✅ new field
    maintenance_due_date: string; // ✅ new field
};

export type AssetFormData = {
    memorandum_no: number | string; // can be number or string
    asset_model_id: number | string; // can be number or string
    asset_name: string;
    description: string;
    status: 'active' | 'archived' | '';
    unit_or_department_id: number | string;
    building_id: number | string;
    building_room_id: number | string;
    serial_no: string;
    supplier: string;
    unit_cost: number | string; // can be number or string
    date_purchased: string;
    asset_type: string;
    category_id: number | '';
    quantity: number | string; // can be number or string
    brand: string;
    transfer_status: string;
    image?: File | null; // ✅ add this
    maintenance_due_date: string; // ✅ new field
};

type KPIs = {
    total_assets: number;
    total_inventory_sum: number;
    active_pct: number;
    archived_pct: number;
    fixed_pct: number;
    not_fixed_pct: number;
};

export default function InventoryListIndex({
    assets = [],
    assetModels = [],
    buildings = [],
    buildingRooms = [],
    unitOrDepartments = [],
    categories = [],
    show_view_modal = false,
    viewing_asset = null,

    kpis = {
        total_assets: 0,
        total_inventory_sum: 0,
        active_pct: 0,
        archived_pct: 0,
        fixed_pct: 0,
        not_fixed_pct: 0,
    },
}: {
    assets: Asset[];
    assetModels: AssetModel[];
    buildings: Building[];
    buildingRooms: BuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
    categories: Category[];
    show_view_modal?: boolean; // ✅ new
    viewing_asset?: Asset | null;

    kpis?: KPIs;
}) {
    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm<AssetFormData>({
        building_id: '',
        unit_or_department_id: '',
        building_room_id: '',
        date_purchased: '',
        maintenance_due_date: '', // ✅ new default
        category_id: '',
        asset_type: '',
        asset_name: '',
        brand: '',
        quantity: 1,
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
    // const [viewModalVisible, setViewModalVisible] = useState(false);

    const [isViewOpen, setIsViewOpen] = useState<boolean>(!!show_view_modal);

    const formatNumber = (n: number) => new Intl.NumberFormat().format(n);
    const formatPeso = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(n);

    useEffect(() => {
        setIsViewOpen(!!show_view_modal);
    }, [show_view_modal]);

    const openView = (id: number) => {
        router.get(
            route('inventory-list.view', id), // points to /inventory-list/{id}/viewAssetDetails
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['show_view_modal', 'viewing_asset'], // only fetch these props
            },
        );
    };

    const closeView = () => {
        setIsViewOpen(false);
        router.visit(route('inventory-list.index'), {
            replace: true, // keeps history clean
            preserveScroll: true,
            preserveState: true,
        });
    };

    const [chooseViewVisible, setChooseViewVisible] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [receiptModalVisible, setReceiptModalVisible] = useState(false);

    // For choose modal
    const [chooseAddVisible, setChooseAddVisible] = useState(false);

    // For bulk add modal
    const [showAddBulkAsset, setShowAddBulkAsset] = useState(false);

    const [receiptAssets, setReceiptAssets] = useState<Asset[]>([]);
    const [receiptMemoNo, setReceiptMemoNo] = useState<string | number>('');

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

        transform((d) => ({
            ...d,
            // ensure numbers are numbers (or stay empty only when allowed)
            building_id: d.building_id === '' ? '' : Number(d.building_id),
            unit_or_department_id: d.unit_or_department_id === '' ? '' : Number(d.unit_or_department_id),
            building_room_id: d.building_room_id === '' ? '' : Number(d.building_room_id),
            category_id: d.category_id === '' ? '' : Number(d.category_id),
            asset_model_id: d.asset_model_id === '' ? '' : Number(d.asset_model_id),
            memorandum_no: d.memorandum_no === '' ? '' : Number(d.memorandum_no),
            unit_cost: d.unit_cost === '' ? '' : Number(d.unit_cost),
            quantity: d.quantity === '' ? 1 : Number(d.quantity), // 👈 safety net
        }));

        post('/inventory-list', {
            forceFormData: true, // 👈 tell Inertia to send multipart/form-data
            onSuccess: () => {
                reset();
                setShowAddAsset(false);
                router.reload({ only: ['notifications'] });
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

            {/* <div className="flex flex-col gap-4 p-4"> */}
            {/* <div className="flex items-center justify-between">
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
                </div> */}

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Inventory List</h1>
                    <p className="text-sm text-muted-foreground">
                        Provides a comprehensive overview of all university assets to facilitate accurate tracking and auditing.
                    </p>
                </div>

                {kpis && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        {/* Total Assets */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                            <Boxes className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Total Assets</div>
                            <div className="text-2xl font-semibold">
                            {formatNumber(kpis.total_assets)}
                            </div>
                        </div>
                        </div>

                        {/* Active vs Archived */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                            <FolderArchive className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Active vs Archived</div>
                            <div className="text-2xl font-semibold">
                            {kpis.active_pct}% vs {kpis.archived_pct}%
                            </div>
                        </div>
                        </div>

                        {/* Fixed vs Not Fixed */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                            <Pin className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Fixed vs Not Fixed</div>
                            <div className="text-2xl font-semibold">
                            {kpis.fixed_pct}% vs {kpis.not_fixed_pct}%
                            </div>
                        </div>
                        </div>

                        {/* Total Inventory Value */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                            <Banknote className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Total Inventory Value</div>
                            <div className="text-2xl font-semibold">
                            {formatPeso(kpis.total_inventory_sum)}
                            </div>
                        </div>
                        </div>
                    </div>
                )}

                {/* Controls row — search on the left, buttons on the right */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
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
                                setChooseAddVisible(true); // ✅ show choose modal first
                                // setShowAddAsset(true);
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
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Asset Name</TableHead>
                                <TableHead className="text-center">Image</TableHead>
                                <TableHead className="text-center">Brand</TableHead>
                                <TableHead className="text-center">Date Purchased</TableHead>
                                <TableHead className="text-center">Asset Type</TableHead>
                                {/* <TableHead className="text-center">Quantity</TableHead> */}
                                <TableHead className="text-center">Building</TableHead>
                                <TableHead className="text-center">Unit/Department</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">NFC Link</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="text-center">
                            {filteredData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.asset_name}</TableCell>
                                    <TableCell>
                                        {item.image_path ? (
                                            <img
                                                src={`/storage/${item.image_path}`}
                                                alt={item.asset_name}
                                                className="mx-auto max-h-24 w-auto rounded object-cover"
                                            />
                                        ) : (
                                            'No Image Uploaded'
                                        )}
                                    </TableCell>
                                    <TableCell>{item.asset_model?.brand ?? '—'}</TableCell>
                                    <TableCell>{formatDate(item.date_purchased)}</TableCell>
                                    <TableCell>
                                        {item.asset_type === 'fixed' ? 'Fixed' : item.asset_type === 'not_fixed' ? 'Not Fixed' : '—'}
                                    </TableCell>
                                    {/* <TableCell>{String(item.quantity).padStart(2, '0')}</TableCell> */}
                                    <TableCell>{item.building?.name ?? '—'}</TableCell>
                                    <TableCell>
                                        {/* {item.unit_or_department ? `${item.unit_or_department.code}` : '—'} */}
                                        {item.unit_or_department ? `${item.unit_or_department.name} (${item.unit_or_department.code})` : '—'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={item.status as 'active' | 'archived'}>
                                            {item.status === 'active' ? 'Active' : 'Archived'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => {
                                                const url = route('asset-summary.show', item.id);
                                                navigator.clipboard.writeText(url).then(() => {
                                                    toast.success('Link copied!', {
                                                        description: 'The viewing link has been copied to your clipboard.',
                                                    });
                                                });
                                            }}
                                            className="cursor-pointer text-sm text-blue-600 underline hover:text-blue-800"
                                        >
                                            Get Viewing Link
                                        </button>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedAsset(item);
                                                setEditModalVisible(true);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedAsset(item);
                                                setDeleteModalVisible(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedAsset(item); // ✅ set the current asset
                                                setChooseViewVisible(true); // ✅ open ChooseViewModal
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

            {chooseViewVisible && selectedAsset && (
                <ChooseViewModal
                    open={chooseViewVisible}
                    onClose={() => {
                        setChooseViewVisible(false);
                        setSelectedAsset(null);
                    }}
                    asset={selectedAsset}
                    onViewAsset={() => {
                        setChooseViewVisible(false);
                        if (selectedAsset) {
                            openView(selectedAsset.id); // ✅ deep link route
                        }
                    }}
onViewMemo={() => {
  setChooseViewVisible(false);

  if (selectedAsset) {
    const sameMemoAssets = assets.filter(a => a.memorandum_no === selectedAsset.memorandum_no);
    setReceiptAssets(sameMemoAssets);
    setReceiptMemoNo(selectedAsset.memorandum_no);
    setReceiptModalVisible(true);
  }
}}
                />
            )}

            {isViewOpen && viewing_asset && <ViewAssetModal asset={viewing_asset} onClose={closeView} />}

{receiptModalVisible && receiptAssets.length > 0 && (
  <ViewMemorandumReceiptModal
    open={receiptModalVisible}
    onClose={() => {
      setReceiptModalVisible(false);
      setReceiptAssets([]);
      setReceiptMemoNo('');
    }}
    assets={receiptAssets}        // ✅ now an array
    memo_no={receiptMemoNo}       // ✅ shared memo number
  />
)}


            {/* ✅ Choose Add Modal */}
            {chooseAddVisible && (
                <ChooseAddTypeModal
                    open={chooseAddVisible}
                    onClose={() => setChooseAddVisible(false)}
                    onSingle={() => {
                        setChooseAddVisible(false);
                        setShowAddAsset(true); // ✅ open single modal
                    }}
                    onBulk={() => {
                        setChooseAddVisible(false);
                        setShowAddBulkAsset(true); // ✅ open bulk modal
                    }}
                />
            )}

            {/* ✅ Bulk Add Modal */}
            {showAddBulkAsset && (
                <AddBulkAssetModalForm
                    open={showAddBulkAsset}
                    onClose={() => setShowAddBulkAsset(false)}
                    buildings={buildings}
                    unitOrDepartments={unitOrDepartments}
                    buildingRooms={buildingRooms}
                    categories={categories}
                    assetModels={assetModels}
                />
            )}

            {/* Side Panel Modal with Slide Effect */}
            <div className={`fixed inset-0 z-50 flex transition-all duration-300 ease-in-out ${showAddAsset ? 'visible' : 'invisible'}`}>
                <div
                    className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${showAddAsset ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setShowAddAsset(false)}
                ></div>

                {/* Slide-In Panel */}
                <div
                    className={`relative ml-auto w-full max-w-3xl transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900 ${
                        showAddAsset ? 'translate-x-0' : 'translate-x-full'
                    }`}
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between p-6">
                        <h2 className="text-xl font-semibold">Add New Asset</h2>
                        <button onClick={() => setShowAddAsset(false)} className="cursor-pointer text-2xl font-medium">
                            &times;
                        </button>
                    </div>

                    {/* Scrollable Form Section */}
                    {/* <div className="auto overflow-y-auto px-6" style={{ flex: 1 }}> */}
                    <div className="auto overflow-y-auto px-6" style={{ flex: 1 }}>
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
                                            {unit.name} ({unit.code} )
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
                                <PickerInput type="date" value={data.date_purchased} onChange={(v) => setData('date_purchased', v)} />
                                {errors.date_purchased && <p className="mt-1 text-xs text-red-500">{errors.date_purchased}</p>}
                            </div>
                            <div className="col-span-1 pt-0.5">
  <label className="mb-1 block font-medium">Maintenance Due Date</label>
  <PickerInput
    type="date"
    value={data.maintenance_due_date}
    onChange={(v) => setData('maintenance_due_date', v)}
  />
  {errors.maintenance_due_date && (
    <p className="mt-1 text-xs text-red-500">{errors.maintenance_due_date}</p>
  )}
</div>

                            <div className="col-span-1 pt-0.5">
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
                                {/* {errors.asset_type && <p className="mt-1 text-xs text-red-500">{errors.asset_type}</p>} */}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Asset Category</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.category_id ?? ''} // <-- FK
                                    onChange={(e) => setData('category_id', e.target.value === '' ? '' : Number(e.target.value))}
                                >
                                    <option value="">Select Asset Category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {' '}
                                            {/* <-- send id */}
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
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

                        {/* <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Quantity</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Quantity"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                />
                                {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
                            </div> */}

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
                                    <option value="transferred"> Transferred </option>
                                    <option value="not_transferred"> Not Transferred </option>
                                </select>
                                {errors.transfer_status && <p className="mt-1 text-xs text-red-500">{errors.transfer_status}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Total Cost</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    value={data.unit_cost ? `₱ ${(Number(data.unit_cost) * Number(data.quantity || 1)).toFixed(2)}` : ''}
                                    readOnly
                                    disabled
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1 block font-medium">Asset Image</label>

                                {/* Styled file input */}
                                <input
                                    ref={fileInputRef} // ✅ attach ref
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setData('image', e.target.files[0]); // ✅ store the File object
                                        }
                                    }}
                                    className="block w-full cursor-pointer rounded-lg border p-2 text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-200"
                                />

                                {/* Preview + Remove */}
                                {data.image && (
                                    <div className="mt-3 flex items-center gap-3 rounded-lg border bg-gray-50 p-2 shadow-sm">
                                        <img
                                            src={URL.createObjectURL(data.image as File)}
                                            alt="Preview"
                                            className="h-20 w-20 rounded-md border object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <span className="max-w-[140px] truncate text-sm font-medium text-gray-700">
                                                {(data.image as File).name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData('image', null); // clear from form state
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = ''; // ✅ clear filename from input
                                                    }
                                                }}
                                                className="mt-1 w-fit rounded bg-red-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
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
