import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMemo, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SortDropdown, { type SortDir } from '@/components/filters/SortDropdown';
import { Eye, Pencil, PlusCircle, Trash2, ListChecks, Tag } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import useDebouncedValue from '@/hooks/useDebouncedValue';

import type { EquipmentCodesPageProps, EquipmentCodeWithModels } from '@/types/equipment-code';
import { formatNumber, Category } from '@/types/custom-index';
import Pagination, { PageInfo } from '@/components/Pagination';

import AddEquipmentCodeModal from './AddEquipmentCode';
import EditEquipmentCodeModal from './EditEquipmentCode';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import EquipmentCodeFilterDropdown from '@/components/filters/EquipmentCodeFilterDropdown';
import ViewEquipmentCodeModal from './ViewEquipmentCode';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Equipment Codes', href: '/equipment-codes' },
]

const sortOptions = [
    { value: 'id', label: 'ID' },
    { value: 'code', label: 'Code No.' },
    { value: 'description', label: 'Description' },
    { value: 'asset_models_count', label: 'Total Models' },
] as const

type SortKey = (typeof sortOptions)[number]['value']

export default function EquipmentCodesIndex({ equipment_codes, totals }: EquipmentCodesPageProps) {
    const [showView, setShowView] = useState(false);
    const [viewing, setViewing] = useState<EquipmentCodeWithModels | null>(null);

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('')

    const [showAdd, setShowAdd] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [selected, setSelected] = useState<EquipmentCodeWithModels | null>(null)

    const [showDelete, setShowDelete] = useState(false)
    const [toDelete, setToDelete] = useState<EquipmentCodeWithModels | null>(null)

    const [rawSearch, setRawSearch] = useState('')
    const search = useDebouncedValue(rawSearch, 200).trim().toLowerCase()

    const [sortKey, setSortKey] = useState<SortKey>('id')
    const [sortDir, setSortDir] = useState<SortDir>('asc')

    // const [page, setPage] = useState(1)
    // const PAGE_SIZE = 5

    // useEffect(() => { setPage(1) }, [search, sortKey, sortDir])

    const filtered = useMemo(() => {
        return (equipment_codes.data ?? []).filter((c) => {
            // const haystack = `${c.id} ${c.code} ${c.description} ${c.category_name ?? ''}`.toLowerCase();
            const haystack = `${c.id} ${c.code} ${c.description}`.toLowerCase();
            const matchesSearch = !search || haystack.includes(search);
            const matchesCategory = !selectedCategoryId || c.category_id === selectedCategoryId;
            return matchesSearch && matchesCategory;
        });
    }, [equipment_codes.data, search, selectedCategoryId]);

    const sorted = useMemo(() => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => {
            if (sortKey === 'code' || sortKey === 'description') {
                const d = (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '');
                return (d !== 0 ? d : (a.id - b.id)) * dir;
            }
            if (sortKey === 'asset_models_count') {
                const d = (a.asset_models_count ?? 0) - (b.asset_models_count ?? 0);
                return (d !== 0 ? d : (a.id - b.id)) * dir;
            }
            return (a.id - b.id) * dir;
        });
    }, [filtered, sortKey, sortDir]);

    const page_items = sorted;

    // const start = (page - 1) * PAGE_SIZE
    // const page_items = sorted.slice(start, start + PAGE_SIZE)

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Equipment Codes" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold">Equipment Codes</h1>
                <p className="text-sm text-muted-foreground">List of official PMO equipment codes.</p>
                </div>

                {totals && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        {/* Total Codes */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100">
                                <Tag className="h-7 w-7 text-sky-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Codes</div>
                                <div className="text-3xl font-bold">{formatNumber(totals.total_codes)}</div>
                            </div>
                        </div>

                        {/* Unused Codes */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                <Trash2 className="h-7 w-7 text-red-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Unused Codes</div>
                                <div className="text-3xl font-bold">{formatNumber(totals.unused_codes)}</div>
                            </div>
                        </div>

                        {/* Used vs Unused % */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                <Tag className="h-7 w-7 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Models Assignment</div>
                                <div className="text-lg font-semibold">
                                    <span className="text-green-600">{totals.used_percentage}% Assigned</span>
                                    <span className="text-muted-foreground"> / </span>
                                    <span className="text-red-600">{totals.unused_percentage}% Unassigned</span>
                                </div>
                            </div>
                        </div>

                        {/* Average Models per Code */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                <ListChecks className="h-7 w-7 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Average Models per Code</div>
                                <div className="text-3xl font-bold">{totals.avg_models_per_code}</div>
                            </div>
                        </div>

                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 w-96">
                        <Input
                            type="text"
                            placeholder="Search by code number or description..."
                            value={rawSearch}
                            onChange={(e) => setRawSearch(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="flex gap-2">
                        <SortDropdown<SortKey>
                            sortKey={sortKey}
                            sortDir={sortDir}
                            options={sortOptions}
                            onChange={(key, dir) => { setSortKey(key); setSortDir(dir) }}
                        />
                        <EquipmentCodeFilterDropdown
                            categories={usePage<{ categories: Category[] }>().props.categories ?? []}
                            selectedCategoryId={selectedCategoryId}
                            onApply={({ categoryId }) => setSelectedCategoryId(categoryId)}
                            onClear={() => setSelectedCategoryId('')}
                        />

                        <Button onClick={() => setShowAdd(true)} className="cursor-pointer">
                            <PlusCircle className="mr-1 h-4 w-4" /> Add New Code
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">Code</TableHead>
                                <TableHead className="text-center">Description</TableHead>
                                <TableHead className="text-center">Category</TableHead>
                                <TableHead className="text-center">Models Count</TableHead>
                                <TableHead className="text-center">Assets Count</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-center">
                            {page_items.length > 0 ? page_items.map((c) => (
                                <TableRow key={c.id} className="cursor-pointer">
                                    <TableCell className="font-medium">{(c.code).toUpperCase()}</TableCell>
                                    <TableCell 
                                        className={`max-w-[150px] whitespace-normal break-words ${
                                            c.description && c.description !== '-' 
                                            ? 'text-center' 
                                            : 'text-justify'
                                        }`}
                                    >
                                        {c.description ?? '—'}
                                    </TableCell>
                                    <TableCell className="max-w-[150px] min-w-[150px] whitespace-normal break-words">{c.category_name ?? '—'}</TableCell>
                                    <TableCell>{c.asset_models_count ?? 0}</TableCell>
                                    <TableCell>{c.assets_count ?? 0}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-center items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => { setSelected(c); setShowEdit(true) }}
                                                className="cursor-pointer"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => { setToDelete(c); setShowDelete(true) }}
                                                className="cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setViewing(c);
                                                    setShowView(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                                        No equipment codes found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between">
                    <PageInfo
                        page={equipment_codes.current_page}
                        total={equipment_codes.total}
                        pageSize={equipment_codes.per_page}
                        label="equipment codes"
                    />
                    <Pagination
                        page={equipment_codes.current_page}
                        total={equipment_codes.total}
                        pageSize={equipment_codes.per_page}
                        onPageChange={(p) =>
                            router.get(route('equipment-codes.index'), { page: p }, { preserveScroll: true })
                        }
                    />
                </div>

                <DeleteConfirmationModal
                    show={showDelete}
                    onCancel={() => setShowDelete(false)}
                    onConfirm={() => {
                        if (toDelete) {
                        router.delete(`/equipment-codes/${toDelete.id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                            setShowDelete(false)
                            setToDelete(null)
                            },
                        })
                        }
                    }}
                />

                <AddEquipmentCodeModal show={showAdd} onClose={() => setShowAdd(false)} />

                {selected && (
                    <EditEquipmentCodeModal
                        show={showEdit}
                        onClose={() => { setShowEdit(false); setSelected(null) }}
                        equipmentCode={selected}
                    />
                )}

                {viewing && (
                    <ViewEquipmentCodeModal
                        open={showView}
                        onClose={() => {
                        setShowView(false);
                        setViewing(null);
                        }}
                        equipmentCode={viewing}
                    />
                )}

            </div>
        </AppLayout>
    )
}
