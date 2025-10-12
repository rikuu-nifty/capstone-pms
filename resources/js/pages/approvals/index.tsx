import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
// import { Badge } from '@/components/ui/badge';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { SharedData } from '@/types';
// import { FileSignature } from 'lucide-react';
import { useState } from 'react';

import ApproveConfirmationModal from '@/components/modals/ApproveConfirmationModal';
import RejectConfirmationModal from '@/components/modals/RejectConfirmationModal';
import ResetConfirmationModal from '@/components/modals/ResetFormApprovalModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { ucwords } from '@/types/custom-index';

const viewPath = (formType: string, id?: number | null) => {
    if (!id) return '#';
    const map: Record<string, (id: number) => string> = {
        transfer: (id) => `/transfers/${id}/view`,
        turnover_disposal: (id) => `/turnover-disposal/${id}/view`,
        off_campus: (id) => `/off-campus/${id}/view`,
        inventory_scheduling: (id) => `/inventory-scheduling/${id}/view`,
    };
    return map[formType]?.(id) ?? '#';
};

type ApprovalItem = {
    id: number;
    form_type: string;
    form_title: string;
    status: 'pending_review' | 'approved' | 'rejected' | 'cancelled';
    requested_at: string | null;
    reviewed_at: string | null;
    requested_by: { id: number; name: string } | null;
    reviewed_by: { id: number; name: string } | null;
    approvable: { id: number } | null;
    current_step_label?: string | null;
    current_step_is_external?: boolean;
    current_step_code?: string | null;
    current_step_actor?: string | null;

    current_step_actor_code?: string | null;
    can_approve?: boolean;
    can_reject?: boolean;
    can_reset?: boolean;

    review_notes?: string | null;
};

