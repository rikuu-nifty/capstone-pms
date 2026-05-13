import SortDropdown, { SortDir } from '@/components/filters/SortDropdown';
import Pagination, { PageInfo } from '@/components/Pagination';
import MetricKpiCard from '@/components/statistics/MetricKpiCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatStatusLabel, ucwords } from '@/types/custom-index';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarCheck, CircleX, ClipboardCheck, Clock4, EllipsisVertical, Eye, Pencil, PlusCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import VerificationFormDeleteModal from './VerificationFormDeleteModal';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import VerificationFormFilterDropdown from '@/components/filters/VerificationFormFilterDropdown';
import VerificationFormAddModal from './VerificationFormAddModal';
import VerificationFormEditModal from './VerificationFormEditModal';
import VerificationFormManageModal from './VerificationFormManageModal';
import VerificationFormViewModal from './VerificationFormViewModal';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Verification Form', href: '/verification-form' }];

const verificationSortOptions = [
    { value: 'id', label: 'VF Number' },
    { value: 'verified_at', label: 'Verification Date' },
] as const;

type VerificationSortKey = (typeof verificationSortOptions)[number]['value'];

type ViewingVerification = {
    id: number;
    unit_or_department?: { name?: string; code?: string } | null;
    requested_by_personnel?: { id: number; name: string; title?: string } | null;
    requested_by_snapshot?: { name?: string | null; title?: string | null; contact?: string | null } | null;
    status: string;
    notes?: string | null;
    remarks?: string | null;
    verified_at?: string | null;
    verified_by?: { id: number; name: string } | null;
    created_at?: string | null;
};

export type VerificationFormRecord = {
    id: number;
    status: string;
    notes?: string | null;
    remarks?: string | null;
    verified_at?: string | null;
    verified_by?: { id: number; name: string } | null;

    unit_or_department?: { id?: number; name?: string; code?: string } | null;
    requested_by_personnel?: { id: number; name: string; title?: string } | null;
    requested_by_snapshot?: { name?: string | null; title?: string | null; contact?: string | null } | null;

    verification_assets?: Array<{ inventory_list_id: number; remarks?: string }>;
};

export type InventoryLite = {
    id: number;
    unit_or_department_id: number;
    asset_name: string;
    serial_no?: string | null;

    building?: { id: number; name: string } | null;
    buildingRoom?: { id: number; room: string } | null;
    subArea?: { id: number; name: string } | null;
};

type VerificationFormFull = {
    id: number;
    document_date?: string;
    type?: string;
    status: string;
    issuing_office?: { name: string; code: string };
    receiving_office?: { name: string; code: string };
    remarks?: string;
    personnel?: { name: string };
    turnover_disposal_assets?: {
        id: number;
        remarks?: string;
        assets: { id: number; asset_name: string };
    }[];
    form_approval?: {
        steps: {
            id: number;
            label: string;
            status: string;
            actor?: { name: string };
            external_name?: string;
            external_title?: string;
        }[];
    };
};

type MiniUnit = { id: number; name: string; code?: string };
type MiniPersonnel = { id: number; unit_or_department_id: number; full_name: string };

type PageProps = {
    verifications: {
        data: VerificationFormRecord[];
        total: number;
        per_page: number;
        current_page: number;
    };
    totals?: {
        verified_this_month: number;
        total_verified: number;
        pending_verification: number;
    };
    viewing?: VerificationFormFull;
    pmoHead?: { id: number; name: string } | null;

    verification?: {
        id: number;
        status: string;
        notes?: string;
        verified_at?: string;
        verified_by?: { id: number; name: string };
    };

    unitOrDepartments: MiniUnit[];
    personnels: MiniPersonnel[];
    assets: InventoryLite[];
};

