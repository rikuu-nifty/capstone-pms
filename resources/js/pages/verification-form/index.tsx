import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { ClipboardCheck, Clock4, CalendarCheck, PlusCircle  } from 'lucide-react';
import SortDropdown, { SortDir } from '@/components/filters/SortDropdown';
import Pagination, { PageInfo } from '@/components/Pagination';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { formatStatusLabel, ucwords } from '@/types/custom-index';

import VerificationFormAddModal from './VerificationFormAddModal';
import VerificationFormManageModal from './VerificationFormManageModal';
import VerificationFormEditModal from './VerificationFormEditModal';
import VerificationFormViewModal from './VerificationFormViewModal';
import VerificationFormFilterDropdown from '@/components/filters/VerificationFormFilterDropdown';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Verification Form', href: '/verification-form' },
];

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

type VerificationFormRecord = {
    id: number;
    status: string;
    notes?: string | null;
    remarks?: string | null;
    verified_at?: string | null;
    verified_by?: { id: number; name: string } | null;

    unit_or_department?: { name?: string; code?: string } | null;
    requested_by_personnel?: { id: number; name: string; title?: string } | null;
    requested_by_snapshot?: { name?: string | null; title?: string | null; contact?: string | null } | null;
};

type InventoryLite = {
    id: number;
    unit_or_department_id: number;
    asset_name: string;
    serial_no?: string | null;
};

type VerificationFormFull = {
    id: number;
    document_date?: string; // kept optional so your modal doesn’t crash if it reads it
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
    pmo_head?: { id: number; name: string } | null;

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
    // const { verifications, totals, unitOrDepartments, personnels } = usePage<PageProps>().props;
    // const { verifications, totals, unitOrDepartments, personnels, viewing, pmoHead, assets } = usePage<PageProps>().props;
    const { verifications, totals, unitOrDepartments, personnels, viewing, assets } = usePage<PageProps>().props;

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

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVerificationId, setSelectedVerificationId] = useState<number | null>(null);

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedVerification, setSelectedVerification] = useState<ViewingVerification | null>(null);
    const [actionMode, setActionMode] = useState<VerificationAction>('verify');

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
        const matchesRequester =
            !filterTerm ||
            unitName.toLowerCase() === filterTerm ||
            reqName.toLowerCase() === filterTerm;

        return matchesSearch && matchesStatus && matchesRequester;
        });
    }, [verifications.data, search, filters]);

    // UPDATED: sort by id or verified_at
    const sorted = useMemo(() => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => {
        const getValue = (vf: VerificationFormRecord) =>
            sortKey === 'verified_at'
            ? Date.parse(vf.verified_at ?? '') || 0
            : Number(vf.id) || 0;
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
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                <CalendarCheck className="h-7 w-7 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Verified This Month</div>
                                <div className="text-3xl font-bold">{totals.verified_this_month}</div>
                            </div>
                        </div>

                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <ClipboardCheck className="h-7 w-7 text-green-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Verified</div>
                                <div className="text-3xl font-bold">{totals.total_verified}</div>
                            </div>
                        </div>

                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                                <Clock4 className="h-7 w-7 text-yellow-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Pending Verification</div>
                                <div className="text-3xl font-bold">{totals.pending_verification}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search + Sort */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 w-96">
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
                            <Button
                                className="cursor-pointer"
                                onClick={() => setShowAddModal(true)}
                            >
                                <PlusCircle className="mr-1 h-4 w-4" />
                                Add Verification Form
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="w-[120px] text-center">VF No.</TableHead>
                                <TableHead className="w-[180px] text-center">Unit / Department</TableHead>
                                <TableHead className="w-[200px] text-center">Requester</TableHead>
                                <TableHead className="w-[120px] text-center">Status</TableHead>
                                <TableHead className="w-[150px] text-center">Verification Date</TableHead>
                                <TableHead className="w-[150px] text-center">Notes</TableHead>
                                <TableHead className="w-[180px] text-center">Remarks</TableHead>
                                <TableHead className="w-[160px] text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-center">
                            {pageItems.length > 0 ? (pageItems.map((vf) => {
                                const unitName = vf.unit_or_department?.name ?? '—';
                                const requesterName = vf.requested_by_personnel?.name || vf.requested_by_snapshot?.name || '—';

                                return (
                                    <TableRow key={vf.id}>
                                        <TableCell>VF-{vf.id.toString().padStart(3, '0')}</TableCell>
                                        <TableCell>{unitName}</TableCell>
                                        <TableCell className="whitespace-pre-wrap break-words">{requesterName}</TableCell>
                                        <TableCell>
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
                                        <TableCell>{formatDateLong(vf.verified_at)}</TableCell>
                                        <TableCell className="whitespace-pre-wrap break-words">{ucwords(vf.notes ?? '—')}</TableCell>
                                        <TableCell className="whitespace-pre-wrap break-words">{ucwords(vf.remarks ?? '—')}</TableCell>
                                        <TableCell className="flex justify-center gap-2">
                                            <Button
                                                asChild
                                                className="cursor-pointer"
                                                variant={canView ? 'default' : 'outline'}
                                                disabled={!canView}
                                            >
                                                <Link href={`/verification-form/${vf.id}`} preserveScroll>
                                                    View
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setManageId(vf.id);
                                                    setShowManageModal(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="success"
                                                className="font-semibold cursor-pointer disabled:bg-gray-600"
                                                disabled={vf.status !== 'pending' || !canVerify}
                                                onClick={() => openEditModal(vf.id)}
                                            >
                                                Verify
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="font-semibold cursor-pointer disabled:bg-gray-600"
                                                disabled={vf.status !== 'pending' || !canVerify}
                                                onClick={() => {
                                                    setSelectedVerificationId(vf.id);
                                                    setActionMode('reject');
                                                    setShowEditModal(true);
                                                }}
                                            >
                                                Reject
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                                        No verification forms found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
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

            <VerificationFormEditModal
                show={showEditModal}
                onClose={closeEditModal}
                verificationId={selectedVerificationId}
                mode={actionMode}
            />

            <VerificationFormManageModal
                show={showManageModal}
                onClose={() => {
                    setShowManageModal(false);
                    setManageId(null);
                }}
                verificationId={manageId}
            />

            {selectedVerification && (
                <VerificationFormViewModal
                    open={showViewModal}
                    onClose={closeViewVerification}
                    viewing={selectedVerification}
                    // pmoHead={pmoHead}
                />
            )}
        </AppLayout>
    );
}
