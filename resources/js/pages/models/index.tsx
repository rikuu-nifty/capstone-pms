import { useEffect, useMemo, useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import SortDropdown, { type SortDir } from '@/components/filters/SortDropdown';
import Pagination, { PageInfo } from '@/components/Pagination';
import AssetModelFilterDropdown from '@/components/filters/AssetModelFilterDropdown';

import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';

import type { BreadcrumbItem } from '@/types';
import { formatNumber } from '@/types/custom-index';
import type { AssetModelsPageProps, AssetModelWithCounts, AssetModelFilters, StatusOption } from '@/types/asset-model';
import useDebouncedValue from '@/hooks/useDebouncedValue';

import AddAssetModelModal from './AddAssetModel';
import EditAssetModelModal from './EditAssetModel';
import ViewAssetModelModal from './ViewAssetModel';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';

const breadcrumbs: BreadcrumbItem[] = [
  { 
    title: 'Asset Models', 
    href: '/models' 
    },
];

const sortOptions = [
    { value: 'id', label: 'ID' },
    { value: 'brand', label: 'Brand' },
    { value: 'model', label: 'Model' },
    { value: 'category', label: 'Category' },
    { value: 'assets_count', label: 'Total Assets' },
    { value: 'active_assets_count', label: 'Active Assets' },
] as const;

type SortKey = (typeof sortOptions)[number]['value'];

type PageProps = AssetModelsPageProps;

export default function AssetModelsIndex({
    asset_models = [],
    categories = [],
    totals,
}: AssetModelsPageProps) {
    const { props } = usePage<PageProps>();
    const viewing = props.viewing;

    const totalAssets = totals?.assets ?? 0;
    const activeAssets = totals?.active_assets ?? 0;
    const inactiveAssets = Math.max(totalAssets - activeAssets, 0);
    const activeRate = totalAssets > 0 ? (activeAssets / totalAssets) * 100 : 0;

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200).trim().toLowerCase();

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
    const [selected_status, setSelected_status] = useState<StatusOption>('');

    const [showAddModel, setShowAddModel] = useState(false);
    const [showEditModel, setShowEditModel] = useState(false);
    const [selectedModel, setSelectedModel] = useState<AssetModelWithCounts | null>(null);
    const [showDeleteAssetModel, setShowDeleteAssetModel] = useState(false);
    const [assetModelToDelete, setAssetModelToDelete] = useState<AssetModelWithCounts | null>(null);
    
    const clearFilters = () => {
        setSelectedCategoryId('');
        setSelected_status('');
    };

    const applyFilters = (f: AssetModelFilters) => {
        setSelectedCategoryId(f.category_id);
        setSelected_status(f.status);
    };

    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => { setPage(1); }, [search, selectedCategoryId, selected_status, sortKey, sortDir]);

    const filtered = useMemo(() => {
        return asset_models.filter((m) => {
        const haystack = `${m.id} ${m.brand ?? ''} ${m.model ?? ''} ${m.category?.name ?? ''}`.toLowerCase();
        const matchesSearch = !search || haystack.includes(search);

        const matchesCategory = !selectedCategoryId || Number(m.category_id) === Number(selectedCategoryId);
        const matchesStatus = !selected_status || (m.status === selected_status);

        return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [asset_models, search, selectedCategoryId, selected_status]);

    const textKey = (m: AssetModelWithCounts, k: SortKey) =>
        k === 'brand' ? (m.brand ?? '') :
        k === 'model' ? (m.model ?? '') :
        k === 'category' ? (m.category?.name ?? '') :
        '';

    const numberKey = (m: AssetModelWithCounts, k: SortKey) =>
        k === 'id' ? Number(m.id) || 0 :
        k === 'assets_count' ? Number(m.assets_count) || 0 :
        k === 'active_assets_count' ? Number(m.active_assets_count) || 0 :
        0;

    const sorted = useMemo(() => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => {
        if (sortKey === 'brand' || sortKey === 'model' || sortKey === 'category') {
            const d = textKey(a, sortKey).localeCompare(textKey(b, sortKey));
            return (d !== 0 ? d : (Number(a.id) - Number(b.id))) * dir;
        }
        const d = numberKey(a, sortKey) - numberKey(b, sortKey);
        return (d !== 0 ? d : (Number(a.id) - Number(b.id))) * dir;
        });
    }, [filtered, sortKey, sortDir]);

    const start = (page - 1) * PAGE_SIZE;
    const page_items = sorted.slice(start, start + PAGE_SIZE);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Asset Models" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Asset Models</h1>
                        <p className="text-sm text-muted-foreground">
                        List of asset models with category, brand, and asset counts.
                        </p>

                        <div className="flex items-center gap-2 w-96">
                            <Input
                                type="text"
                                placeholder="Search by id, brand, model, or category..."
                                value={rawSearch}
                                onChange={(e) => 
                                    setRawSearch(e.target.value)
                                }
                                className="max-w-xs"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            {selectedCategoryId !== '' && (
                                <Badge variant="darkOutline">
                                    Category: {categories.find(c => c.id === selectedCategoryId)?.name ?? selectedCategoryId}
                                </Badge>
                            )}
                            {selected_status && (
                                <Badge variant="darkOutline">
                                    Status: {selected_status === 'active' ? 'Active' : 'Archived'}
                                </Badge>
                            )}

                            {(selectedCategoryId !== '' || selected_status) && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={clearFilters}
                                    className="cursor-pointer"
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <SortDropdown<SortKey>
                            sortKey={sortKey}
                            sortDir={sortDir}
                            options={sortOptions}
                            onChange={
                                (key, dir) => { 
                                    setSortKey(key); 
                                    setSortDir(dir); 
                                }
                            }
                        />

                        <AssetModelFilterDropdown
                            onApply={applyFilters}
                            onClear={clearFilters}
                            selected_category_id={selectedCategoryId}
                            selected_status={selected_status}
                            categories={categories}
                        />

                        <Button
                            onClick={() => {
                                setShowAddModel(true);
                            }}
                            className="cursor-pointer"
                        >
                            <PlusCircle className="mr-1 h-4 w-4" /> Add New Model
                        </Button>
                    </div>
                </div>

                {totals && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border p-4">
                        <div className="text-sm text-muted-foreground">Total Models</div>
                        <div className="mt-1 text-2xl font-semibold">
                            {formatNumber(totals.asset_models)}
                        </div>
                        </div>

                        <div className="rounded-2xl border p-4">
                        <div className="text-sm text-muted-foreground">Distinct Brands</div>
                        <div className="mt-1 text-2xl font-semibold">
                            {formatNumber(totals.distinct_brands)}
                        </div>
                        </div>

                        <div className="rounded-2xl border p-4">
                        <div className="text-sm text-muted-foreground">Total Assets (All Models)</div>
                        <div className="mt-1 text-2xl font-semibold">
                            {formatNumber(totalAssets)}
                        </div>
                        </div>

                        <div className="rounded-2xl border p-4">
                        <div className="text-sm text-muted-foreground">Active Assets</div>
                        <div className="mt-1 text-2xl font-semibold">
                            {formatNumber(activeAssets)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                            {formatNumber(inactiveAssets)} inactive • {activeRate.toFixed(1)}% active
                        </div>
                        </div>
                    </div>
                )}

                {/* MODELS Table */}
                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                        <TableRow className="bg-muted text-foreground">
                            <TableHead className="text-center">ID</TableHead>
                            <TableHead className="text-center">Brand</TableHead>
                            <TableHead className="text-center">Model / Specification</TableHead>
                            <TableHead className="text-center">Category</TableHead>
                            <TableHead className="text-center">Active Assets</TableHead>
                            <TableHead className="text-center">Total Assets</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                        </TableHeader>

                        <TableBody className="text-center">
                            {page_items.length > 0 ? page_items.map((m) => (
                            <TableRow key={m.id}>
                                <TableCell>{m.id}</TableCell>
                                <TableCell>{m.brand ?? '—'}</TableCell>
                                <TableCell>{m.model ?? '—'}</TableCell>
                                <TableCell className="font-medium">{m.category?.name ?? '—'}</TableCell>
                                <TableCell>{m.active_assets_count}</TableCell>
                                <TableCell>{m.assets_count}</TableCell>
                                <TableCell className="h-full">
                                    <div className="flex justify-center items-center gap-2 h-full">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="cursor-pointer" 
                                            onClick={() => {
                                                setSelectedModel(m);
                                                setShowEditModel(true);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="cursor-pointer" 
                                            onClick={() => {
                                                setAssetModelToDelete(m);
                                                setShowDeleteAssetModel(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            asChild 
                                            className="cursor-pointer"
                                        >
                                            <Link 
                                                href={`/models/view/${m.id}`} 
                                                preserveScroll
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                                    No asset models found.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between">
                    <PageInfo page={page} total={sorted.length} pageSize={PAGE_SIZE} label="asset models" />
                    <Pagination page={page} total={sorted.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
                </div>
            </div>

            <AddAssetModelModal
                show={showAddModel}
                onClose={() => 
                    setShowAddModel(false)
                }
                categories={categories}
            />

            {selectedModel && (
                <EditAssetModelModal
                    key={selectedModel.id}
                    show={showEditModel}
                    onClose={() => {
                        setShowEditModel(false)
                        setSelectedModel(null)
                    }}
                    model={selectedModel}
                    categories={categories}
                />
            )}

            {viewing && (
                <ViewAssetModelModal
                    open={!!viewing}
                    model={viewing}
                    onClose={() => router.visit(route('asset-models.index'), {
                            preserveScroll: true,
                            preserveState: true,
                        })
                    }
                />
            )}

            <DeleteConfirmationModal
                show={showDeleteAssetModel}
                onCancel={() => {
                    setShowDeleteAssetModel(false);
                    setAssetModelToDelete(null);
                }}
                onConfirm={() => {
                    if (assetModelToDelete) {
                        router.delete(`/models/${assetModelToDelete.id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setShowDeleteAssetModel(false);
                                setAssetModelToDelete(null);
                            },
                        });
                    }
                }}
            />
        </AppLayout>
    );
}
