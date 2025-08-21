import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem} from '@/types';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';

import useDebouncedValue from '@/hooks/useDebouncedValue';
import SortDropdown, { SortDir } from '@/components/filters/SortDropdown';
import TurnoverDisposalFilterDropdown, { type TurnoverDisposalFilters } from '@/components/filters/TurnoverDisposalFilterDropdown';

import { TurnoverDisposalPageProps } from '@/types/page-props';
import { formatDate, formatStatusLabel, statusVariantMap, formatEnums, TurnoverDisposals } from '@/types/custom-index';
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
    viewing?: TurnoverDisposals; // set in Controller@show
};

export default function TurnoverDisposalsIndex({
    turnoverDisposals = [],
    assets= [],
    assignedBy,
    unitOrDepartments = [],
}: TurnoverDisposalPageProps ) {

    const { props } = usePage<PageProps>();
    const viewing = props.viewing;

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

    const clearFilters = () => {
        setSelected_status('');
        setSelected_type('');
        setSelected_issuing_office('');
    };
    
    const applyFilters = (f: TurnoverDisposalFilters) => {
        setSelected_status(f.status);
        setSelected_type(f.type);
        setSelected_issuing_office(f.issuing_office_id);
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

        const matchesStatus = !selected_status || statusValue === selected_status;
        const matchesType = !selected_type || typeValue === selected_type;
        const matchesIssuing = !selected_issuing_office || issuingCode === selected_issuing_office;

        return matchesSearch && matchesStatus && matchesType && matchesIssuing;
        });
    }, [
        turnoverDisposals,
        search,
        selected_status,
        selected_type,
        selected_issuing_office,
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
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Turnover/Disposals</h1>
                        <p className="text-sm text-muted-foreground">
                            List of turnover/disposal records.
                        </p>
                        <div className="flex items-center gap-2 w-96">
                            <Input
                                type="text"
                                placeholder="Search by status, type, or office..."
                                value={rawSearch}
                                onChange={(e) => setRawSearch(e.target.value)}
                                className="max-w-xs"
                            />
                        </div>

                        <div className="text-xs text-muted-foreground">
                            Showing {sortedTurnoverDisposals.length ? start + 1 : 0}–
                            {Math.min(start + page_size, filteredTurnoverDisposals.length)} of {filteredTurnoverDisposals.length} filtered records
                        </div>

                        {/* Active filter chips */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            {selected_status && <Badge variant="darkOutline">Status: {formatStatusLabel(selected_status)}</Badge>}
                            {selected_type && <Badge variant="darkOutline">Type: {formatEnums(selected_type)}</Badge>}
                            {selected_issuing_office && <Badge variant="darkOutline">Issuing: {selected_issuing_office}</Badge>}

                            {(selected_status || selected_type || selected_issuing_office) && (
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
                            unitOrDepartments={unitOrDepartments}
                        />

                        <Button
                            onClick={() => {
                                setShowAddTurnoverDisposals(true);
                            }}
                            className="cursor-pointer"
                        >
                            <PlusCircle className="mr-1 h-4 w-4 cursor-pointer" /> Add New Turnover/Disposal
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader >
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">ID</TableHead> {/* 1 */}
                                <TableHead className="text-center">Issuing Office</TableHead>
                                <TableHead className="text-center">Type</TableHead>
                                <TableHead className="text-center">Receiving Office</TableHead>
                                <TableHead className="text-center">Description</TableHead>
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
                                            {turnoverDisposals.issuing_office?.code}
                                        </TableCell>
                                        <TableCell>{formatEnums(turnoverDisposals.type)}</TableCell>
                                        <TableCell>
                                            {turnoverDisposals.receiving_office?.code}
                                        </TableCell>
                                        <TableCell>{ turnoverDisposals.description ?? '—'}</TableCell>
                                        <TableCell>{ turnoverDisposals.asset_count }</TableCell>
                                        <TableCell>{ formatDate(turnoverDisposals.document_date) }</TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={statusVariantMap[turnoverDisposals.status.toLowerCase()] ?? 'secondary'}
                                            >
                                                {formatStatusLabel(turnoverDisposals.status.toLowerCase())}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="flex justify-center items-center gap-2">
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
                />
            )}

            {selectedTurnoverDisposals && (
                <TurnoverDisposalViewModal
                    open={showViewTurnoverDisposals}
                    onClose={closeViewTurnoverDisposal}
                    turnoverDisposal={selectedTurnoverDisposals}
                    assets={selectedTurnoverDisposalAssets}
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
