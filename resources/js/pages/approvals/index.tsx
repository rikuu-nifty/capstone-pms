import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, ThumbsUp, ThumbsDown, RotateCcw, FileSignature  } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const viewPath = (formType: string, id?: number | null) => {
    if (!id) return '#';
    const map: Record<string, (id: number) => string> = {
        transfer:               (id) => `/transfers/${id}/view`,
        turnover_disposal:      (id) => `/turnover-disposal/${id}/view`,
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
    current_step_label?: string | null;
    current_step_is_external?: boolean;
    current_step_code?: string | null;
    current_step_actor?: string | null;
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
    
    const [extFor, setExtFor] = useState<{ id:number; label?:string } | null>(null);
    const [extName, setExtName] = useState('');
    const [extTitle, setExtTitle] = useState('');
    const [extNotes, setExtNotes] = useState('');

    const openExternalModal = (approval: ApprovalItem) => {
        setExtFor({ id: approval.id, label: approval.current_step_label ?? 'External Approval' });
        setExtName(''); setExtTitle(''); setExtNotes('');
    };

    const submitExternal = () => {
        if (!extFor) return;
        router.post(route('approvals.external_approve', extFor.id), {
            external_name: extName,
            external_title: extTitle,
            notes: extNotes,
        }, { preserveScroll: true, onSuccess: () => setExtFor(null) });
    };

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
                                <TableHead className="text-center">REQUIRES ACTION FROM</TableHead>
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
                                <TableCell className="text-center">
                                    {a.status === 'pending_review' && a.current_step_label && a.current_step_actor ? (
                                        <div className="leading-tight">
                                        <span className="font-medium">{a.current_step_actor}</span>
                                        {/* <span className="block text-[11px] text-muted-foreground">{a.current_step_label}</span> */}
                                        </div>
                                    ) : (
                                        '—'
                                    )}
                                </TableCell>


                                <TableCell>
                                    <div className="flex items-center justify-center gap-2">
                                        {/* View */}
                                        <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                                            <Link href={viewPath(a.form_type, a.approvable?.id)} preserveScroll>
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                        </Button>

                                        {a.status === 'pending_review' ? (
                                            a.current_step_is_external ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title={a.current_step_label ?? 'Record External Approval'}
                                                    className="cursor-pointer"
                                                    onClick={() => openExternalModal(a)}
                                                >
                                                    <FileSignature className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <>
                                                {/* Approve */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer"
                                                    title={`Approve — ${a.current_step_label ?? (a.current_step_actor ?? '')}`}
                                                    onClick={() =>
                                                        router.post(route('approvals.approve', a.id), {}, { preserveScroll: true })
                                                    }
                                                >
                                                    <ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-500" />
                                                </Button>

                                                {/* Reject */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer"
                                                    title={`Reject — ${a.current_step_label ?? (a.current_step_actor ?? '')}`}
                                                    onClick={() => {
                                                        const notes = prompt('Optional notes for rejection:') ?? '';
                                                        router.post(route('approvals.reject', a.id), { notes }, { preserveScroll: true });
                                                    }}
                                                >
                                                    <ThumbsDown className="h-4 w-4 text-destructive" />
                                                </Button>
                                                </>
                                            )
                                            ) : (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Move back to Pending Review"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                if (!confirm('Move this back to Pending Review?')) return;
                                                    router.post(route('approvals.reset', a.id), {}, { preserveScroll: true });
                                                }}
                                            >
                                                <RotateCcw className="h-4 w-4 text-green-600 dark:text-green-500" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-sm text-muted-foreground">No items found.</TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-3 flex items-center justify-end">
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

            <Dialog open={!!extFor} onOpenChange={(o) => !o && setExtFor(null)}>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>{extFor?.label ?? 'External Approval'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                    <div className="grid gap-1.5">
                        <Label htmlFor="extName">Signer Name (Dean/Head)</Label>
                        <Input id="extName" value={extName} onChange={(e)=>setExtName(e.target.value)} placeholder="e.g., Dr. Juan Dela Cruz" />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="extTitle">Title / Position (optional)</Label>
                        <Input id="extTitle" value={extTitle} onChange={(e)=>setExtTitle(e.target.value)} placeholder="e.g., Dean, College of Engineering" />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="extNotes">Notes (optional)</Label>
                        <Textarea id="extNotes" value={extNotes} onChange={(e)=>setExtNotes(e.target.value)} placeholder="Any remarks..." />
                    </div>
                    </div>

                    <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" className="cursor-pointer">Cancel</Button>
                    </DialogClose>
                    <Button onClick={submitExternal} className="cursor-pointer">Record Approval</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