const formatDateLong = (d?: string | null) => {
    if (!d) return '—';
    const safeDate = d.includes('T') ? d : `${d}T00:00:00`;
    const dt = new Date(safeDate);
    if (isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

type VerificationAction = 'verify' | 'reject';

export default function VerificationFormIndex() {
    const { verifications, totals, unitOrDepartments, personnels, viewing, assets, pmoHead } = usePage<PageProps>().props;

    const { auth } = usePage().props as unknown as {
        auth: { permissions: string[] };
    };

    const canView = auth.permissions.includes('view-verification-form');
    const canVerify = auth.permissions.includes('verify-verification-form');
    const canCreate = auth.permissions.includes('create-verification-form');
    // const canUpdate = auth.permissions.includes('update-verification-form');

    const [showAddModal, setShowAddModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [manageId, setManageId] = useState<number | null>(null);

    const [selectedVerificationForDelete, setSelectedVerificationForDelete] = useState<VerificationFormRecord | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVerificationId, setSelectedVerificationId] = useState<number | null>(null);

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedVerification, setSelectedVerification] = useState<ViewingVerification | null>(null);
    const [actionMode, setActionMode] = useState<VerificationAction>('verify');

    const [openActionId, setOpenActionId] = useState<number | null>(null);

    const openEditModal = (id: number) => {
        setSelectedVerificationId(id);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedVerificationId(null);
    };

    const closeViewVerification = () => {
        setShowViewModal(false);
        setSelectedVerification(null);

        if (/\/verification-form\/\d+$/.test(window.location.pathname)) {
            history.back();
        }
    };

    useEffect(() => {
        if (!viewing) return;
        setSelectedVerification(viewing);
        setShowViewModal(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewing?.id]);

    // Filters (status + requester)
    const [filters, setFilters] = useState({ status: '', requester: '' });
    const handleApplyFilters = (newFilters: typeof filters) => setFilters(newFilters);
    const handleClearFilters = () => setFilters({ status: '', requester: '' });

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200);

    const [sortKey, setSortKey] = useState<VerificationSortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const [page, setPage] = useState(1);
    const pageSize = 20;

    // UPDATED: search+filter now uses unit_or_department and requester names
    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return verifications.data.filter((vf) => {
            const unitName = vf.unit_or_department?.name ?? '';
            const reqName = vf.requested_by_personnel?.name ?? vf.requested_by_snapshot?.name ?? '';
            const haystack = `${vf.id} ${unitName} ${reqName} ${vf.status ?? ''}`.toLowerCase();

            const matchesSearch = !term || haystack.includes(term);
            const matchesStatus = !filters.status || vf.status === filters.status;

            // requester filter matches either unit name or requester name
            const filterTerm = filters.requester.trim().toLowerCase();
            const matchesRequester = !filterTerm || unitName.toLowerCase() === filterTerm || reqName.toLowerCase() === filterTerm;

            return matchesSearch && matchesStatus && matchesRequester;
        });
    }, [verifications.data, search, filters]);

    // UPDATED: sort by id or verified_at
    const sorted = useMemo(() => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => {
            const getValue = (vf: VerificationFormRecord) => (sortKey === 'verified_at' ? Date.parse(vf.verified_at ?? '') || 0 : Number(vf.id) || 0);
            return (getValue(a) - getValue(b)) * dir;
        });
    }, [filtered, sortKey, sortDir]);

    const start = (page - 1) * pageSize;
    const pageItems = sorted.slice(start, start + pageSize);

    const requesterOptions = useMemo(() => {
        // Build distinct list for the filter dropdown from unit names + requester names
        const opts: { id: number; name: string }[] = [];

        verifications.data.forEach((vf) => {
            const unitName = vf.unit_or_department?.name;
            const reqName = vf.requested_by_personnel?.name || vf.requested_by_snapshot?.name;

            if (unitName && !opts.some((o) => o.name === unitName)) {
                opts.push({ id: vf.id, name: unitName });
            }
            if (reqName && !opts.some((o) => o.name === reqName)) {
                opts.push({ id: vf.id, name: reqName });
            }
        });

        return opts;
    }, [verifications.data]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Verification Form" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Verification Form</h1>
                    <p className="text-sm text-muted-foreground">
                        Forms created by PMO to verify a requester’s assets. Independent of turnovers/disposals.
                    </p>
                </div>

                {/* KPI Cards */}
                {totals && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <MetricKpiCard
                            icon={CalendarCheck}
                            label="Verified This Month"
                            value={totals.verified_this_month}
                            detail="Completed verifications this month"
                            tone="blue"
                        />
                        <MetricKpiCard
                            icon={ClipboardCheck}
                            label="Total Verified"
                            value={totals.total_verified}
                            detail="All completed verification forms"
                            tone="green"
                        />
                        <MetricKpiCard
                            icon={Clock4}
                            label="Pending Verification"
                            value={totals.pending_verification}
                            detail="Forms still awaiting verification"
                            tone="yellow"
                        />
                    </div>
                )}

                {/* Search + Sort */}
                <div className="flex items-center justify-between">
                    <div className="flex w-96 items-center gap-2">
                        <Input
                            type="text"
                            placeholder="Search by form no., unit, requester, or status..."
                            value={rawSearch}
                            onChange={(e) => setRawSearch(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="flex gap-2">
                        <VerificationFormFilterDropdown
                            onApply={handleApplyFilters}
                            onClear={handleClearFilters}
                            selected_status={filters.status}
                            selected_requester={filters.requester}
                            requesterOptions={requesterOptions}
                        />

                        <SortDropdown<VerificationSortKey>
                            sortKey={sortKey}
                            sortDir={sortDir}
                            options={verificationSortOptions}
                            onChange={(key, dir) => {
                                setSortKey(key);
                                setSortDir(dir);
                            }}
                        />

                        {canCreate && (
                            <Button className="cursor-pointer" onClick={() => setShowAddModal(true)}>
                                <PlusCircle className="mr-1 h-4 w-4" />
                                Add Verification Form
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-card shadow-sm">
                    <Table className="min-w-[1120px]" containerClassName="rounded-none border-0 shadow-none">
                        <TableHeader className="sticky top-0 z-10">
                            <TableRow className="border-b border-neutral-200 bg-neutral-100 text-sm tracking-wide text-neutral-800 uppercase hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-900">
                                <TableHead className="w-[120px] px-4 py-3 text-center font-bold text-neutral-800 dark:text-neutral-100">VF No.</TableHead>
                                <TableHead className="min-w-[220px] px-4 py-3 text-center font-bold text-neutral-800 dark:text-neutral-100">
                                    Unit / Department
                                </TableHead>
                                <TableHead className="min-w-[190px] px-4 py-3 text-center font-bold text-neutral-800 dark:text-neutral-100">
                                    Requester
                                </TableHead>
                                <TableHead className="w-[130px] px-4 py-3 text-center font-bold text-neutral-800 dark:text-neutral-100">
                                    Status
                                </TableHead>
                                <TableHead className="min-w-[170px] px-4 py-3 text-center font-bold text-neutral-800 dark:text-neutral-100">
                                    Verification Date
                                </TableHead>
                                <TableHead className="min-w-[160px] px-4 py-3 text-center font-bold text-neutral-800 dark:text-neutral-100">
                                    Notes
                                </TableHead>
                                <TableHead className="min-w-[190px] px-4 py-3 text-center font-bold text-neutral-800 dark:text-neutral-100">
                                    Remarks
                                </TableHead>
                                <TableHead className="w-[132px] px-4 py-3 text-center font-bold text-neutral-800 dark:text-neutral-100">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pageItems.length > 0 ? (
                                pageItems.map((vf) => {
                                    const unitName = vf.unit_or_department?.name ?? '—';
                                    const requesterName = vf.requested_by_personnel?.name || vf.requested_by_snapshot?.name || '—';

                                    return (
                                        <TableRow
                                            key={vf.id}
                                            className="group border-b border-slate-100 bg-white transition-colors last:border-0 hover:bg-blue-50/40 dark:bg-slate-950 dark:hover:bg-blue-950/20"
                                        >
                                            <TableCell className="px-4 py-4 text-center align-middle font-mono text-xs text-muted-foreground">
                                                VF-{vf.id.toString().padStart(3, '0')}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-center align-middle">
                                                <div className="mx-auto flex min-w-0 flex-col items-center gap-1">
                                                    <span className="max-w-[240px] truncate text-center font-semibold text-foreground">{unitName}</span>
                                                    <span className="max-w-[240px] truncate text-center text-xs tracking-wide text-muted-foreground">
                                                        {vf.unit_or_department?.code ? String(vf.unit_or_department.code).toUpperCase() : 'No unit code'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-center align-middle font-medium break-words whitespace-pre-wrap">
                                                {requesterName}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-center align-middle">
                                                <Badge
                                                    variant={
                                                        vf.status === 'pending'
                                                            ? 'Pending'
                                                            : vf.status === 'verified'
                                                              ? 'Completed'
                                                              : vf.status === 'rejected'
                                                                ? 'Cancelled'
                                                                : 'secondary'
                                                    }
                                                    className="capitalize"
                                                >
                                                    {formatStatusLabel(vf.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-center align-middle text-sm text-foreground">
                                                {formatDateLong(vf.verified_at)}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-center align-middle break-words whitespace-pre-wrap">
                                                {ucwords(vf.notes ?? '—')}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-center align-middle break-words whitespace-pre-wrap">
                                                {ucwords(vf.remarks ?? '—')}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-center align-middle">
                                                <DropdownMenu
                                                    modal={false}
                                                    open={openActionId === vf.id}
                                                    onOpenChange={(open) => setOpenActionId(open ? vf.id : null)}
                                                >
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 cursor-pointer rounded-full border border-transparent transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
                                                        >
                                                            <EllipsisVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl border bg-white p-2 shadow-lg">
                                                        <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                                            Actions
                                                        </DropdownMenuLabel>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem asChild disabled={!canView} className="cursor-pointer rounded-md">
                                                            <Link
                                                                href={`/verification-form/${vf.id}`}
                                                                preserveScroll
                                                                onClick={() => setOpenActionId(null)}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                                                <span>View</span>
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            className="cursor-pointer rounded-md"
                                                            onClick={() => {
                                                                setOpenActionId(null);
                                                                setManageId(vf.id);
                                                                setShowManageModal(true);
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4 text-muted-foreground" />
                                                            <span>Edit</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer rounded-md text-red-600 focus:text-red-600"
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                console.log('Delete menu clicked:', vf.id);

                                                                setOpenActionId(null);
                                                                setSelectedVerificationForDelete(vf);

                                                                setTimeout(() => {
                                                                    setShowDeleteModal(true);
                                                                }, 0);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                            <span>Delete</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem
                                                            disabled={vf.status !== 'pending' || !canVerify}
                                                            className="cursor-pointer rounded-md text-green-600 focus:text-green-600"
                                                            onClick={() => {
                                                                setOpenActionId(null);
                                                                openEditModal(vf.id);
                                                            }}
                                                        >
                                                            <ShieldCheck className="h-4 w-4 text-green-600" />
                                                            <span>Verify</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            disabled={vf.status !== 'pending' || !canVerify}
                                                            className="cursor-pointer rounded-md text-red-600 focus:text-red-600"
                                                            onClick={() => {
                                                                setOpenActionId(null);
                                                                setSelectedVerificationId(vf.id);
                                                                setActionMode('reject');
                                                                setShowEditModal(true);
                                                            }}
                                                        >
                                                            <CircleX className="h-4 w-4 text-red-500" />
                                                            <span>Reject</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-48 text-center">
                                        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-muted-foreground">
                                            <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
                                                <ClipboardCheck className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">No verification forms found</p>
                                                <p className="text-sm">Try adjusting your search, sort, or filter settings.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between">
                    <PageInfo page={page} total={sorted.length} pageSize={pageSize} label="verification forms" />
                    <Pagination page={page} total={sorted.length} pageSize={pageSize} onPageChange={setPage} />
                </div>
            </div>

            <VerificationFormAddModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                unitOrDepartments={unitOrDepartments}
                personnels={personnels}
                assets={assets}
            />

            <VerificationFormEditModal show={showEditModal} onClose={closeEditModal} verificationId={selectedVerificationId} mode={actionMode} />

            <VerificationFormManageModal
                show={showManageModal}
                onClose={() => {
                    setShowManageModal(false);
                    setManageId(null);
                }}
                verificationId={manageId}
                unitOrDepartments={unitOrDepartments}
                personnels={personnels}
                assets={assets}
                verifications={verifications}
            />
            {showDeleteModal && selectedVerificationForDelete && (
                <VerificationFormDeleteModal
                    verification={selectedVerificationForDelete}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedVerificationForDelete(null);
                    }}
                    onDelete={(id) => {
                        router.delete(route('verification-form.destroy', id), {
                            preserveScroll: true,
                            onSuccess: () => {
                                setShowDeleteModal(false);
                                setSelectedVerificationForDelete(null);
                            },
                        });
                    }}
                />
            )}

            {selectedVerification && (
                <VerificationFormViewModal open={showViewModal} onClose={closeViewVerification} viewing={selectedVerification} pmoHead={pmoHead} />
            )}
        </AppLayout>
    );
}
