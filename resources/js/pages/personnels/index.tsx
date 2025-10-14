import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import useDebouncedValue from '@/hooks/useDebouncedValue';

import { Eye, Pencil, PlusCircle, Trash2, Users, UserCheck2, Check, X, AlertTriangle } from 'lucide-react';
import type { VariantProps } from "class-variance-authority";
import { Badge } from '@/components/ui/badge';
import { badgeVariants } from "@/components/ui/badge";

import SortDropdown, { type SortDir } from '@/components/filters/SortDropdown';
import Pagination, { PageInfo } from '@/components/Pagination';

import AddPersonnelModal from './AddPersonnelModal';
import EditPersonnelModal from './EditPersonnelModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import PersonnelFilterDropdown from '@/components/filters/PersonnelFilterDropdown';
import ViewPersonnelModal from './ViewPersonnelModal';

import type { Personnel, PersonnelPageProps } from '@/types/personnel';
import { ucwords } from '@/types/custom-index';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Personnels', href: '/personnels' },
];

const sortOptions = [
    { value: 'id', label: 'ID' },
    { value: 'last_name', label: 'Last Name' },
    { value: 'unit_or_department', label: 'Unit/Department' },
    { value: 'position', label: 'Position' },
    { value: 'status', label: 'Status' },
] as const;

