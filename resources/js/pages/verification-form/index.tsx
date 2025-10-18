import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import SortDropdown, { SortDir } from '@/components/filters/SortDropdown';
import Pagination, { PageInfo } from '@/components/Pagination';
import type { BreadcrumbItem } from '@/types';
import { formatStatusLabel } from '@/types/custom-index';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory', href: '#' },
    { title: 'Verification Forms', href: '/verification-form' },
];

const sortOptions = [
    { value: 'id', label: 'Record ID' },
    { value: 'document_date', label: 'Document Date' },
] as const;

type VerificationTurnover = {
    id: number;
    document_date: string;
    status: string;
    issuing_office?: { name?: string };
    receiving_office?: { name?: string };
};

type SortKey = (typeof sortOptions)[number]['value'];

export default function VerificationFormIndex() {
    const { turnovers } = (usePage().props as unknown as {
        turnovers: {
            data: VerificationTurnover[];
            total: number;
            per_page: number;
            current_page: number;
        };
    });

    const [rawSearch, setRawSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const search = rawSearch.trim().toLowerCase();

    const filtered = useMemo(() => {
        return turnovers.data.filter((t) => {
        const haystack = `
            ${t.id} ${t.issuing_office?.name ?? ''} ${t.receiving_office?.name ?? ''} ${t.status ?? ''}
        `.toLowerCase();
        return !search || haystack.includes(search);
        });
    }, [turnovers.data, search]);

    const sorted = useMemo(() => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => {
        if (sortKey === 'document_date') {
            const da = new Date(a.document_date).getTime();
            const db = new Date(b.document_date).getTime();
            return (da - db) * dir;
        }
        return (a.id - b.id) * dir;
        });
    }, [filtered, sortKey, sortDir]);

    const [page, setPage] = useState(1);
    const pageSize = 10;
    const start = (page - 1) * pageSize;
    const pageItems = sorted.slice(start, start + pageSize);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Verification Forms" />

        <div className="flex flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold">Verification Forms</h1>
                <p className="text-sm text-muted-foreground">
                List of all approved/completed turnover verification forms.
                </p>
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
            </div>
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-2 w-96">
            <Input
                type="text"
                placeholder="Search by ID, office, or status..."
                value={rawSearch}
                onChange={(e) => setRawSearch(e.target.value)}
            />
            <Button variant="outline" onClick={() => setRawSearch('')}>
                <RefreshCw className="h-4 w-4 mr-1" /> Clear
            </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg overflow-x-auto border">
            <Table>
                <TableHeader>
                <TableRow className="bg-muted text-foreground">
                    <TableHead className="text-center">ID</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Issuing Office</TableHead>
                    <TableHead className="text-center">Receiving Office</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody className="text-center">
                {pageItems.length > 0 ? (
                    pageItems.map((t) => (
                    <TableRow key={t.id}>
                        <TableCell>{t.id}</TableCell>
                        <TableCell>{new Date(t.document_date).toLocaleDateString()}</TableCell>
                        <TableCell>{t.issuing_office?.name ?? '—'}</TableCell>
                        <TableCell>{t.receiving_office?.name ?? '—'}</TableCell>
                        <TableCell>{formatStatusLabel(t.status)}</TableCell>
                        <TableCell>
                        <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                            <Link href={`/verification-form/${t.id}`} preserveScroll>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                        No verification forms found.
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
        </AppLayout>
    );
}
