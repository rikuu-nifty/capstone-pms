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

import type { CategoriesPageProps, CategoryWithModels } from '@/types/category';
import { formatStatusLabel, formatNumber } from '@/types/custom-index';
// import KPIStatCard from '@/components/statistics/KPIStatCard';
import { Boxes, Tags, ListChecks } from 'lucide-react';


import AddCategoryModal from './AddCategory';
import EditCategoryModal from './EditCategory';
import ViewCategoryModal from './ViewCategory';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import Pagination, { PageInfo } from '@/components/Pagination';

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
    totals,
}: CategoriesPageProps) {

    const { props } = usePage<PageProps>();
    const viewing = props.viewing;

    const { auth } = usePage().props as unknown as {
        auth: {
            permissions: string[];
        };
    };

    const canCreate = auth.permissions.includes('create-categories');
    const canEdit = auth.permissions.includes('update-categories');
    const canDelete = auth.permissions.includes('delete-categories');

    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showEditCategory, setShowEditCategory] = useState(false);
    const [showViewCategory, setShowViewCategory] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryWithModels | null>(null);

    const totalCats = totals?.categories ?? 0;
    const totalModels = totals?.asset_models ?? 0;
    const totalAssets = totals?.assets ?? 0;

    const avgModelsPerCat = totalCats > 0 ? totalModels / totalCats : 0;
    // const avgAssetsPerCat = totalCats > 0 ? totalAssets / totalCats : 0;

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

    const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithModels | null>(null);

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200).trim().toLowerCase();

    const [selected_status, setSelected_status] = useState('');

    const clearFilters = () => {
        setSelected_status('');
    };

    // const applyFilters = (f: CategoryFilters) => {
    //     setSelected_status(f.status);
    // };

    const [sortKey, setSortKey] = useState<CategorySortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    // Pagination
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;

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

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const start = (page - 1) * PAGE_SIZE;
    const page_items = sorted.slice(start, start + PAGE_SIZE);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex flex-col gap-4 p-4">
                
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Categories</h1>
                    <p className="text-sm text-muted-foreground">List of asset categories.</p>
                </div>

                {totals && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        {/* Total Categories */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                                <Tags className="h-7 w-7 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Categories</div>
                                <div className="text-3xl font-bold">
                                    {formatNumber(totalCats)}
                                </div>
                            </div>
                        </div>

                        {/* Total Models */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100">
                                <ListChecks className="h-7 w-7 text-sky-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Models</div>
                                <div className="text-3xl font-bold">
                                    {formatNumber(totalModels)}
                                </div>
                            </div>
                        </div>

                        {/* Total Assets */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                                <Boxes className="h-7 w-7 text-teal-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Assets</div>
                                <div className="text-3xl font-bold">
                                    {formatNumber(totalAssets)}
                                </div>
                            </div>
                        </div>

                        {/* Models per Category */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                <Boxes className="h-7 w-7 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Models per Category</div>
                                <div className="text-3xl font-bold">
                                    {avgModelsPerCat.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 w-96">
                            <Input
                                type="text"
                                placeholder="Search by id, name or description..."
                                value={rawSearch}
                                onChange={(e) => setRawSearch(e.target.value)}
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
                            onChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
                        />
                        
                        {canCreate && (
                            <Button
                                onClick={() => { setShowAddCategory(true); }}
                                className="cursor-pointer"
                            >
                                <PlusCircle className="mr-1 h-4 w-4" /> Add New Category
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Name</TableHead>
                                <TableHead className="text-center">Description</TableHead>
                                <TableHead className="text-center">Distinct Brands</TableHead>
                                <TableHead className="text-center">Total Models per Category</TableHead>
                                <TableHead className="text-center">Asset Count</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="text-center">
                            {page_items.length > 0 ? page_items.map((cat) => (
                                <TableRow
                                    key={cat.id}
                                    onClick={() => 
                                        setSelectedCategoryId(Number(cat.id))
                                        // setSelectedCategoryId((prev) => (prev === Number(cat.id) ? null : Number(cat.id)))
                                    }
                                    className={`cursor-pointer ${selectedCategoryId === Number(cat.id) ? 'bg-muted/50' : ''}`}
                                >
                                    <TableCell>{cat.id}</TableCell>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    <TableCell 
                                        className={`max-w-[250px] whitespace-normal break-words ${
                                            cat.description && cat.description !== '-' 
                                            ? 'text-justify' 
                                            : 'text-center'
                                        }`}
                                    >
                                        {cat.description ?? '—'}
                                    </TableCell>
                                    <TableCell>{cat.brands_count}</TableCell>
                                    <TableCell>{cat.models_count}</TableCell>
                                    <TableCell>{cat.assets_count}</TableCell>
                                    <TableCell className="h-full">
                                        <div className="flex justify-center items-center gap-2 h-full">
                                            {canEdit && (
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
                                            )}

                                            {canDelete && (
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
                                            )}

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
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                <div className="flex items-center justify-between">
                    <PageInfo page={page} total={sorted.length} pageSize={PAGE_SIZE} label="categories" />
                    <Pagination
                        page={page}
                        total={sorted.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
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