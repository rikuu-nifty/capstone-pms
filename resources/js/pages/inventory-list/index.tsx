import { DeleteAssetModal } from '@/components/delete-modal-form';
import Pagination, { PageInfo } from '@/components/Pagination';
import { PickerInput } from '@/components/picker-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { EditAssetModalForm } from '@/pages/inventory-list/edit-asset-modal-form';
import { ViewAssetModal } from '@/pages/inventory-list/view-modal-form';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Banknote, Boxes, Eye, Pencil, PlusCircle, Trash2, FolderArchive, Pin, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AddBulkAssetModalForm } from './addBulkAssetModal';
import { ChooseAddTypeModal } from './chooseAddTypeModal';
import { ChooseViewModal } from './chooseViewModal';
import { ViewMemorandumReceiptModal } from './ViewMemorandumReceipt';
// import { WebcamCaptureModal } from './WebcamCaptureModal';
import { WebcamCapture } from './WebcamCapture';
import AssetFilterDropdown from '@/components/filters/AssetFilterDropdown';
import { UnitOrDepartment, SubArea } from '@/types/custom-index';
import { ucwords } from '@/types/custom-index';

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

    building?: Building;
};

export type Transfer = {
    id: number;
    status: 'pending_review' | 'upcoming' | 'in_progress' | 'overdue' | 'completed' | 'cancelled';
};

