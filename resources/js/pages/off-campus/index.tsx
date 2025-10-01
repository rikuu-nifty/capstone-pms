import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginatorOffCampus';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type VariantProps } from 'class-variance-authority';
import { Eye, Filter, Grid, Pencil, PlusCircle, Trash2, ClipboardList, Repeat, AlertTriangle, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { formatStatusLabel } from '@/types/custom-index';
import OffCampusAddModal from './OffCampusAddModal';
import OffCampusEditModal from './OffCampusEditModal';
import OffCampusViewModal from './OffCampusViewModal';

import Pagination, { PageInfo } from '@/components/Pagination';

// -------------------- TYPES --------------------

export type OffCampusAsset = {
    id: number;
    asset_id: number;
    asset_model_id: number | null;
    asset?: {
        id: number;
        asset_model_id: number | null;
        asset_name: string;
        description: string | null;
        serial_no: string | null;
        asset_model?: { id: number; brand: string; model: string } | null;
    } | null;
};

export type OffCampus = {
    id: number;
    requester_name: string;
    college_or_unit_id: number | null;
    purpose: string;
    date_issued: string;
    return_date: string | null;
    quantity: number;
    units: string;
    remarks: 'official_use' | 'repair';
    status: 'pending_review' | 'pending_return' | 'returned' | 'overdue' | 'cancelled';
    comments?: string | null;
    approved_by?: string | null;
    issued_by_id?: number | null;
    checked_by?: string | null;

    assets?: OffCampusAsset[];
    asset_model?: { id: number; brand: string; model: string } | null;
    college_or_unit?: { id: number; name: string; code: string } | null;
    issued_by?: { id: number; name: string } | null;
};

export type Asset = {
    id: number;
    asset_model_id: number | null;
    asset_name: string;
    serial_no: string | null;
    description?: string | null; // ✅ optional if needed
    unit_or_department_id: number; // ✅ add this missing field
};
export type AssetModel = { id: number; brand: string; model: string };
export type User = { id: number; name: string };
export type UnitOrDepartment = { id: number; name: string; code: string };

type Props = {
    offCampuses: Paginator<OffCampus>;
    unitOrDepartments: UnitOrDepartment[];
    units?: string[];
    assets: Asset[];
    assetModels: AssetModel[];
    users: User[];

    totals: OffCampusTotals;
};

export type OffCampusTotals = {
    pending_review_this_month: number;
    pending_return_percentage: number;
    returned_percentage: number;
    overdue_rate: number;
    cancellation_rate: number;
    missing_count: number;
    official_use_percentage: number;
    repair_percentage: number;
};

// -------------------- HELPERS --------------------

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Off-Campus', href: '/off-campus' }];

function formatDate(d?: string | null) {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d!;
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

const offCampusStatusMap: Record<OffCampus['status'], VariantProps<typeof badgeVariants>['variant']> = {
    pending_review: 'Pending_Review',
    pending_return: 'Pending',
    returned: 'Completed',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
};

// function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'primary' {
//     switch (status) {
//         case 'returned':
//             return 'default'; // green
//         case 'overdue':
//             return 'destructive'; // red
//         case 'pending_review':
//             return 'secondary'; // gray/blue
//         case 'pending_return':
//             return 'primary'; // neutral outline
//         case 'cancelled':
//             return 'destructive'; // red as well
//         default:
//             return 'secondary';
//     }
// }

// function humanizeRemarks(v: string) {
//     if (!v) return '—';
//     return v.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// }

// -------------------- COMPONENT --------------------

export default function OffCampusIndex({
    offCampuses,
    unitOrDepartments,
    units = ['pcs', 'set', 'unit', 'pair', 'dozen', 'box', 'pack', 'roll', 'bundle', 'kg', 'g', 'lb', 'ton', 'L', 'ml', 'gal'],
    assets,
    assetModels,
    users,
    totals,
}: Props) {
    const rows = offCampuses.data;
    const [search, setSearch] = useState('');
    const [selectedOffCampus, setSelectedOffCampus] = useState<OffCampus | null>(null);

    const [showAddOffCampus, setShowAddOffCampus] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [showViewOffCampus, setShowViewOffCampus] = useState(false);

    // 🔻 delete (archive) modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [offCampusToDelete, setOffCampusToDelete] = useState<Pick<OffCampus, 'id'> | null>(null);

    type PagePropsWithViewing = Props & {
        viewing?: OffCampus | null;
    };

    const { props } = usePage<PagePropsWithViewing>();

    useEffect(() => {
        if (!props.viewing) return;
        setSelectedOffCampus(props.viewing);
        setShowViewOffCampus(true);
    }, [props.viewing]);

    const confirmDelete = () => {
        if (!offCampusToDelete) return;
        router.delete(route('off-campus.destroy', offCampusToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setOffCampusToDelete(null);
            },
        });
    };

    const onCloseView = () => {
        setShowViewOffCampus(false);
        setSelectedOffCampus(null);

        if (/^\/?off-campus\/\d+\/view\/?$/.test(window.location.pathname)) {
            if (window.history.length > 1) {
                history.back();
            } else {
                router.visit(route('off-campus.index'), { replace: true, preserveScroll: true });
            }
        }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return rows;

        return rows.filter((row) => {
            const assetStrings = (row.assets ?? [])
                .map((a) =>
                    [a.asset?.asset_name, a.asset?.description, a.asset?.serial_no, a.asset?.asset_model?.brand, a.asset?.asset_model?.model]
                        .filter(Boolean)
                        .join(' '),
                )
                .join(' ');

            const fields = [
                row.requester_name,
                row.college_or_unit?.name,
                row.college_or_unit?.code,
                row.asset_model?.brand,
                row.asset_model?.model,
                row.remarks,
                row.purpose,
                assetStrings,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return fields.includes(q);
        });
    }, [search, rows]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Off Campus" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Off-Campus</h1>
                    <p className="text-sm text-muted-foreground">
                    Forms authorizing items to be brought out of AUF premises.
                    </p>
                </div>

                {/* KPI Cards */}
                {totals && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {/* Pending Review (This Month) */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                            <ClipboardList className="h-7 w-7 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Pending Review (This Month)</div>
                            <div className="text-3xl font-bold">{totals.pending_review_this_month}</div>
                        </div>
                        </div>

                        {/* Pending vs Returned */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                            <Repeat className="h-7 w-7 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Pending vs Returned</div>
                            <div className="text-lg font-semibold">
                            <span className="text-blue-600">{totals.pending_return_percentage}% Pending</span>
                            <span className="text-muted-foreground"> / </span>
                            <span className="text-green-600">{totals.returned_percentage}% Returned</span>
                            </div>
                        </div>
                        </div>

                        {/* Missing */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                            <AlertTriangle className="h-7 w-7 text-red-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Missing</div>
                            <div className="text-3xl font-bold text-red-600">{totals.missing_count}</div>
                        </div>
                        </div>

                        {/* Official Use vs Repair */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                            <Wrench className="h-7 w-7 text-indigo-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Official Use vs Repair</div>
                            <div className="text-lg font-semibold">
                            <span className="text-blue-600">{totals.official_use_percentage}% Official</span>
                            <span className="text-muted-foreground"> / </span>
                            <span className="text-orange-600">{totals.repair_percentage}% Repair</span>
                            </div>
                        </div>
                        </div>
                    </div>
                )}

                {/* Search + Buttons Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 w-full sm:w-96">
                    <Input
                        type="text"
                        placeholder="Search requester, unit, item, serial, brand/model…"
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
                    <Button onClick={() => setShowAddOffCampus(true)} className="cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Off Campus
                    </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">College/Unit</TableHead>
                                <TableHead className="text-center">Requester Name</TableHead>
                                <TableHead className="text-center">Date Issued</TableHead>
                                <TableHead className="text-center">Return Date</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-center">Unit</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filtered.length > 0 ? (
                                filtered.map((row) => (
                                    <TableRow className="text-center" key={row.id}>
                                        <TableCell>{row.id || '—'}</TableCell>
                                        <TableCell>
                                            {row.college_or_unit ? `${row.college_or_unit.name} (${row.college_or_unit.code})` : '—'}
                                        </TableCell>
                                        <TableCell>{row.requester_name || '—'}</TableCell>
                                        <TableCell>{formatDate(row.date_issued)}</TableCell>
                                        <TableCell>{formatDate(row.return_date)}</TableCell>
                                        <TableCell>{row.quantity}</TableCell>
                                        <TableCell>{row.units}</TableCell>
                                        <TableCell>
                                            <Badge variant={offCampusStatusMap[row.status] ?? 'default'}>{formatStatusLabel(row.status)}</Badge>
                                        </TableCell>

                                        <TableCell className="flex justify-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    setSelectedOffCampus(row);
                                                    setEditModalVisible(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setOffCampusToDelete({ id: row.id });
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>

                                            {/* <Button
                                                size="icon"
                                                variant="ghost"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setSelectedOffCampus(row);
                                                    setShowViewOffCampus(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Button> */}
                                            <Button size="icon" variant="ghost" asChild className="cursor-pointer">
                                                <Link href={route('off-campus.view', row.id)} preserveScroll>
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                                        No Off Campus Records Found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between mt-3">
                    <PageInfo
                        page={offCampuses.current_page}
                        total={offCampuses.total}
                        pageSize={offCampuses.per_page}
                        label="Off-Campus records"
                    />
                    <Pagination
                        page={offCampuses.current_page}
                        total={offCampuses.total}
                        pageSize={offCampuses.per_page}
                        onPageChange={(newPage) => {
                        router.get(route('off-campus.index'), { page: newPage }, { preserveScroll: true });
                        }}
                    />
                </div>

                {/* Add Modal */}
                <OffCampusAddModal
                    show={showAddOffCampus}
                    onClose={() => setShowAddOffCampus(false)}
                    unitOrDepartments={unitOrDepartments}
                    units={units}
                    assets={assets}
                    assetModels={assetModels}
                    users={users}
                />

                {/* Edit Modal */}
                {editModalVisible && selectedOffCampus && (
                    <OffCampusEditModal
                        offCampus={selectedOffCampus}
                        onClose={() => {
                            setEditModalVisible(false);
                            setSelectedOffCampus(null);
                        }}
                        unitOrDepartments={unitOrDepartments}
                        assets={assets}
                        assetModels={assetModels}
                        users={users}
                    />
                )}

                {/* View Modal */}
                {/* {showViewOffCampus && selectedOffCampus && (
                    <OffCampusViewModal
                        open={showViewOffCampus}
                        onClose={() => {
                            setShowViewOffCampus(false);
                            setSelectedOffCampus(null);
                        }}
                        offCampus={selectedOffCampus}
                    />
                )} */}

                {showViewOffCampus && selectedOffCampus && (
                    <OffCampusViewModal open={showViewOffCampus} onClose={onCloseView} offCampus={selectedOffCampus} />
                )}

                {/* Delete (Archive) Modal */}
                <DeleteConfirmationModal show={showDeleteModal} onCancel={() => setShowDeleteModal(false)} onConfirm={confirmDelete} />
            </div>
        </AppLayout>
    );
}