type PageProps = {
    tab: 'pending' | 'approved' | 'rejected';
    q: string | null;
    approvals: {
        data: ApprovalItem[];
        current_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
};

const tabs = [
    { key: 'pending', label: 'Pending List' },
    { key: 'approved', label: 'Approved List' },
    { key: 'rejected', label: 'Rejected List' },
] as const;

function StatusPill({ s }: { s: ApprovalItem['status'] }) {
    const label = s === 'pending_review' ? 'Pending' : s === 'approved' ? 'Approved' : s === 'rejected' ? 'Rejected' : 'Cancelled';
    const klass =
        s === 'pending_review' ? 'bg-yellow-200 text-yellow-900' : s === 'approved' ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900';
    return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${klass}`}>{label}</span>;
}

export default function ApprovalsIndex() {
    const { props } = usePage<PageProps & SharedData>();
    const userPermissions = props.auth?.permissions || [];

    const canDeleteApprovals = userPermissions.includes('delete-form-approvals');
    const canApproveApprovals = userPermissions.includes('approve-form-approvals');

    const [search, setSearch] = useState(props.q ?? '');

    const [extFor, setExtFor] = useState<{ id: number; label?: string } | null>(null);
    const [extName, setExtName] = useState('');
    const [extTitle, setExtTitle] = useState('');
    const [extNotes, setExtNotes] = useState('');

    const [showApprove, setShowApprove] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [toDelete, setToDelete] = useState<number | null>(null);

    const [selectedApprovalId, setSelectedApprovalId] = useState<number | null>(null);
    const [selectedActor, setSelectedActor] = useState<string | null>(null);
    const [selectedStepLabel, setSelectedStepLabel] = useState<string | null>(null);

    const openExternalModal = (approval: ApprovalItem) => {
        setExtFor({ id: approval.id, label: approval.current_step_label ?? 'External Approval' });
        setExtName('');
        setExtTitle('');
        setExtNotes('');
    };

    const submitExternal = () => {
        if (!extFor) return;
        router.post(
            route('approvals.external_approve', extFor.id),
            {
                external_name: extName,
                external_title: extTitle,
                notes: extNotes,
            },
            { preserveScroll: true, onSuccess: () => setExtFor(null) },
        );
    };

    const onChangeTab = (key: string) => {
        router.get(route('approvals.index'), { tab: key, q: search }, { preserveState: true, preserveScroll: true });
    };

    const onSearch = (v: string) => {
        setSearch(v);
        router.get(route('approvals.index'), { tab: props.tab, q: v }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const openApprove = (a: ApprovalItem) => {
        setSelectedApprovalId(a.id);
        setSelectedActor(a.current_step_actor ?? null);
        setShowApprove(true);
        setSelectedStepLabel(a.current_step_label ?? null);
    };
    const openReject = (a: ApprovalItem) => {
        setSelectedApprovalId(a.id);
        setSelectedActor(a.current_step_actor ?? null);
        setShowReject(true);
        setSelectedStepLabel(a.current_step_label ?? null);
    };
    const approve = () => {
        if (!selectedApprovalId) return;
        router.post(
            route('approvals.approve', selectedApprovalId),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setShowApprove(false),
            },
        );
    };
    const reject = (notes?: string) => {
        if (!selectedApprovalId) return;
        router.post(
            route('approvals.reject', selectedApprovalId),
            { notes },
            {
                preserveScroll: true,
                onSuccess: () => setShowReject(false),
            },
        );
    };

    const pageData = props.approvals;

    // const currentUser = pageData.auth?.user;

    // const canAct = (a: ApprovalItem) => {
    //     if (a.status !== "pending_review") {
    //         return false;
    //     }

    //     if (a.current_step_is_external) {
    //         return true;
    //     }

    //     if (currentUser?.role?.name === a.current_step_actor) {
    //         return true;
    //     }

    //     return ["superuser", "vp_admin"].includes(currentUser?.role?.code ?? ""); //Superuser and VP Admin override
    // };

    return (
        <AppLayout breadcrumbs={[{ title: 'Form Approval', href: '/approvals' }]}>
            <Head title="Form Approval" />

            <div className="p-4">
                  {/* Header */}
                <div className="mb-4">
                    <h1 className="text-xl font-semibold">Form Approval</h1>
                    <p className="text-sm text-muted-foreground">
                        Displays a complete list of forms awaiting review within the university to facilitate tracking & auditing.
                    </p>
                </div>
                <div className="mb-4 flex gap-2 rounded-md bg-muted p-2">
                    {tabs.map((t) => (
                        <Button
                            key={t.key}
                            variant={props.tab === t.key ? 'default' : 'ghost'}
                            className="cursor-pointer"
                            onClick={() => onChangeTab(t.key)}
                        >
                            {t.label}
                        </Button>
                    ))}
                </div>

              

                {/* Search */}
                <div className="mb-3 w-80">
                    <Input placeholder="search for the date, title, or requester" value={search} onChange={(e) => onSearch(e.target.value)} />
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted">
                                <TableHead className="text-center">Form Title</TableHead>
                                <TableHead className="text-center">Date Created</TableHead>
                                <TableHead className="text-center">Date Updated</TableHead>
                                <TableHead className="text-center">Requested By</TableHead>
                                <TableHead className="text-center">Approval Status</TableHead>
                                {/* <TableHead className="text-center">Requires Attention From</TableHead> */}
                                {props.tab !== 'approved' && (
                                    <TableHead className="text-center">
                                        {props.tab === 'rejected' ? 'Reason' : 'Requires Attention From'}
                                    </TableHead>
                                )}
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-center">
                            {pageData.data.length ? (
                                pageData.data.map((a) => (
                                    <TableRow key={a.id}>
                                        <TableCell className="font-medium">{a.form_title}</TableCell>
                                        <TableCell>
                                            {a.requested_at
                                                ? new Date(a.requested_at).toLocaleDateString('en-US', {
                                                      month: 'short',
                                                      day: '2-digit',
                                                      year: 'numeric',
                                                  })
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {a.reviewed_at
                                                ? new Date(a.reviewed_at).toLocaleDateString('en-US', {
                                                      month: 'short',
                                                      day: '2-digit',
                                                      year: 'numeric',
                                                  })
                                                : '—'}
                                        </TableCell>
                                        <TableCell>{a.requested_by?.name ?? '—'}</TableCell>
                                        <TableCell>
                                            <StatusPill s={a.status} />
                                        </TableCell>
                                        {/* <TableCell className="text-center"> */}
                                            {/* {Number(a.can_approve) ? 'true' : 'false'} */}
                                            {/* {a.status === 'pending_review' && a.current_step_label && a.current_step_actor ? (
                                                <div className="leading-tight">
                                                    <span className="font-medium">{a.current_step_actor}</span>
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell> */}
                                        {props.tab !== 'approved' && (
                                            <TableCell className="text-center">
                                                {props.tab === 'rejected' ? (
                                                a.review_notes ? (
                                                    <div className="leading-tight text-red-600">{ucwords(a.review_notes)}</div>
                                                ) : (
                                                    '—'
                                                )
                                                ) : a.status === 'pending_review' && a.current_step_label && a.current_step_actor ? (
                                                <div className="leading-tight">
                                                    <span className="font-medium">{a.current_step_actor}</span>
                                                </div>
                                                ) : (
                                                '—'
                                                )}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                {/* View */}
                                                <Button variant="outline" asChild className="cursor-pointer">
                                                    <Link href={viewPath(a.form_type, a.approvable?.id)} preserveScroll>
                                                        View
                                                    </Link>
                                                </Button>
                                                
                                                <Button
                                                    variant="destructive"
                                                    className="cursor-pointer"
                                                    title="Delete this record"
                                                    onClick={() => {
                                                        setToDelete(a.id);
                                                        setShowDelete(true);
                                                    }}
                                                    disabled={!canDeleteApprovals}
                                                >
                                                    Delete
                                                </Button>

                                                {a.status === 'pending_review' ? (
                                                    a.current_step_is_external ? (
                                                        <>
                                                        <Button
                                                            // variant="blue"
                                                            // size="icon"
                                                            title={a.current_step_label ?? 'Record External Approval'}
                                                            className="cursor-pointer"
                                                            onClick={() => openExternalModal(a)}
                                                        >
                                                            {/* <FileSignature className="h-4 w-4" /> */}
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            className="cursor-pointer"
                                                            title={`Reject as ${a.current_step_actor}`}
                                                            disabled={!a.can_approve}
                                                            onClick={() => openReject(a)}
                                                        >
                                                            Reject
                                                        </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Approve */}
                                                            <Button
                                                                // variant="blue"
                                                                className="cursor-pointer"
                                                                title={`Approve as ${a.current_step_actor}`}
                                                                disabled={!a.can_approve}
                                                                onClick={() => openApprove(a)}
                                                            >
                                                                {/* {Number(a.can_approve) ? 'true' : 'false'} */}
                                                                Approve
                                                            </Button>

                                                            {/* Reject */}
                                                            <Button
                                                                variant="destructive"
                                                                className="cursor-pointer"
                                                                title={`Reject as ${a.current_step_actor}`}
                                                                disabled={!a.can_approve}
                                                                onClick={() => openReject(a)}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        title="Move back to Pending Review"
                                                        className={`cursor-pointer ${!canApproveApprovals ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        disabled={!canApproveApprovals}
                                                        onClick={() => {
                                                            if (!canApproveApprovals) return;
                                                            setSelectedApprovalId(a.id);
                                                            setShowReset(true);
                                                        }}
                                                        >
                                                        Reset
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={props.tab === 'approved' ? 6 : 7}
                                        className="text-sm text-muted-foreground"
                                    >
                                        No items found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-3 flex items-center justify-end">
                    <div className="flex gap-2">
                        {pageData.links.map((lnk, i) => (
                            <Button
                                key={i}
                                size="sm"
                                variant={lnk.active ? 'default' : 'outline'}
                                disabled={!lnk.url}
                                className="cursor-pointer"
                                onClick={() => lnk.url && router.visit(lnk.url, { preserveScroll: true, preserveState: true })}
                            >
                                {lnk.label.replace('&laquo;', 'Prev').replace('&raquo;', 'Next')}
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
                            <Input id="extName" value={extName} onChange={(e) => setExtName(e.target.value)} placeholder="e.g., Dr. Juan Dela Cruz" />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="extTitle">Title / Position (optional)</Label>
                            <Input
                                id="extTitle"
                                value={extTitle}
                                onChange={(e) => setExtTitle(e.target.value)}
                                placeholder="e.g., Dean, College of Engineering"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="extNotes">Notes (optional)</Label>
                            <Textarea id="extNotes" value={extNotes} onChange={(e) => setExtNotes(e.target.value)} placeholder="Any remarks..." />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" className="cursor-pointer">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button onClick={submitExternal} className="cursor-pointer">
                            Record Approval
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ApproveConfirmationModal
                show={showApprove}
                onCancel={() => setShowApprove(false)}
                onConfirm={approve}
                actorLabel={selectedActor}
                stepLabel={selectedStepLabel}
            />

            <RejectConfirmationModal
                show={showReject}
                onCancel={() => setShowReject(false)}
                onConfirm={(notes) => reject(notes)}
                actorLabel={selectedActor}
                stepLabel={selectedStepLabel}
                // requireNotes // ← uncomment if rejecting must include a reason
            />

            <ResetConfirmationModal
                show={showReset}
                onCancel={() => setShowReset(false)}
                onConfirm={() => {
                    if (!selectedApprovalId) return;
                    router.post(
                        route('approvals.reset', selectedApprovalId),
                        {},
                        {
                            preserveScroll: true,
                            preserveState: false, // force Inertia to reload fresh props
                            onSuccess: () => setShowReset(false),
                        },
                    );
                }}
            />

            <DeleteConfirmationModal
                show={showDelete}
                onCancel={() => setShowDelete(false)}
                onConfirm={() => {
                    if (!toDelete) return;
                    router.delete(route('approvals.destroy', toDelete), {
                        preserveScroll: true,
                        onSuccess: () => {
                            setShowDelete(false);
                            setToDelete(null);
                        },
                    });
                }}
                title="Delete Form Approval"
                message={
                    <>
                        Are you sure you want to delete this form approval record?
                        <br />
                        This will move it to the Trash Bin and can be restored later.
                    </>
                }
            />
        </AppLayout>
    );
}