export type Asset = {
    id: number;
    memorandum_no: number | string;
    asset_model: AssetModel | null;
    asset_name: string;
    asset_type: string;
    description: string;
    status: 'active' | 'archived';
    unit_or_department_id?: number | null;
    category_id: number;
    category?: Category | null;
    unit_or_department: UnitOrDepartment | null;
    building: Building | null;

    building_room_id?: number | null;
    sub_area_id?: number | null;
    
    building_room?: BuildingRoom | null;

    room_building?: Building | null;

    serial_no: string;
    supplier: string;
    unit_cost: number | string;
    depreciation_value?: number | string | null; // ✅ NEW
    date_purchased: string;
    quantity: number;
    assigned_to?: string | null; // ✅ add this

    // ✅ Changed: transfer relation instead of transfer_status
    transfer?: Transfer | null;

    brand: string;
    image_path?: string | null; // ✅ new field
    maintenance_due_date: string; // ✅ new field
    sub_area?: SubArea | null;

    current_transfer_status?: string | null;
    current_inventory_status?: string | null;
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
    depreciation_value: number | string; // ✅ add this
    assigned_to?: string | null;
    date_purchased: string;
    asset_type: string;
    category_id: number | '';
    quantity: number | string; // can be number or string
    brand: string;
    // transfer_status: string;  ❌ Removed: transfer_status
    image?: File | null; // ✅ add this
    maintenance_due_date: string; // ✅ new field

    sub_area_id: number | string | null;
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

    subAreas = [],
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

    subAreas: SubArea[];
}) {
    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm<AssetFormData>({
        building_id: '',
        unit_or_department_id: '',
        building_room_id: '',
        sub_area_id: '',
        date_purchased: '',
        maintenance_due_date: '', // ✅ new default
        category_id: '',
        asset_type: '',
        asset_name: '',
        brand: '',
        quantity: 1,
        supplier: '',
        unit_cost: '',
        depreciation_value: '',

        serial_no: '',
        asset_model_id: '',
        // transfer_status: string;  ❌ Removed: transfer_status
        description: '',
        memorandum_no: '',
        status: '',
    });

    const { auth } = usePage().props as unknown as {
        auth: { 
            permissions: string[]; 
            role: string;
            unit_or_department_id: number | null;
            unit_or_department?: { 
                id: number; 
                name: string; 
                code: string 
            };
        };
    };

    const canViewAll = auth.permissions.includes('view-inventory-list');
    const canViewOwn = auth.permissions.includes('view-own-unit-inventory-list');
    const canCreate = auth.permissions.includes('create-inventory-list');

    const [search, setSearch] = useState('');
    const [showAddAsset, setShowAddAsset] = useState(false);

    // Filter for Rooms
    const filteredRooms = buildingRooms.filter((room) => room.building_id === Number(data.building_id));

    // Filter for Brand
    const uniqueBrands = Array.from(new Set(assetModels.map((model) => model.brand)));
    const filteredModels = assetModels.filter((model) => model.brand === data.brand);

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
    const [selectedUnitId, setSelectedUnitId] = useState<number | ''>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    useEffect(() => {
        if (canViewOwn && !canViewAll && auth.unit_or_department_id) {
            setSelectedUnitId(auth.unit_or_department_id);
        }
    }, [canViewOwn, canViewAll, auth.unit_or_department_id]);


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

    // Webcam
    const [showWebcam, setShowWebcam] = useState(false);

    // ✅ Placeholder formula: Straight-line depreciation // 20% per year.
    const calculateDepreciation = (unitCost: number, usefulLife = 5, salvageValue = 0): string => {
        if (!unitCost || unitCost <= 0) return '0.00';
        return ((unitCost - salvageValue) / usefulLife).toFixed(2);
    };

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
            sub_area_id: d.sub_area_id === '' ? null : Number(d.sub_area_id),
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

        const matchesSearch =
            item.asset_name?.toLowerCase().includes(keyword) ||
            item.supplier?.toLowerCase().includes(keyword) ||
            item.asset_type?.toLowerCase().includes(keyword) ||
            item.transfer?.status?.toLowerCase().includes(keyword) || // ✅ Now searches transfer relation
            String(item.quantity).padStart(2, '0').includes(keyword) ||
            String(item.date_purchased).toLowerCase().includes(keyword) ||
            item.quantity?.toString().includes(keyword) ||
            item.building?.name?.toLowerCase().includes(keyword) ||
            item.unit_or_department?.name?.toLowerCase().includes(keyword) ||
            item.status?.toLowerCase().includes(keyword);

        // ✅ then add your filter checks
        const matchesCategory =
            selectedCategoryId === '' || item.category_id === selectedCategoryId;
        const matchesUnit =
            selectedUnitId === '' || item.unit_or_department?.id === selectedUnitId;
        const matchesStatus =
            selectedStatus === '' || item.status === selectedStatus;

        // ✅ final return
        return matchesSearch && matchesCategory && matchesUnit && matchesStatus;
    });

    const [page, setPage] = useState(1);
    const pageSize = 10;

    const total = filteredData.length;
    const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        setPage(1);
    }, [search]);

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
                        <div className="flex items-center gap-3 rounded-2xl border p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                                <Boxes className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Assets</div>
                                <div className="text-2xl font-semibold">{formatNumber(kpis.total_assets)}</div>
                            </div>
                        </div>

                        {/* Active vs Archived */}
                        <div className="flex items-center gap-3 rounded-2xl border p-4">
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
                        <div className="flex items-center gap-3 rounded-2xl border p-4">
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
                        <div className="flex items-center gap-3 rounded-2xl border p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                                <Banknote className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Inventory Value</div>
                                <div className="text-2xl font-semibold">{formatPeso(kpis.total_inventory_sum)}</div>
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

                        {/* Active filter chips */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            {selectedStatus && (
                                <Badge variant="darkOutline" className="flex items-center gap-1">
                                Status: {selectedStatus === 'active' ? 'Active' : 'Archived'}
                                <button onClick={() => setSelectedStatus('')} className="ml-1 hover:text-red-600">
                                    <X className="h-4 w-4" />
                                </button>
                                </Badge>
                            )}

                            {selectedCategoryId && (
                                <Badge variant="darkOutline" className="flex items-center gap-1">
                                Category: {categories.find(c => c.id === selectedCategoryId)?.name ?? selectedCategoryId}
                                <button onClick={() => setSelectedCategoryId('')} className="ml-1 hover:text-red-600">
                                    <X className="h-4 w-4" />
                                </button>
                                </Badge>
                            )}

                            {/* 🔹 Unit chip */}
                            {selectedUnitId && (
                                <Badge variant="darkOutline" className="flex items-center gap-1">
                                Unit/Dept:{" "}
                                {canViewOwn && auth.unit_or_department
                                    ? `${auth.unit_or_department.name} (${auth.unit_or_department.code})`
                                    : unitOrDepartments.find(u => u.id === selectedUnitId)?.name ?? selectedUnitId}

                                {canViewAll && (
                                    <button onClick={() => setSelectedUnitId('')} className="ml-1 hover:text-red-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                                </Badge>
                            )}

                            {(selectedStatus || selectedCategoryId || (selectedUnitId && canViewAll)) && (
                                <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    setSelectedStatus('');
                                    setSelectedCategoryId('');
                                    if (canViewAll) setSelectedUnitId('');
                                }}
                                className="cursor-pointer"
                                >
                                Clear filters
                                </Button>
                            )}
                        </div>

                    </div>

                    <div className="flex gap-2">
                        <AssetFilterDropdown
                            categories={categories}
                            units={unitOrDepartments}
                            selectedCategoryId={selectedCategoryId}
                            selectedUnitId={selectedUnitId}
                            selectedStatus={selectedStatus}
                            canViewAll={canViewAll}
                            onApply={({ categoryId, unitId, status }) => {
                                setSelectedCategoryId(categoryId);
                                setSelectedUnitId(unitId);
                                setSelectedStatus(status);
                            }}
                            onClear={() => {
                                setSelectedCategoryId('');
                                setSelectedUnitId('');
                                setSelectedStatus('');
                            }}
                        />
                        {canCreate && ( // only show if user has create permission
                            <Button
                            onClick={() => {
                                reset();
                                clearErrors();
                                setChooseAddVisible(true);
                            }}
                            className="cursor-pointer"
                            >
                            <PlusCircle className="mr-1 h-4 w-4" /> Add Asset
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Asset Name</TableHead>
                                <TableHead className="text-center">Asset Image</TableHead>
                                <TableHead className="text-center">Brand</TableHead>
                                <TableHead className="text-center">Date Purchased</TableHead>
                                <TableHead className="text-center">Asset Type</TableHead>
                                {/* <TableHead className="text-center">Quantity</TableHead> */}
                                <TableHead className="text-center">Location</TableHead>
                                <TableHead className="text-center">Unit/Department</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">NFC Link</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="text-center">
                            {paginatedData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{ucwords(item.asset_name)}</TableCell>
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
                                    <TableCell>{ucwords(item.asset_model?.brand ?? '—')}</TableCell>
                                    <TableCell>{formatDate(item.date_purchased)}</TableCell>
                                    <TableCell>
                                        {item.asset_type === 'fixed' ? 'Fixed' : item.asset_type === 'not_fixed' ? 'Not Fixed' : '—'}
                                    </TableCell>
                                    <TableCell>
                                        {item.room_building && item.building_room ? (
                                            <>
                                            {item.room_building.name} ({item.building_room.room})
                                            {/* {item.sub_area?.name ? ` – ${item.sub_area.name}` : ''} */}
                                            </>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell>{item.unit_or_department?.code ? String(item.unit_or_department.code).toUpperCase() : '—'}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={item.status as 'active' | 'archived'}>
                                            {item.status === 'active' ? 'Active' : 'Archived'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => {
                                                const url = route('inventory-list.view', item.id);
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
                                    {/* <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                onClick={() => {
                                                const url = route('asset-summary.show', item.id);
                                                window.open(url, '_blank');
                                                }}
                                                    className="cursor-pointer"
                                                    // size="sm"
                                            >
                                                View
                                            </Button>
                                            
                                            <Button
                                                onClick={() => {
                                                const url = route('asset-summary.show', item.id);
                                                    navigator.clipboard.writeText(url).then(() => {
                                                        toast.success('Link copied!', {
                                                        description: 'The viewing link has been copied to your clipboard.',
                                                        });
                                                    });
                                                }}
                                                className="cursor-pointer"
                                                variant="primary"
                                                // size="sm"
                                            >
                                                Copy
                                            </Button>
                                        </div>
                                    </TableCell> */}

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
                    <div className="flex items-center justify-between p-3">
                        <PageInfo page={page} total={total} pageSize={pageSize} />
                        <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
                    </div>
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
                    subAreas={subAreas}
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
                            const sameMemoAssets = assets.filter((a) => a.memorandum_no === selectedAsset.memorandum_no);
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
                    assets={receiptAssets} // ✅ now an array
                    memo_no={receiptMemoNo} // ✅ shared memo number
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
                    subAreas={subAreas}
                />
            )}

            {/* Webcam modal
            <WebcamCaptureModal
            open={webcamOpen}
            onClose={() => setWebcamOpen(false)}
            onCapture={(file) => setData("image", file)}
            /> */}

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
                                <label className="mb-1 block font-medium">Sub Area</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.sub_area_id ?? ''}
                                    onChange={(e) =>
                                        setData('sub_area_id', e.target.value === '' ? null : Number(e.target.value))
                                    }
                                    disabled={!data.building_room_id}
                                >
                                    <option value="">Select Sub Area</option>
                                    {subAreas
                                    .filter((s: SubArea) => s.building_room_id === Number(data.building_room_id)) // ✅ typed
                                    .map((s: SubArea) => ( // ✅ typed
                                        <option key={s.id} value={s.id}>
                                        {s.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.sub_area_id && (
                                    <p className="mt-1 text-xs text-red-500">{errors.sub_area_id}</p>
                                )}
                            </div>

                            {/* <div className="col-span-1">
                                <label className="mb-1 block font-medium">Status</label>
                                <select
                                    className={`w-full rounded-lg border p-2 ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as 'active' | 'archived')}
                                >
                                    <option value="">Select Status</option>
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>

                                {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
                            </div> */}

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

                                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1 block font-medium">Assigned To</label>
                                <input
                                    type="text"
                                    placeholder="Enter person assigned"
                                    className="w-full rounded-lg border p-2"
                                    value={data.assigned_to ?? ''} // ✅ converts null/undefined → ""
                                    onChange={(e) => setData('assigned_to', e.target.value)}
                                />
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
                                {errors.asset_type && <p className="mt-1 text-xs text-red-500">{errors.asset_type}</p>}
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

                            {/* Unit Cost */}
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Unit Cost</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border p-2"
                                    value={data.unit_cost}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setData('unit_cost', value);

                                        // ✅ Auto-calc depreciation (5-year straight-line)
                                        const depreciation = calculateDepreciation(Number(value));
                                        setData('depreciation_value', depreciation);
                                    }}
                                />
                                {errors.unit_cost && <p className="mt-1 text-xs text-red-500">{errors.unit_cost}</p>}
                            </div>

                            {/* Depreciation Value */}
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Depreciation Value (per year)</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2 text-black"
                                    value={data.depreciation_value ? `₱ ${data.depreciation_value}` : ''}
                                    readOnly
                                />
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

                            {/* <div className="col-span-1 pt-0.5">
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
                            </div> */}

                            <div className="col-span-2">
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

                                {showWebcam ? (
                                    <WebcamCapture
                                        onCapture={(file) => {
                                            setData('image', file); // save new captured photo
                                            setShowWebcam(false); // close webcam after capture
                                        }}
                                        onCancel={() => setShowWebcam(false)}
                                    />
                                ) : (
                                    <>
                                        <div className="flex gap-2">
                                            {/* File Upload */}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        setData('image', e.target.files[0]);
                                                    }
                                                }}
                                                className="block w-full cursor-pointer rounded-lg border p-2 text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-200"
                                            />

                                            {/* Open Camera */}
                                            <Button type="button" onClick={() => setShowWebcam(true)}>
                                                Use Camera
                                            </Button>
                                        </div>

                                        {/* Preview */}
                                        {data.image && (
                                            <div className="mt-3 flex items-center gap-3 rounded-lg border bg-gray-50 p-2 shadow-sm">
                                                <img
                                                    src={URL.createObjectURL(data.image as File)}
                                                    alt="Preview"
                                                    className="h-20 w-20 rounded-md border object-cover"
                                                />
                                                <div className="flex flex-col gap-1">
                                                    <span className="max-w-[140px] truncate text-sm font-medium text-gray-700">
                                                        {(data.image as File).name}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        {/* Remove photo */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setData('image', null);
                                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                                            }}
                                                            className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-600"
                                                        >
                                                            Remove
                                                        </button>

                                                        {/* Retake photo → clears old one first */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setData('image', null); // clear current photo
                                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                                                setShowWebcam(true); // reopen webcam
                                                            }}
                                                            className="rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-600"
                                                        >
                                                            Retake
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
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
