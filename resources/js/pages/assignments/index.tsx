import { useState, useEffect } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Pencil, PlusCircle, Trash2, ClipboardList, UserCheck2, UserX, AlertTriangle } from 'lucide-react';
import Pagination, { PageInfo } from '@/components/Pagination';
import { formatDateLong } from '@/types/custom-index';
import type { AssignmentPageProps, AssetAssignment } from '@/types/asset-assignment';

import { Input } from '@/components/ui/input';
import useDebouncedValue from '@/hooks/useDebouncedValue';

import SortDropdown, { type SortDir } from '@/components/filters/SortDropdown';
import PersonnelFilterDropdown from '@/components/filters/PersonnelFilterDropdown';

import AddAssignmentModal from './AddAssignmentModal';
import EditAssignmentModal from './EditAssignmentModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import ViewAssignmentModal from './ViewAssignmentModal';
import ReassignAssetsModal from './ReassignAssetsModal';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Assignments', href: '/assignments' },
];

export default function AssignmentsIndex({ 
    assignments, 
    totals, 
    personnels,
    units,
    assets,
    currentUser,
    users
}: AssignmentPageProps) {
    const { props } = usePage<AssignmentPageProps>();

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [toEdit, setToEdit] = useState<AssetAssignment | null>(null);

    const [showView, setShowView] = useState(false);
    const [viewAssignment, setViewAssignment] = useState<AssetAssignment | null>(null);

    const [showReassign, setShowReassign] = useState(false);
    const [reassignPersonnel, setReassignPersonnel] = useState<number | null>(null);

    const [showDelete, setShowDelete] = useState(false);
    const [toDelete, setToDelete] = useState<AssetAssignment | null>(null);

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200).trim().toLowerCase();

    const refreshAssignments = () => {
        router.reload({
            only: ['assignments', 'totals'],
        });
    };

    const sortOptions = [
        { value: 'date_assigned', label: 'Date Assigned' },
        { value: 'updated_at', label: 'Date Updated' },
        { value: 'items_count', label: 'Assets Count' },
    ] as const;

    type SortKey = (typeof sortOptions)[number]['value'];

    const [sortKey, setSortKey] = useState<SortKey>('date_assigned');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const [selectedUnitId, setSelectedUnitId] = useState<number | ''>('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Filter
    const filtered = assignments.data.filter((a) => {
        const name = a.personnel?.full_name?.toLowerCase() ?? '';
        const matchesSearch = !search || name.includes(search);

        const matchesUnit = !selectedUnitId || a.personnel?.unit_or_department?.id === selectedUnitId;
        const matchesStatus = !selectedStatus || a.personnel?.status === selectedStatus;

        return matchesSearch && matchesUnit && matchesStatus;
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortKey === 'date_assigned' || sortKey === 'updated_at') {
            const da = new Date(a[sortKey] ?? '').getTime();
            const db = new Date(b[sortKey] ?? '').getTime();
            return (da - db) * dir;
        }
        if (sortKey === 'items_count') {
            return ((a.items_count ?? 0) - (b.items_count ?? 0)) * dir;
        }
        return 0;
    });

    const page_items = sorted;

    useEffect(() => {
        if (props.viewing) {
            setViewAssignment(props.viewing);
            setShowView(true);
        }
    }, [props.viewing]);

    const closeView = () => {
        setShowView(false);
        setViewAssignment(null);
        if (/^\/?assignments\/\d+\/?$/.test(window.location.pathname)) {
            history.back();
        }
    };

    const hasFilters =
        rawSearch.trim() !== '' ||
        selectedUnitId !== '' ||
        selectedStatus !== '' ||
        sortKey !== 'date_assigned' ||
        sortDir !== 'desc'
    ;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Asset Assignments" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div>
                        <h1 className="text-2xl font-semibold">Asset Assignments</h1>
                        <p className="text-sm text-muted-foreground">
                            Records of assets assigned to personnels.
                        </p>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            type="text"
                            placeholder="Search by personnel name..."
                            value={rawSearch}
                            onChange={(e) => setRawSearch(e.target.value)}
                            className="w-72"
                        />

                        {/* Actions (sort, filter, add) */}
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
                            
                            {hasFilters && (
                                <Button
                                    variant="destructive"
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setRawSearch('');
                                        setSelectedUnitId('');
                                        setSelectedStatus('');
                                        setSortKey('date_assigned');
                                        setSortDir('desc');
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

                            <Button onClick={() => setShowAdd(true)} className="cursor-pointer">
                                <PlusCircle className="mr-1 h-4 w-4" /> New Assignment
                            </Button>
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                {totals && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        {/* Total Assignments */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                                <ClipboardList className="h-7 w-7 text-indigo-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Assignments</div>
                                <div className="text-3xl font-bold">
                                    {Number(totals.total_assignments ?? 0).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Personnels with Assets */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <UserCheck2 className="h-7 w-7 text-green-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Personnels w/ Assets</div>
                                <div className="text-3xl font-bold">
                                    {Number(totals.total_personnels_with_assets ?? 0).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Inactive Personnels */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                <UserX className="h-7 w-7 text-gray-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Inactive Personnels w/ Assets</div>
                                <div className="text-3xl font-bold">
                                    {Number(totals.total_inactive_personnels_with_assets ?? 0).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Left University */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                <AlertTriangle className="h-7 w-7 text-red-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Assets w/ Former Personnels
                                </div>
                                <div className="text-3xl font-bold">
                                    {Number(totals.assets_assigned_to_left_university ?? 0).toLocaleString()}
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
                                <TableHead className="text-center">Personnel</TableHead>
                                <TableHead className="text-center">Unit/Department</TableHead>
                                <TableHead className="text-center">Assets Count</TableHead>
                                <TableHead className="text-center">Date Assigned</TableHead>
                                <TableHead className="text-center">Assigned By</TableHead>
                                <TableHead className="text-center">Date Updated</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="text-center">
                            {page_items.length > 0 ? (
                                page_items.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell>{a.id}</TableCell>
                                    <TableCell>
                                    <div className="flex flex-col">
                                        <span className='font-medium'>{a.personnel?.full_name ?? '—'}</span>
                                        <span className="text-xs text-muted-foreground">{a.personnel?.position ?? ''}</span>
                                    </div>
                                    </TableCell>
                                    <TableCell>{a.personnel?.unit_or_department?.name ?? '—'}</TableCell>
                                    <TableCell>{a.items_count ?? 0}</TableCell>
                                    <TableCell>{formatDateLong(a.date_assigned)}</TableCell>
                                    <TableCell>{a.assigned_by_user?.name ?? '—'}</TableCell>
                                    <TableCell>{formatDateLong(a.updated_at) ?? '—'}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-center items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setReassignPersonnel(a.id);
                                                    setShowReassign(true);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <UserCheck2 className="h-4 w-4 text-blue-600" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setToEdit(a);
                                                    setShowEdit(true);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setToDelete(a);
                                                    setShowDelete(true);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="cursor-pointer"
                                            >
                                                <Link href={`/assignments/${a.id}`} preserveScroll>
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                                    No assignments found.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <PageInfo
                        page={assignments.current_page}
                        total={assignments.total}
                        pageSize={assignments.per_page}
                        label="records"
                    />
                    <Pagination
                        page={assignments.current_page}
                        total={assignments.total}
                        pageSize={assignments.per_page}
                        onPageChange={(p) => {
                        router.get('/assignments', { page: p }, { preserveScroll: true });
                        }}
                    />
                </div>
            </div>

            {/* Modals */}
            <AddAssignmentModal
                show={showAdd}
                onClose={() => {
                    setShowAdd(false)
                    refreshAssignments();
                }}
                assets={assets}
                personnels={personnels}
                units={units}
                currentUserId={currentUser?.id ?? 0}
                users={users}
            />

            {toEdit && (
                <EditAssignmentModal
                    show={showEdit}
                    onClose={() => {
                        setShowEdit(false);
                        setToEdit(null);
                        refreshAssignments();
                    }}
                    assignment={toEdit}
                    assets={assets}          
                    personnels={personnels}  
                    units={units}  
                    currentUserId={currentUser?.id ?? 0}
                    users={users}       
                />
            )}

            {viewAssignment && props.viewing_items && (
                <ViewAssignmentModal
                    open={showView}
                    onClose={closeView}
                    assignment={viewAssignment}
                    items={props.viewing_items}
                />
            )}

            {reassignPersonnel && (
                <ReassignAssetsModal
                    open={showReassign}
                    onClose={() => {
                        setShowReassign(false);
                        setReassignPersonnel(null);
                        refreshAssignments();
                    }}
                    assignmentId={reassignPersonnel} 
                    personnels={personnels}
                />
            )}

            <DeleteConfirmationModal
                show={showDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this assignment?"
                onCancel={() => setShowDelete(false)}
                onConfirm={() => {
                    if (toDelete) {
                        router.delete(`/assignments/${toDelete.id}`, {
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