type SortKey = (typeof sortOptions)[number]['value'];

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export default function PersonnelsIndex({
    personnels = [],
    users = [],
    units = [],
    totals,
}: PersonnelPageProps) {
    const { auth } = usePage().props as unknown as {
        auth: {
            permissions: string[];
        };
    };

    const canCreate = auth.permissions.includes('create-personnels');
    const canEdit = auth.permissions.includes('update-personnels');
    const canDelete = auth.permissions.includes('delete-personnels');

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200).trim().toLowerCase();

    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    const [selected, setSelected] = useState<Personnel | null>(null);

    const [showDelete, setShowDelete] = useState(false);
    const [toDelete, setToDelete] = useState<Personnel | null>(null);

    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<number | ''>('');
    const [selectedStatus, setSelectedStatus] = useState('');
    

    const statusMap: Record<
        "active" | "inactive" | "left_university",
        { label: string; variant: BadgeVariant }
    > = {
        active: { label: "Active", variant: "personnel_active" },
        inactive: { label: "Inactive", variant: "personnel_inactive" },
        left_university: { label: "Left University", variant: "personnel_left" },
    };

    useEffect(() => {
        setPage(1);
    }, [search, sortKey, sortDir]);

    const filtered = useMemo(() => {
        return personnels.filter((p) => {
            const haystack = `${p.id} ${p.full_name ?? ''} ${p.last_name ?? ''} ${p.position ?? ''} ${p.unit_or_department ?? ''} ${p.status ?? ''}`.toLowerCase();
            const matchesSearch = !search || haystack.includes(search);

            const matchesUnit = !selectedUnitId || p.unit_or_department_id === selectedUnitId;
            const matchesStatus = !selectedStatus || p.status === selectedStatus;

            return matchesSearch && matchesUnit && matchesStatus;
        });
    }, [personnels, search, selectedUnitId, selectedStatus]);

    const sorted = useMemo(() => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => {
            if (sortKey === 'last_name' || sortKey === 'position' || sortKey === 'status' || sortKey === 'unit_or_department') {
                const da = (a[sortKey] ?? '').toString();
                const db = (b[sortKey] ?? '').toString();
                const d = da.localeCompare(db);
                return (d !== 0 ? d : Number(a.id) - Number(b.id)) * dir;
            }
            const d = Number(a.id) - Number(b.id);
            return (d !== 0 ? d : Number(a.id) - Number(b.id)) * dir;
        });
    }, [filtered, sortKey, sortDir]);

    const start = (page - 1) * PAGE_SIZE;
    const page_items = sorted.slice(start, start + PAGE_SIZE);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personnels" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div>
                        <h1 className="text-2xl font-semibold">Personnels in Charge</h1>
                        <p className="text-sm text-muted-foreground">
                            List of university personnel who may be assigned assets.
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        {/* Search */}
                        <Input
                            type="text"
                            placeholder="Search by name, position, or unit..."
                            value={rawSearch}
                            onChange={(e) => setRawSearch(e.target.value)}
                            className="w-72"
                        />

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <SortDropdown<SortKey>
                                sortKey={sortKey}
                                sortDir={sortDir}
                                options={sortOptions}
                                onChange={(key, dir) => {
                                    setSortKey(key);
                                    setSortDir(dir);
                                }}
                            />

                            {(rawSearch.trim() !== '' ||
                                selectedUnitId !== '' ||
                                selectedStatus !== '' ||
                                sortKey !== 'id' ||
                                sortDir !== 'asc') && (
                                <Button
                                    variant="destructive"
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setRawSearch('');
                                        setSelectedUnitId('');
                                        setSelectedStatus('');
                                        setSortKey('id');
                                        setSortDir('asc');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}

                            <PersonnelFilterDropdown
                                units={units}
                                selectedUnitId={selectedUnitId}
                                selectedStatus={selectedStatus}
                                onApply={({ unitId, status }) => {
                                    setSelectedUnitId(unitId);
                                    setSelectedStatus(status);
                                }}
                                onClear={() => {
                                    setSelectedUnitId('');
                                    setSelectedStatus('');
                                }}
                            />

                            {canCreate && (
                                <Button onClick={() => setShowAdd(true)} className="cursor-pointer">
                                    <PlusCircle className="mr-1 h-4 w-4" /> Add New Personnel
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                {totals && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        {/* Total */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                                <Users className="h-7 w-7 text-indigo-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Personnels</div>
                                <div className="text-3xl font-bold">
                                    {Number(totals.total_personnels ?? 0).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Active */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <UserCheck2 className="h-7 w-7 text-green-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Active Personnels</div>
                                <div className="text-3xl font-bold">
                                    {Number(totals.active_personnels ?? 0).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Inactive */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                <Users className="h-7 w-7 text-gray-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Inactive Personnels</div>
                                <div className="text-3xl font-bold">
                                    {Number(totals.inactive_personnels ?? 0).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Left University */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                <AlertTriangle className="h-7 w-7 text-red-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Left University</div>
                                <div className="text-3xl font-bold">
                                {Number(totals.former_personnels ?? 0).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                {/* <TableHead className="text-center">ID</TableHead> */}
                                <TableHead className="text-center">Full Name</TableHead>
                                <TableHead className="text-center">Position</TableHead>
                                <TableHead className="text-center">Unit/Department</TableHead>
                                <TableHead className="text-center">System User</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="text-center">
                            {page_items.length > 0 ? page_items.map((p) => (
                                <TableRow
                                    key={p.id}
                                    onClick={() => setSelectedRowId(Number(p.id))}
                                    className={`cursor-default ${selectedRowId === Number(p.id) ? 'bg-muted/50' : ''}`}
                                >
                                    {/* <TableCell>{p.id}</TableCell> */}
                                    <TableCell className="font-medium">{ucwords(p.full_name) ?? '—'}</TableCell>
                                    <TableCell>{p.position ?? '—'}</TableCell>
                                    <TableCell>{p.unit_or_department ?? '—'}</TableCell>
                                    <TableCell className="text-center">
                                        {p.user_id ? (
                                            <Check className="h-5 w-5 text-green-600 mx-auto" />
                                        ) : (
                                            <X className="h-5 w-5 text-red-500 mx-auto" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {statusMap[p.status] && (
                                            <Badge variant={statusMap[p.status].variant} className="text-xs">
                                                {statusMap[p.status].label}
                                            </Badge>
                                        )}
                                    </TableCell>

                                    <TableCell className="h-full">
                                        <div className="flex justify-center items-center gap-2 h-full">
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        setSelected(p);
                                                        setShowEdit(true);
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
                                                        setToDelete(p);
                                                        setShowDelete(true);
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setSelected(p);
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
                                        No personnels found.
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

            <AddPersonnelModal
                show={showAdd}
                users={users}
                units={units} 
                onClose={() => setShowAdd(false)}
            />

            {selected && (
                <EditPersonnelModal
                    show={showEdit}
                    users={users}
                    units={units} 
                    onClose={() => {
                        setShowEdit(false);
                        setSelected(null);
                    }}
                    record={selected}
                />
            )}

            {selected && (
                <ViewPersonnelModal
                    open={showView}
                    onClose={() => {
                        setShowView(false);
                        setSelected(null);
                    }}
                    personnel={selected}
                    personnels={personnels}
                />
            )}

            <DeleteConfirmationModal
                show={showDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this personnel?"
                onCancel={() => setShowDelete(false)}
                onConfirm={() => {
                    if (toDelete) {
                        router.delete(`/personnels/${toDelete.id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setShowDelete(false);
                                setToDelete(null);
                            },
                        });
                    }
                }}
            />
        </AppLayout>
    );
}
