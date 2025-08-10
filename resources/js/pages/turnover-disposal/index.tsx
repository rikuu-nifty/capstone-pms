import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem} from '@/types';
// import { Head, router, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
// import { useState, useMemo, useEffect } from 'react';
import { useState, useEffect } from 'react';
import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';

import useDebouncedValue from '@/hooks/useDebouncedValue';
import SortDropdown, { SortDir } from '@/components/filters/SortDropdown';

import { TurnoverDisposalPageProps } from '@/types/page-props';
import { formatStatusLabel, statusVariantMap, formatEnums } from '@/types/custom-index';
// import TurnoverDisposalAddModal from './TurnoverDisposalAddModal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Turnover and Disposals',
        href: '/turnover-disposals',
    },
];

const turnoverSortOptions = [
    { value: 'id', label: 'Record ID' },
    { value: 'document_date', label: 'Document Date' },
    { value: 'asset_count', label: 'Asset Count' },
] as const;

type TurnoverSortKey = (typeof turnoverSortOptions)[number]['value'];



export default function TurnoverDisposalsIndex({
    turnoverDisposals,
    // turnoverDisposalAssets,
    // assignedBy,
    // unitOrDepartments,
    asset_count,
    
}: TurnoverDisposalPageProps) {

    const [selected_status, setSelectedStatus] = useState('');
    const [selected_org, setSelectedOrg] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('id');
        const [sortDir, setSortDir] = useState<SortDir>('desc');

    const [page, setPage] = useState(1);
    const page_size = 20;

    const start = (page - 1) * page_size;
    const page_items = turnoverDisposals.slice(start, start + page_size);

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200);

    useEffect(() => {
            setPage(1);
        }, [
            search, 
            selected_status, 
            selected_org, 
            sortKey, 
            sortDir
        ]
    );
    // const [showAddTurnoverDisposals, setShowAddTurnoverDisposals] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title = "Turnover / Disposals" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Turnover/Disposals</h1>
                        <p className="text-sm text-muted-foreground">
                            List of scheduled and completed turnover/disposal records.
                        </p>
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="Search by status or unit/dept..."
                                value={rawSearch}
                                onChange={(e) => setRawSearch(e.target.value)}
                                className="max-w-xs"
                            />
                        </div>

                    {/* <div className="text-xs text-muted-foreground">
                        Showing {sortedTurnoverDisposals.length ? start + 1 : 0}–
                        {Math.min(start + page_size, filteredTurnoverDisposals.length)} of{" "}
                        {filteredTurnoverDisposals.length} filtered records
                    </div> */}

                    {/* Active filter chips */}
                    {/* <div className="flex flex-wrap gap-2 pt-1">
                        {selected_status && <Badge variant="darkOutline">Status: {formatStatusLabel(selected_status)}</Badge>}
                        {selected_building && <Badge variant="darkOutline">Current: {selected_building}</Badge>}
                        {selected_receiving_building && <Badge variant="darkOutline">Receiving: {selected_receiving_building}</Badge>}
                        {selected_org && <Badge variant="darkOutline">Unit/Dept: {selected_org}</Badge>}
                        {(selected_status || selected_building || selected_receiving_building || selected_org) && (
                            <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={clearFilters}
                                className="cursor-pointer"
                            >
                                Clear filters
                            </Button>
                        )}
                    </div> */}
                </div>
                    
                    <div className="flex gap-2">
                        {/* <Filter className="mr-1 h-4 w-4" /> Filter */}

                        <SortDropdown<TurnoverSortKey>
                            sortKey="document_date"
                            sortDir="asc"
                            options={turnoverSortOptions}
                            onChange={(key, dir) => {
                                console.log('Sorting turnover/disposals by', key, dir);
                            }}
                        />

                        {/* <TransferFilterDropdown
                            onApply={applyFilters}
                            onClear={clearFilters}
                            selected_status={selected_status}
                            selected_building={selected_building}
                            selected_receiving_building={selected_receiving_building}
                            selected_org={selected_org}
                            buildings={buildings}
                            unitOrDepartments={unitOrDepartments}
                        /> */}
                        <Button
                            // onClick={() => {
                            //     setShowAddTurnoverDisposals(true);
                            // }}
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
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-center">
                            {page_items.length > 0 ? (
                                page_items.map((turnoverDisposals) => (
                                    <TableRow key={turnoverDisposals.id}>
                                        <TableCell>{turnoverDisposals.id}</TableCell> {/* 1 */}
                                        <TableCell>
                                            {turnoverDisposals.issuing_office?.code}
                                        </TableCell>
                                        <TableCell>{formatEnums(turnoverDisposals.type)}</TableCell>
                                        <TableCell>
                                            {turnoverDisposals.receiving_office?.code}
                                        </TableCell>
                                        <TableCell>{ turnoverDisposals.description ?? '—'}</TableCell>
                                        <TableCell>{asset_count}</TableCell>
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
                                                // onClick={() => {
                                                //     setSelectedTransfer(transfer);
                                                //     setShowEditTransfer(true);
                                                // }}
                                                className="cursor-pointer"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                // onClick={() => {
                                                //     setTransferToDelete(transfer);
                                                //     setShowDeleteModal(true);
                                                // }}
                                                className="cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                className="cursor-pointer"
                                                // onClick={() => 
                                                //     openViewTransfer(transfer)
                                                // }
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
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
            </div>

            {/* <TurnoverDisposalAddModal
                show={showAddTurnoverDisposals}
            /> */}
        </AppLayout>
    );
}
