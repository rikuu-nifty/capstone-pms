import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem} from '@/types';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import { Eye, Pencil, PlusCircle, Trash2, Inbox, RefreshCw, BarChart3, XCircle } from 'lucide-react';

import useDebouncedValue from '@/hooks/useDebouncedValue';
import SortDropdown, { SortDir } from '@/components/filters/SortDropdown';
import TurnoverDisposalFilterDropdown, { type TurnoverDisposalFilters } from '@/components/filters/TurnoverDisposalFilterDropdown';

import { TurnoverDisposalPageProps } from '@/types/page-props';
import { formatStatusLabel, statusVariantMap, formatEnums, TurnoverDisposals } from '@/types/custom-index';
import TurnoverDisposalAddModal from './TurnoverDisposalAddModal';
import TurnoverDisposalEditModal from './TurnoverDisposalEditModal';
import TurnoverDisposalViewModal, { InventoryListWithSnake } from './TurnoverDisposalViewModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import Pagination, { PageInfo } from '@/components/Pagination';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Turnover and Disposals',
        href: '/turnover-disposal',
    },
];

const turnoverSortOptions = [
    { value: 'id', label: 'Record ID' },
    { value: 'document_date', label: 'Document Date' },
    { value: 'asset_count', label: 'Asset Count' },
] as const;

type TurnoverSortKey = (typeof turnoverSortOptions)[number]['value'];

type PageProps = TurnoverDisposalPageProps & {
    viewing?: TurnoverDisposals;
    pmoHead?: { id: number; name: string } | null;
    signatories: Record<string, { name: string; title: string }>;
};

const formatDateLong = (d?: string | null) => {
    if (!d) return '—';

    // Handle ranges like "2025-10-08:2025-10-08" or "2025-10-08 00:00:00"
    const datePart = d.split(':')[0].trim(); // only take the first part before ':'
    const safeDate = datePart.includes('T') ? datePart : `${datePart}T00:00:00`;

    const dt = new Date(safeDate);

    if (isNaN(dt.getTime())) return '—';

    return dt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};


