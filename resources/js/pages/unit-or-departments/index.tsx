import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import useDebouncedValue from '@/hooks/useDebouncedValue';

import SortDropdown, { type SortDir } from '@/components/filters/SortDropdown';
import Pagination, { PageInfo } from '@/components/Pagination';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';

import AddUnitOrDepartmentModal from './AddUnitOrDepartmentModal';
import EditUnitOrDepartmentModal from './EditUnitOrDepartmentModal';
import ViewUnitOrDepartmentModal from './ViewUnitOrDepartmentModal';

import type { UnitOrDepartment, UnitDeptPageProps } from '@/types/unit-or-department';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Units / Departments', href: '/unit-or-departments' },
];

const sortOptions = [
    { value: 'id', label: 'ID' },
    { value: 'code', label: 'Code' },
    { value: 'name', label: 'Name' },
    { value: 'assets_count', label: 'Assets Count' },
] as const;

type SortKey = (typeof sortOptions)[number]['value'];

export default function UnitOrDepartmentsIndex({
    unit_or_departments = [],
    totals,
}: UnitDeptPageProps) {
    
    const { props } = usePage<UnitDeptPageProps>();
    const viewing = props.viewing;

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200).trim().toLowerCase();

    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selected, setSelected] = useState<UnitOrDepartment | null>(null);

    const [showView, setShowView] = useState(false);
    const [viewRecord, setViewRecord] = useState<UnitOrDepartment | null>(null);

    const [showDelete, setShowDelete] = useState(false);
    const [toDelete, setToDelete] = useState<UnitOrDepartment | null>(null);

    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

    useEffect(() => {
        setPage(1);
    }, [search, sortKey, sortDir]);

    useEffect(() => {
        if (!viewing) return;
        setViewRecord(viewing);
        setShowView(true);
    }, [viewing]);

    const closeView = () => {
        setShowView(false);
        setViewRecord(null);
        if (/^\/?unit-or-departments\/view\/\d+\/?$/.test(window.location.pathname)) {
            history.back();
        }
    };

    const filtered = useMemo(() => {
        return unit_or_departments.filter((u) => {
        const haystack = `${u.id} ${u.code ?? ''} ${u.name ?? ''} ${u.unit_head ?? ''}`.toLowerCase();
        return !search || haystack.includes(search);
        });
    }, [unit_or_departments, search]);

    const numberKey = (u: UnitOrDepartment, k: SortKey) =>
        k === 'id' ? Number(u.id) || 0
        : k === 'assets_count' ? Number(u.assets_count ?? 0)
        : 0;

    const sorted = useMemo(() => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => {
        if (sortKey === 'name' || sortKey === 'code') {
            const da = (a[sortKey] ?? '').toString();
            const db = (b[sortKey] ?? '').toString();
            const d = da.localeCompare(db);
            return (d !== 0 ? d : Number(a.id) - Number(b.id)) * dir;
        }
        const d = numberKey(a, sortKey) - numberKey(b, sortKey);
        return (d !== 0 ? d : Number(a.id) - Number(b.id)) * dir;
        });
    }, [filtered, sortKey, sortDir]);

    const start = (page - 1) * PAGE_SIZE;
    const page_items = sorted.slice(start, start + PAGE_SIZE);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Units / Departments" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Units / Departments</h1>
                        <p className="text-sm text-muted-foreground">
                        List of organizational units and departments.
                        </p>

                        <div className="flex items-center gap-2 w-96">
                        <Input
                            type="text"
                            placeholder="Search by id, unit/lab/dept, or code..."
                            value={rawSearch}
                            onChange={(e) => setRawSearch(e.target.value)}
                            className="max-w-xs"
                        />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <SortDropdown<SortKey>
                        sortKey={sortKey}
                        sortDir={sortDir}
                        options={sortOptions}
                        onChange={(key, dir) => {
                            setSortKey(key);
                            setSortDir(dir);
                        }}
                        />

                        <Button onClick={() => setShowAdd(true)} className="cursor-pointer">
                        <PlusCircle className="mr-1 h-4 w-4" /> Add New Unit / Department
                        </Button>
                    </div>
                </div>

                {totals && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border p-4">
                        <div className="text-sm text-muted-foreground">Total Units / Departments</div>
                        <div className="mt-1 text-2xl font-semibold">
                            {Number(totals.total_units ?? 0).toLocaleString()}
                        </div>
                        </div>
                        <div className="rounded-2xl border p-4">
                        <div className="text-sm text-muted-foreground">Total Assets (across all)</div>
                        <div className="mt-1 text-2xl font-semibold">
                            {Number(totals.total_assets ?? 0).toLocaleString()}
                        </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Code</TableHead>
                                <TableHead className="text-center">Name</TableHead>
                                <TableHead className="text-center">Description</TableHead>
                                <TableHead className="text-center">Assets Count</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="text-center">
                            {page_items.length > 0 ? page_items.map((u) => (
                                <TableRow
                                    key={u.id}
                                    onClick={() => setSelectedRowId(Number(u.id))}
                                    className={`cursor-pointer ${selectedRowId === Number(u.id) ? 'bg-muted/50' : ''}`}
                                >
                                    <TableCell>{u.id}</TableCell>
                                    <TableCell className="font-medium">{u.code ?? '—'}</TableCell>
                                    <TableCell>{u.name ?? '—'}</TableCell>
                                    <TableCell
                                        className={`max-w-[250px] whitespace-normal break-words text-center${
                                        u.description && u.description !== '-' ? 'text-justify' : 'text-center'
                                        }`}
                                    >
                                        {u.description ?? '—'}
                                    </TableCell>
                                    <TableCell>{u.assets_count ?? 0}</TableCell>
                                    <TableCell className="h-full">
                                        <div className="flex justify-center items-center gap-2 h-full">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer"
                                            onClick={() => {
                                            setSelected(u);
                                            setShowEdit(true);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                            setToDelete(u);
                                            setShowDelete(true);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>

                                        <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                                            <Link href={`/unit-or-departments/view/${u.id}`} preserveScroll>
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                        </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                                        No units or departments found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between">
                    <PageInfo page={page} total={sorted.length} pageSize={PAGE_SIZE} label="records" />
                    <Pagination page={page} total={sorted.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
                </div>
            </div>

            <AddUnitOrDepartmentModal
                show={showAdd}
                onClose={() => setShowAdd(false)}
            />

            {selected && (
                <EditUnitOrDepartmentModal
                    show={showEdit}
                    onClose={() => {
                        setShowEdit(false);
                        setSelected(null);
                    }}
                    record={selected}
                />
            )}

            <DeleteConfirmationModal
                show={showDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this unit/department?"
                onCancel={() => setShowDelete(false)}
                onConfirm={() => {
                    if (toDelete) {
                        router.delete(`/unit-or-departments/${toDelete.id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setShowDelete(false);
                                setToDelete(null);
                            },
                        });
                    }
                }}
            />

            {viewRecord && (
                <ViewUnitOrDepartmentModal
                    open={showView}
                    onClose={closeView}
                    record={viewRecord}
                />
            )}
        </AppLayout>
    );
}
