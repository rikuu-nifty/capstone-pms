import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import Pagination, { PageInfo } from '@/components/Pagination';

interface TrashRecord {
    id: number;
    deleted_at: string;
    asset_name?: string;
    inventory_schedule?: string;
    remarks?: string;
    description?: string;
    requester_name?: string;
    [key: string]: unknown;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
}

type TrashBinProps = {
    inventory_lists: PaginatedData<TrashRecord>;
    inventory_schedulings: PaginatedData<TrashRecord>;
    transfers: PaginatedData<TrashRecord>;
    turnover_disposals: PaginatedData<TrashRecord>;
    off_campuses: PaginatedData<TrashRecord>;
    filters: {
        date_filter: string;
        start?: string;
        end?: string;
        per_page: number;
    };
};

const tabs = [
    { key: 'inventory_lists', label: 'Inventory Lists' },
    { key: 'inventory_schedulings', label: 'Inventory Schedulings' },
    { key: 'transfers', label: 'Transfers' },
    { key: 'turnover_disposals', label: 'Turnover/Disposals' },
    { key: 'off_campuses', label: 'Off-Campuses' },
] as const;

export default function TrashBinIndex({
    inventory_lists,
    inventory_schedulings,
    transfers,
    turnover_disposals,
    off_campuses,
    filters,
}: TrashBinProps) {
    const [activeTab, setActiveTab] = useState<typeof tabs[number]['key']>('inventory_lists');

    const dataMap: Partial<Record<typeof tabs[number]['key'], PaginatedData<TrashRecord>>> = {
        inventory_lists,
        inventory_schedulings,
        transfers,
        turnover_disposals,
        off_campuses,
    };

    const activeData = dataMap[activeTab];

    const handleRestore = (type: string, id: number) => {
        router.post(`/trash-bin/restore/${type}/${id}`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Trash Bin" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Trash Bin</h1>
                        <p className="text-sm text-muted-foreground">
                            Archived records across all modules.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b">
                    {tabs.map((t) => (
                        <Button
                            key={t.key}
                            variant={activeTab === t.key ? 'default' : 'outline'}
                            className="rounded-none"
                            onClick={() => setActiveTab(t.key)}
                        >
                            {t.label}
                        </Button>
                    ))}
                </div>

                {/* Table */}
                <div className="rounded-lg border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name/Title</TableHead>
                                <TableHead>Deleted At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeData?.data?.length ? (
                                activeData.data.map((row: TrashRecord) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>
                                            {row.asset_name ||
                                            row.inventory_schedule ||
                                            row.remarks ||
                                            row.description ||
                                            row.requester_name ||
                                            '—'}
                                        </TableCell>
                                        <TableCell>{row.deleted_at}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                onClick={() => handleRestore(activeTab.replace(/s$/, ''), row.id)}
                                            >
                                                Restore
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {activeData && (
                    <div className="flex justify-between items-center">
                        <PageInfo
                            page={activeData.current_page}
                            total={activeData.total}
                            pageSize={activeData.per_page}
                            label={activeTab.replace('_', ' ')}
                        />
                        <Pagination
                            page={activeData.current_page}
                            total={activeData.total}
                            pageSize={activeData.per_page}
                            onPageChange={(p) =>
                                router.get('/trash-bin', { ...filters, page: p }, { preserveState: true })
                            }
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
