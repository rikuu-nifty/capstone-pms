import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { Eye, Pencil, PlusCircle, Trash2, Users, UserCheck2 } from 'lucide-react';
import useDebouncedValue from '@/hooks/useDebouncedValue';

import SortDropdown, { type SortDir } from '@/components/filters/SortDropdown';
import Pagination, { PageInfo } from '@/components/Pagination';

import AddPersonnelModal from './AddPersonnelModal';
import EditPersonnelModal from './EditPersonnelModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import PersonnelFilterDropdown from '@/components/filters/PersonnelFilterDropdown';

import type { Personnel, PersonnelPageProps } from '@/types/personnel';
import { formatEnums, ucwords } from '@/types/custom-index';

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

export default function PersonnelsIndex({
    personnels = [],
    users = [],
    units = [],
    totals,
}: PersonnelPageProps) {

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200).trim().toLowerCase();

    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selected, setSelected] = useState<Personnel | null>(null);

    const [showDelete, setShowDelete] = useState(false);
    const [toDelete, setToDelete] = useState<Personnel | null>(null);

    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<number | ''>('');
    const [selectedStatus, setSelectedStatus] = useState('');

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
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Personnels</h1>
                        <p className="text-sm text-muted-foreground">
                            List of university personnel who may be assigned assets.
                        </p>

                        <div className="flex items-center gap-2 w-96">
                            <Input
                                type="text"
                                placeholder="Search by name, position, or unit..."
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

                        <Button onClick={() => setShowAdd(true)} className="cursor-pointer">
                            <PlusCircle className="mr-1 h-4 w-4" /> Add New Personnel
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                {totals && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    </div>
                )}

                {/* Table */}
                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Full Name</TableHead>
                                <TableHead className="text-center">Position</TableHead>
                                <TableHead className="text-center">Unit/Department</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="text-center">
                            {page_items.length > 0 ? page_items.map((p) => (
                                <TableRow
                                    key={p.id}
                                    onClick={() => setSelectedRowId(Number(p.id))}
                                    className={`cursor-pointer ${selectedRowId === Number(p.id) ? 'bg-muted/50' : ''}`}
                                >
                                    <TableCell>{p.id}</TableCell>
                                    <TableCell className="font-medium">{ucwords(p.full_name) ?? '—'}</TableCell>
                                    <TableCell>{p.position ?? '—'}</TableCell>
                                    <TableCell>{p.unit_or_department ?? '—'}</TableCell>
                                    <TableCell>{formatEnums(p.status) ?? '—'}</TableCell>
                                    <TableCell className="h-full">
                                        <div className="flex justify-center items-center gap-2 h-full">
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

                                            <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                                                <Link href={`/personnels/view/${p.id}`} preserveScroll>
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Link>
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
                onClose={() => setShowAdd(false)}
            />

            {selected && (
                <EditPersonnelModal
                    show={showEdit}
                    users={users}
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
