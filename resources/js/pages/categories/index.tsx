import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useMemo, useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

import SortDropdown, { type SortDir } from '@/components/filters/SortDropdown';
import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import useDebouncedValue from '@/hooks/useDebouncedValue';

import type { CategoriesPageProps, CategoryWithModels, CategoryFilters,} from '@/types/category';
import { formatStatusLabel } from '@/types/custom-index';

import AddCategoryModal from './AddCategory';
import EditCategoryModal from './EditCategory';
import ViewCategoryModal from './ViewCategory';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import CategoryFilterDropdown from '@/components/filters/CategoryFilterDropdown';

const breadcrumbs: BreadcrumbItem[] = [
    { 
        title: 'Categories', 
        href: '/categories' 
    },
];

const categorySortOptions = [
    { value: 'id', label: 'ID' },
    { value: 'name', label: 'Name' },
    { value: 'models_count', label: 'Total Models' },
    { value: 'assets_count', label: 'Total Assets' },
    { value: 'brands_count', label: 'Total Brands' },
] as const;

type CategorySortKey = (typeof categorySortOptions)[number]['value'];
type ModelSortKey = 'brand' | 'model' | 'assets_count' | 'status' | 'id';

export type AssetModelRow = {
  id: number;
  brand: string | null;
  model: string | null;
  status: string | null;          // or narrow if you have an enum/union
  category_id: number;
  category_name: string | null;
  assets_count: number;
};

type PageProps = CategoriesPageProps & {
    viewing?: CategoryWithModels;
};