export default function TurnoverDisposalsIndex({
    turnoverDisposals = [],
    assets= [],
    assignedBy,
    unitOrDepartments = [],
    totals,
}: TurnoverDisposalPageProps ) {

    const { props } = usePage<PageProps>();
    const viewing = props.viewing;

    const { auth } = usePage().props as unknown as {
        auth: {
            permissions: string[];
        };
    };

    const canCreate = auth.permissions.includes('create-turnover-disposal');
    const canEdit = auth.permissions.includes('update-turnover-disposal');
    const canDelete = auth.permissions.includes('delete-turnover-disposal');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [turnoverDisposalToDelete, setTurnoverDisposalToDelete] = useState<TurnoverDisposals | null>(null);

    const [showAddTurnoverDisposals, setShowAddTurnoverDisposals] = useState(false);
    const [showEditTurnoverDisposals, setShowEditTurnoverDisposals] = useState(false);
    const [showViewTurnoverDisposals, setShowViewTurnoverDisposals] = useState(false);

    const [selectedTurnoverDisposals, setSelectedTurnoverDisposals] = useState<TurnoverDisposals | null>(null);
    const [selectedTurnoverDisposalAssets, setSelectedTurnoverDisposalAssets] = useState<InventoryListWithSnake[]>([]);

    const openViewTurnoverDisposal = (td: TurnoverDisposals) => {
        setSelectedTurnoverDisposals(td);
        setSelectedTurnoverDisposalAssets(
            (td.turnover_disposal_assets ?? [])
            .map(ta => ta.assets)
            .filter(Boolean) as InventoryListWithSnake[]
        );
        setShowViewTurnoverDisposals(true);
    };

    useEffect(() => {
        if (!viewing) return;
        openViewTurnoverDisposal(viewing);
    }, [
        viewing
    ]);

    const closeViewTurnoverDisposal = () => {
        setShowViewTurnoverDisposals(false);
        setSelectedTurnoverDisposals(null);
        setSelectedTurnoverDisposalAssets([]);

        if (/\/turnover-disposal\/\d+\/view$/.test(window.location.pathname)) {
            history.back();
        }
    };

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200);

    const [selected_status, setSelected_status] = useState('');
    const [selected_type, setSelected_type] = useState('');
    const [selected_issuing_office, setSelected_issuing_office] = useState('');

    const [selected_turnover_category, setSelected_turnover_category] = useState('');
    const [selected_is_donation, setSelected_is_donation] = useState('');

    const clearFilters = () => {
        setSelected_status('');
        setSelected_type('');
        setSelected_issuing_office('');

        setSelected_turnover_category('');
        setSelected_is_donation('');
    };
    
    const applyFilters = (f: TurnoverDisposalFilters) => {
        setSelected_status(f.status);
        setSelected_type(f.type);
        setSelected_issuing_office(f.issuing_office_id);

        setSelected_turnover_category(f.turnover_category);
        setSelected_is_donation(f.is_donation);
    };

    const [sortKey, setSortKey] = useState<TurnoverSortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const [page, setPage] = useState(1);
    const page_size = 20;

    useEffect(() => { 
        setPage(1); 
    }, [
        search,
        selected_status,
        selected_type,
        selected_issuing_office,
        sortKey,
        sortDir,
    ]);

    const filteredTurnoverDisposals = useMemo(() => {
        const term = search.trim().toLowerCase();

        return turnoverDisposals.filter((td) => {
        const haystack = `
            ${td.issuing_office?.code ?? ''}
            ${td.status ?? ''}
            ${td.type ?? ''}
            ${td.description ?? ''}
        `.toLowerCase();

        const matchesSearch = !term || haystack.includes(term);

        const statusValue = (td.status || '').toString().toLowerCase();
        const typeValue = (td.type || '').toString().toLowerCase();
        const issuingCode = td.issuing_office?.code ?? '';
        const categoryValue = td.turnover_category ?? '';
        const donationValue = td.is_donation ? '1' : '0';

        const matchesStatus = !selected_status || statusValue === selected_status;
        const matchesType = !selected_type || typeValue === selected_type;
        const matchesIssuing = !selected_issuing_office || issuingCode === selected_issuing_office;
        const matchesCategory = !selected_turnover_category || categoryValue === selected_turnover_category;
        const matchesDonation = !selected_is_donation || donationValue === selected_is_donation;

        return matchesSearch && matchesStatus && matchesType && matchesIssuing && matchesCategory && matchesDonation;
        });
    }, [
        turnoverDisposals,
        search,
        selected_status,
        selected_type,
        selected_issuing_office,
        selected_turnover_category,
        selected_is_donation,
    ]);

    const sortValue = useMemo<Record<TurnoverSortKey, (td: TurnoverDisposals) => number>>(() => (
        {
            id: (td) => Number(td.id) || 0,
            document_date: (td) => Date.parse(td.document_date ?? '') || 0,
            asset_count: (td) => Number(td.asset_count) || 0,
        }),
        []
    );

    const sortedTurnoverDisposals = useMemo(() => {
        const get = sortValue[sortKey];
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filteredTurnoverDisposals].sort((a, b) => {
        const d = get(a) - get(b);
        return (d !== 0 ? d : (Number(a.id) - Number(b.id))) * dir;
        });
    }, [
        filteredTurnoverDisposals, 
        sortKey, 
        sortDir, 
        sortValue
    ]);

    const start = (page - 1) * page_size;
    const page_items = sortedTurnoverDisposals.slice(start, start + page_size);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title = "Turnover / Disposals" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Turnover/Disposals</h1>
                    <p className="text-sm text-muted-foreground">
                    List of turnover/disposal records.
                    </p>
                </div>

                {/* KPI Cards */}
                {totals && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        {/* Pending Review (This Month) */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                                <Inbox className="h-7 w-7 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Pending Review (This Month)</div>
                                <div className="text-3xl font-bold">{totals.pending_review_this_month}</div>
                            </div>
                        </div>

                        {/* Turnover vs Disposal (This Month) */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                <RefreshCw className="h-7 w-7 text-blue-600" />
                            </div>
                            <div>
                            <div className="text-sm text-muted-foreground">Turnover vs Disposal (This Month)</div>
                                <div className="text-lg font-semibold">
                                    <span className="text-blue-600">{totals.turnover_percentage_month}% Turnover</span>
                                    <span className="text-muted-foreground"> / </span>
                                    <span className="text-purple-600">{totals.disposal_percentage_month}% Disposal</span>
                                </div>
                            </div>
                        </div>

                        {/* Turnover vs Disposal (Overall) */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                                <BarChart3 className="h-7 w-7 text-indigo-600" />
                            </div>
                            <div>
                            <div className="text-sm text-muted-foreground">Turnover vs Disposal (Overall)</div>
                                <div className="text-lg font-semibold">
                                    <span className="text-blue-600">{totals.turnover_percentage_all}% Turnover</span>
                                    <span className="text-muted-foreground"> / </span>
                                    <span className="text-purple-600">{totals.disposal_percentage_all}% Disposal</span>
                                </div>
                            </div>
                        </div>

                        {/* Cancellation Rate */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                <XCircle className="h-7 w-7 text-red-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Cancellation Rate</div>
                                <div className="text-3xl font-bold">{totals.cancellation_rate}%</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search + Filters + Add Button Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 w-96">
                        <Input
                            type="text"
                            placeholder="Search by status, type, or office..."
                            value={rawSearch}
                            onChange={(e) => setRawSearch(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="flex gap-2">
                        <SortDropdown<TurnoverSortKey>
                            sortKey={sortKey}
                            sortDir={sortDir}
                            options={turnoverSortOptions}
                            onChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
                        />

                        <TurnoverDisposalFilterDropdown
                            onApply={applyFilters}
                            onClear={clearFilters}
                            selected_status={selected_status}
                            selected_type={selected_type}
                            selected_issuing_office={selected_issuing_office}
                            selected_turnover_category={selected_turnover_category}
                            selected_is_donation={selected_is_donation}

                            unitOrDepartments={unitOrDepartments}
                        />

                        {canCreate && (
                            <Button
                                onClick={() => {
                                    setShowAddTurnoverDisposals(true);
                                }}
                                className="cursor-pointer"
                            >
                                <PlusCircle className="mr-1 h-4 w-4 cursor-pointer" /> Add New Turnover/Disposal
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader >
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Issuing Office Code</TableHead>
                                <TableHead className="text-center">Type</TableHead>
                                <TableHead className="text-center">Turnover Category</TableHead>
                                <TableHead className="text-center">For Donation</TableHead>
                                <TableHead className="text-center">Receiving Office Code</TableHead>
                                {/* <TableHead className="text-center">Description</TableHead> */}
                                <TableHead className="text-center">Asset Count</TableHead>
                                <TableHead className="text-center">Document Date</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-center">
                            {page_items.length > 0 ? (
                                page_items.map((turnoverDisposals) => (
                                    <TableRow key={turnoverDisposals.id}>
                                        <TableCell>{turnoverDisposals.id}</TableCell>
                                        <TableCell>
                                            {(formatEnums(turnoverDisposals.issuing_office?.code)).toUpperCase()}
                                        </TableCell>
                                        <TableCell>{formatEnums(turnoverDisposals.type)}</TableCell>
                                        <TableCell>
                                            {turnoverDisposals.turnover_category
                                                ? formatEnums(turnoverDisposals.turnover_category)
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {turnoverDisposals.is_donation
                                                ? (
                                                <Badge variant="success" className="text-xs px-2 py-1 bg-green-100 text-green-700 border border-green-300">
                                                    Yes
                                                </Badge>
                                                ) : (
                                                <Badge variant="outline" className="text-xs px-2 py-1 text-gray-500">
                                                    No
                                                </Badge>
                                                )}
                                        </TableCell>
                                        <TableCell>
                                            {(formatEnums(turnoverDisposals.receiving_office?.code).toUpperCase())}
                                        </TableCell>
                                        {/* <TableCell>{ turnoverDisposals.description ?? '—'}</TableCell> */}
                                        <TableCell>{ turnoverDisposals.asset_count }</TableCell>
                                        <TableCell>{ formatDateLong(turnoverDisposals.document_date) }</TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={statusVariantMap[turnoverDisposals.status.toLowerCase()] ?? 'secondary'}
                                            >
                                                {formatStatusLabel(turnoverDisposals.status.toLowerCase())}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="flex justify-center items-center gap-2">
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedTurnoverDisposals(turnoverDisposals);
                                                        setShowEditTurnoverDisposals(true);
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {canDelete && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => {
                                                        setTurnoverDisposalToDelete(turnoverDisposals);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                            
                                            {/* <Button 
                                                variant="ghost" 
                                                size="icon"
                                                className="cursor-pointer"
                                                onClick={() => 
                                                    openViewTurnoverDisposal(turnoverDisposals)
                                                }
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Button> */}
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                asChild 
                                                className="cursor-pointer">
                                                <Link 
                                                    href={`/turnover-disposal/${turnoverDisposals.id}/view`} 
                                                    preserveScroll
                                                >
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Link>
                                            </Button>

                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                                        No turnover or disposal records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    
                </div>
                <div className="flex items-center justify-between mt-3">
                <PageInfo
                    page={page}
                    total={sortedTurnoverDisposals.length}
                    pageSize={page_size}
                    label="turnover/disposal records"
                />
                <Pagination
                    page={page}
                    total={sortedTurnoverDisposals.length}
                    pageSize={page_size}
                    onPageChange={setPage}
                />
                </div>


            </div>

            {/* <pre>{JSON.stringify(turnoverDisposals, null, 2)}</pre> */}

            <TurnoverDisposalAddModal
                show={showAddTurnoverDisposals}
                onClose={() => setShowAddTurnoverDisposals(false)}
                assignedBy={assignedBy}
                unitOrDepartments={unitOrDepartments}
                assets={assets}
                personnels={props.personnels}
            />

            {selectedTurnoverDisposals && (
                <TurnoverDisposalEditModal
                    show={showEditTurnoverDisposals}
                    onClose={() => {
                        setShowEditTurnoverDisposals(false);
                        setSelectedTurnoverDisposals(null);
                    }}
                    turnoverDisposal={selectedTurnoverDisposals}
                    unitOrDepartments={unitOrDepartments}
                    assets={assets}
                    personnels={props.personnels}
                />
            )}

            {selectedTurnoverDisposals && (
                <TurnoverDisposalViewModal
                    open={showViewTurnoverDisposals}
                    onClose={closeViewTurnoverDisposal}
                    turnoverDisposal={selectedTurnoverDisposals}
                    assets={selectedTurnoverDisposalAssets}
                    signatories={props.signatories}
                    pmoHead={props.pmoHead}
                />
            )}

            <DeleteConfirmationModal
                show={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    if (turnoverDisposalToDelete) {
                        router.delete(`/turnover-disposal/${turnoverDisposalToDelete.id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setShowDeleteModal(false);
                                setTurnoverDisposalToDelete(null);
                            },
                        });
                    }
                }}
            />
        </AppLayout>
    );
}
