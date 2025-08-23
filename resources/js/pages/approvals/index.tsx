import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import Pagination from '@/components/Pagination';
import { useState } from 'react';

const viewPath = (formType: string, id?: number | null) => {
    if (!id) return '#';
    const map: Record<string, (id: number) => string> = {
        transfer:               (id) => `/transfers/${id}/view`,
        turnover_disposal:      (id) => `/turnover-disposals/${id}/view`,
        off_campus:             (id) => `/off-campus/${id}/view`,
        inventory_scheduling:   (id) => `/inventory-scheduling/${id}/view`,
    };
    return (map[formType]?.(id)) ?? '#';
};

type ApprovalItem = {
    id: number;
    form_type: string;
    form_title: string;
    status: 'pending_review'|'approved'|'rejected'|'cancelled';
    requested_at: string|null;
    reviewed_at: string|null;
    requested_by: { id:number; name:string }|null;
    reviewed_by: { id:number; name:string }|null;
    approvable: { id:number }|null;
};

type PageProps = {
    tab: 'pending'|'approved'|'rejected';
    q: string|null;
    approvals: {
        data: ApprovalItem[];
        current_page: number;
        per_page: number;
        total: number;
        links: { url: string|null; label: string; active: boolean }[];
    };
};

const tabs = [
    { key: 'pending',  label: 'Pending List'   },
    { key: 'approved', label: 'Approved List'  },
    { key: 'rejected', label: 'Rejected List'  },
] as const;

function StatusPill({ s }: { s: ApprovalItem['status'] }) {
    const label = s === 'pending_review' ? 'Pending' : s === 'approved' ? 'Approved' : s === 'rejected' ? 'Rejected' : 'Cancelled';
    const klass =
        s === 'pending_review' ? 'bg-yellow-200 text-yellow-900'
    : s === 'approved'       ? 'bg-emerald-200 text-emerald-900'
    : 'bg-red-200 text-red-900';
    return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${klass}`}>{label}</span>;
}

export default function ApprovalsIndex() {
    const { props } = usePage<PageProps>();
    const [search, setSearch] = useState(props.q ?? '');
    

    const onChangeTab = (key: string) => {
        router.get(route('approvals.index'), { tab: key, q: search }, { preserveState: true, preserveScroll: true });
    };

    const onSearch = (v: string) => {
        setSearch(v);
        router.get(route('approvals.index'), { tab: props.tab, q: v }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const pageData = props.approvals;

    return (
        <AppLayout breadcrumbs={[{ title: 'Form Approval', href: '/approvals' }]}>
        <Head title="Form Approval" />

        <div className="p-4">
            {/* Tabs */}
            <div className="mb-4 flex gap-2 rounded-md bg-muted p-2">
            {tabs.map(t => (
                <Button key={t.key}
                variant={props.tab === t.key ? 'default' : 'ghost'}
                className="cursor-pointer"
                onClick={() => onChangeTab(t.key)}>
                {t.label}
                </Button>
            ))}
            </div>

            {/* Header */}
            <div className="mb-4">
            <h1 className="text-xl font-semibold">Form Approval</h1>
            <p className="text-sm text-muted-foreground">
                Displays a complete list of forms awaiting review within the university to facilitate tracking & auditing.
            </p>
            </div>

            {/* Search */}
            <div className="mb-3 w-80">
            <Input placeholder="search for the date, title, or requester"
                    value={search}
                    onChange={(e) => onSearch(e.target.value)} />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted">
                        <TableHead className="text-center">FORM TITLE</TableHead>
                        <TableHead className="text-center">CREATED AT</TableHead>
                        <TableHead className="text-center">UPDATED AT</TableHead>
                        <TableHead className="text-center">REQUESTED BY</TableHead>
                        <TableHead className="text-center">STATUS</TableHead>
                        <TableHead className="text-center">ACTION</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="text-center">
                {pageData.data.length ? pageData.data.map(a => (
                    <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.form_title}</TableCell>
                    <TableCell>{a.requested_at ? new Date(a.requested_at).toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' }) : '—'}</TableCell>
                    <TableCell>{a.reviewed_at  ? new Date(a.reviewed_at ).toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' }) : '—'}</TableCell>
                    <TableCell>{a.requested_by?.name ?? '—'}</TableCell>
                    <TableCell><StatusPill s={a.status} /></TableCell>
                    <TableCell>
                        <div className="flex items-center justify-center gap-2">
                        {a.status === 'pending_review' ? (
                            <>
                            <Link href={viewPath(a.form_type, a.approvable?.id)}>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="cursor-pointer"
                                >
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                                onClick={() => router.post(route('approvals.approve', a.id), {}, { preserveScroll: true })}
                            >
                                <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                                onClick={() => {
                                    const notes = prompt('Optional notes for rejection:') ?? '';
                                    router.post(route('approvals.reject', a.id), { notes }, { preserveScroll: true });
                                }}
                            >
                                <X className="h-4 w-4 text-destructive" />
                            </Button>
                            </>
                        ) : (
                            <Badge variant="secondary">No actions</Badge>
                        )}
                        </div>
                    </TableCell>
                    </TableRow>
                )) : (
                    <TableRow><TableCell colSpan={6} className="text-sm text-muted-foreground">No items found.</TableCell></TableRow>
                )}
                </TableBody>
            </Table>
            </div>

            {/* Pagination */}
            <div className="mt-3 flex items-center justify-end">
            {/* If you have your shared <Pagination /> component that accepts links, use it; otherwise link buttons: */}
            <div className="flex gap-2">
                {pageData.links.map((lnk, i) => (
                <Button key={i}
                    size="sm"
                    variant={lnk.active ? 'default' : 'outline'}
                    disabled={!lnk.url}
                    className="cursor-pointer"
                    onClick={() => lnk.url && router.visit(lnk.url, { preserveScroll: true, preserveState: true })}>
                    {lnk.label.replace('&laquo;','Prev').replace('&raquo;','Next')}
                </Button>
                ))}
            </div>
            </div>
        </div>
        </AppLayout>
    );
}
