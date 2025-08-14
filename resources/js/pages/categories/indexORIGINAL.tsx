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

import type { CategoriesPageProps, CategoryWithModels, CategoryFilters } from '@/types/category';
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

                {/* Table */}
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
                            {page_items.length > 0 ? page_items.map((categories) => (
                                <TableRow key={categories.id}>
                                    <TableCell>{categories.id}</TableCell>
                                    <TableCell className="font-medium">{categories.name}</TableCell>
                                    <TableCell>{categories.description ?? '—'}</TableCell>
                                    <TableCell>{categories.brands_count}</TableCell>
                                    <TableCell>{categories.models_count}</TableCell>
                                    <TableCell>{categories.assets_count}</TableCell>
                                    <TableCell className="flex justify-center items-center gap-2">
                                        
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="cursor-pointer"
                                            onClick={() => {
                                                setSelectedCategory(categories);
                                                setShowEditCategory(true);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setCategoryToDelete(categories);
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
                                                href={`/categories/view/${categories.id}`}
                                                preserveScroll
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                            
                                        </Button>
                                        
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
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