export default function CategoriesIndex({ 
    categories = [], 
    // totals 
}: CategoriesPageProps) {

    const { props } = usePage<PageProps>();
    const viewing = props.viewing;

    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showEditCategory, setShowEditCategory] = useState(false);
    const [showViewCategory, setShowViewCategory] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryWithModels | null>(null);

    const openViewCategory = (cat: CategoryWithModels) => {
        setSelectedCategory(cat);
        setShowViewCategory(true);
    };

    const closeViewCategory = () => {
        setShowViewCategory(false);
        setSelectedCategory(null);

        if (/^\/?categories\/view\/\d+\/?$/.test(window.location.pathname)) {
            history.back();
        }
    };

    useEffect(() => {
        if (!viewing) return;
        openViewCategory(viewing);
    }, [
        viewing
    ]);

    // Delete confirm state
    const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithModels | null>(null);

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200).trim().toLowerCase();

    const [selected_status, setSelected_status] = useState('');

    const clearFilters = () => {
        setSelected_status('');
    };

    const applyFilters = (f: CategoryFilters) => {
        setSelected_status(f.status);
    };

    const [sortKey, setSortKey] = useState<CategorySortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    // Pagination
    const [page, setPage] = useState(1);
    const page_size = 20;

    useEffect(() => { 
        setPage(1); 
    }, [
        search,
        selected_status,
        sortKey,
        sortDir,
    ]);

    const filtered = useMemo(() => {

        return categories.filter((c) => {
            const haystack = `${c.id} ${c.name ?? ''} ${c.description ?? ''}`.toLowerCase();
            const matchesSearch = !search || haystack.includes(search);

            const models = c.asset_models ?? [];

            // Status filter: category passes if ANY model has that status
            const matchesStatus =
                !selected_status ||
                models.some((m) => m.status === selected_status);

            return matchesSearch && matchesStatus;
        });
    }, [
        categories,
        search,
        selected_status,
    ]);

  // Sorting helpers
    const numberKey = (c: CategoryWithModels, k: CategorySortKey) =>
        k === 'id' ? Number(c.id) || 0
        : k === 'models_count' ? Number(c.models_count) || 0
        : k === 'assets_count' ? Number(c.assets_count) || 0
        : k === 'brands_count' ? Number(c.brands_count) || 0
        : 0;

    const sorted = useMemo(() => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => {
            if (sortKey === 'name') {
                const d = (a.name ?? '').localeCompare(b.name ?? '');
                return (d !== 0 ? d : (Number(a.id) - Number(b.id))) * dir;
            }
            const d = numberKey(a, sortKey) - numberKey(b, sortKey);
            return (d !== 0 ? d : (Number(a.id) - Number(b.id))) * dir;
        });
    }, [
        filtered, 
        sortKey, 
        sortDir
    ]);

    const start = (page - 1) * page_size;
    const page_items = sorted.slice(start, start + page_size);

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [modelSearchRaw, setModelSearchRaw] = useState('');
    const modelSearch = useDebouncedValue(modelSearchRaw, 200).trim().toLowerCase();
    const [modelStatus, setModelStatus] = useState<string>(''); // '', 'active', 'is_archived', etc.
    const [modelSortKey, setModelSortKey] = useState<ModelSortKey>('brand');
    const [modelSortDir, setModelSortDir] = useState<SortDir>('asc');
    const [modelPage, setModelPage] = useState(1);
    const MODEL_PAGE_SIZE = 20;

    // Flatten all models so the right table can render independently
    const allModels: AssetModelRow[] = useMemo(() => {
    return (categories ?? []).flatMap((c) => {
        const list = (c.asset_models ?? []);
        return list.map((m) => ({
        id: Number(m.id),
        brand: m.brand ?? null,
        model: m.model ?? null,
        status: m.status ?? null,
        category_id: Number(c.id),
        category_name: c.name ?? null,
        assets_count: Number(m.assets_count ?? 0),
        }));
    });
    }, [categories]);

    // Reset model page when filters/sort change
    useEffect(() => {
        setModelPage(1);
    }, [modelSearch, modelStatus, modelSortKey, modelSortDir, selectedCategoryId]);

    const clearCategoryFilter = () => setSelectedCategoryId(null);

    const filteredModels = useMemo(() => {
    return allModels.filter((m) => {
        if (selectedCategoryId && m.category_id !== selectedCategoryId) return false;
        if (modelStatus && (m.status ?? '') !== modelStatus) return false;
        if (!modelSearch) return true;

        const hay = `${m.id} ${m.brand ?? ''} ${m.model ?? ''} ${m.category_name ?? ''}`.toLowerCase();
        return hay.includes(modelSearch);
    });
    }, [allModels, selectedCategoryId, modelStatus, modelSearch]);

    const sortedModels = useMemo(() => {
    const dir = modelSortDir === 'asc' ? 1 : -1;
    return [...filteredModels].sort((a, b) => {
        const safe = (v: unknown) => (v ?? '') as string;

        if (modelSortKey === 'assets_count') {
        const d = (Number(a.assets_count) || 0) - (Number(b.assets_count) || 0);
        return (d !== 0 ? d : (a.id - b.id)) * dir;
        }
        if (modelSortKey === 'id') {
        const d = a.id - b.id;
        return d * dir;
        }
        if (modelSortKey === 'status') {
        const d = safe(a.status).localeCompare(safe(b.status));
        return (d !== 0 ? d : (a.id - b.id)) * dir;
        }
        if (modelSortKey === 'brand') {
        const d = safe(a.brand).localeCompare(safe(b.brand));
        return (d !== 0 ? d : safe(a.model).localeCompare(safe(b.model))) * dir;
        }
        // 'model'
        const d = safe(a.model).localeCompare(safe(b.model));
        return (d !== 0 ? d : safe(a.brand).localeCompare(safe(b.brand))) * dir;
    });
    }, [filteredModels, modelSortKey, modelSortDir]);

    const modelStart = (modelPage - 1) * MODEL_PAGE_SIZE;
    const modelPageItems = sortedModels.slice(modelStart, modelStart + MODEL_PAGE_SIZE);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Categories</h1>
                        <p className="text-sm text-muted-foreground">List of asset categories.</p>

                        <div className="flex items-center gap-2 w-96">
                            <Input
                                type="text"
                                placeholder="Search by id, name or description..."
                                value={rawSearch}
                                onChange={(e) => 
                                    setRawSearch(e.target.value)
                                }
                                className="max-w-xs"
                            />
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-1">
                            {selected_status && (
                                <Badge variant="darkOutline">Status: {formatStatusLabel(selected_status)}</Badge>
                            )}
                            
                            {(selected_status) && (
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
                        <SortDropdown<CategorySortKey>
                            sortKey={sortKey}
                            sortDir={sortDir}
                            options={categorySortOptions}
                            onChange={(key, dir) => { 
                                setSortKey(key); setSortDir(dir); 
                            }}
                        />

                        <CategoryFilterDropdown
                            onApply={applyFilters}
                            onClear={clearFilters}
                            selected_status={selected_status}
                        />

                        <Button 
                            onClick={() => {
                                setShowAddCategory(true);
                            }}
                            className="cursor-pointer"
                        >
                            <PlusCircle className="mr-1 h-4 w-4" /> Add New Category
                        </Button>
                    </div>
                </div>

                {/* CATEGORIES Table */}
                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Name</TableHead>
                                <TableHead className="text-center">Description</TableHead>
                                <TableHead className="text-center">Associated Brands</TableHead>
                                <TableHead className="text-center">Related Models</TableHead>
                                <TableHead className="text-center">Total Assets</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="text-center">
                            {page_items.length > 0 ? page_items.map((cat) => {
                                return (
                                <TableRow
                                    key={cat.id}
                                    onClick={() => 
                                        // setSelectedCategoryId(Number(cat.id))
                                        setSelectedCategoryId((prev) => (prev === Number(cat.id) ? null : Number(cat.id)))
                                    }
                                    className={`cursor-pointer ${selectedCategoryId === Number(cat.id) ? 'bg-muted/50' : ''}`}
                                    title="Click to filter asset models by this category (click again to show all)"
                                >
                                    <TableCell>{cat.id}</TableCell>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    <TableCell>{cat.description ?? '—'}</TableCell>
                                    <TableCell>{cat.brands_count}</TableCell>
                                    <TableCell>{cat.models_count}</TableCell>
                                    <TableCell>{cat.assets_count}</TableCell>
                                    <TableCell className="flex justify-center items-center gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="cursor-pointer"
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setShowEditCategory(true);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setCategoryToDelete(cat);
                                                setShowDeleteCategoryModal(true);
                                            }}
                                            className="cursor-pointer"
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
                                                href={`/categories/view/${cat.id}`}
                                                preserveScroll
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                            
                                        </Button>
                                        
                                    </TableCell>
                                </TableRow>
                                );
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="text-xs text-muted-foreground">
                    Showing {sorted.length ? start + 1 : 0} – {Math.min(start + page_size, sorted.length)} of <strong>{sorted.length}</strong> records
                </div>
            </div>

            {/* ASSET MODELS Table */}
            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-semibold">Asset Models</h2>
                        <p className="text-sm text-muted-foreground">List of asset models across categories.</p>

                        <div className="flex items-center gap-2 w-96">
                            <Input
                                type="text"
                                placeholder="Search by id, brand, model, or category..."
                                value={modelSearchRaw}
                                onChange={(e) => setModelSearchRaw(e.target.value)}
                                className="max-w-xs"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            {modelStatus && (
                            <Badge variant="darkOutline">Status: {formatStatusLabel(modelStatus)}</Badge>
                            )}

                            {modelStatus && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setModelStatus('')}
                                className="cursor-pointer"
                            >
                                Clear filters
                            </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {selectedCategoryId !== null && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={clearCategoryFilter}
                                className="cursor-pointer"
                                title="Show all models"
                            >
                                <Eye className="mr-1 h-4 w-4" />
                                Show all models
                            </Button>
                        )}
                        
                        <SortDropdown<ModelSortKey>
                            sortKey={modelSortKey}
                            sortDir={modelSortDir}
                            options={[
                            { value: 'id', label: 'ID' },
                            { value: 'brand', label: 'Brand' },
                            { value: 'model', label: 'Model' },
                            { value: 'assets_count', label: 'Total Assets' },
                            { value: 'status', label: 'Status' },
                            ] as const}
                            onChange={(key, dir) => { setModelSortKey(key); setModelSortDir(dir); }}
                        />

                    {/* Status filter (simple select to match your look-and-feel) */}
                        <select
                            className="border rounded px-2 py-1 text-sm"
                            value={modelStatus}
                            onChange={(e) => setModelStatus(e.target.value)}
                            title="Filter by status"
                        >
                            <option value="">All statuses</option>
                            <option value="active">Active</option>
                            <option value="is_archived">Archived</option>
                            {/* add other statuses if you use them */}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                            <TableHead className="text-center">ID</TableHead>
                            <TableHead className="text-center">Brand</TableHead>
                            <TableHead className="text-center">Model</TableHead>
                            <TableHead className="text-center">Category</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Total Assets</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="text-center">
                            {modelPageItems.length > 0 ? (
                            modelPageItems.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell>{m.id}</TableCell>
                                    <TableCell className="font-medium">{m.brand ?? '—'}</TableCell>
                                    <TableCell>{m.model ?? '—'}</TableCell>
                                    <TableCell>{m.category_name ?? `#${m.category_id}`}</TableCell>
                                    <TableCell>{m.status ? formatStatusLabel(m.status) : '—'}</TableCell>
                                    <TableCell>{m.assets_count ?? 0}</TableCell>
                                    <TableCell className="flex justify-center items-center gap-2">
                                        {/* Wire these to your Asset Model modals/routes when ready */}
                                        <Button variant="ghost" size="icon" className="cursor-pointer">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="cursor-pointer">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="cursor-pointer">
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                                    No asset models found.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="text-xs text-muted-foreground">
                    Showing {sortedModels.length ? modelStart + 1 : 0} – {Math.min(modelStart + MODEL_PAGE_SIZE, sortedModels.length)} of <strong>{sortedModels.length}</strong> models
                </div>
            </div>

            <AddCategoryModal 
                show={showAddCategory} 
                onClose={() => 
                    setShowAddCategory(false)
                } 
            />

            {selectedCategory && (
                <EditCategoryModal
                    show={showEditCategory}
                    onClose={() => {
                        setShowEditCategory(false);
                        setSelectedCategory(null);
                    }}
                    category={selectedCategory}
                />
            )}

            {selectedCategory && (
                <ViewCategoryModal
                    open={showViewCategory}
                    onClose={closeViewCategory}
                    category={selectedCategory}
                />
            )}

            <DeleteConfirmationModal
                show={showDeleteCategoryModal}
                onCancel={() => 
                    setShowDeleteCategoryModal(false)
                }
                onConfirm={() => {
                    if (categoryToDelete) {
                        router.delete(`/categories/${categoryToDelete.id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setShowDeleteCategoryModal(false);
                                setCategoryToDelete(null);
                            },
                        });
                    }
                }}
            />
        </AppLayout>
    );
}