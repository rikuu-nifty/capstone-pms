import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Notification {
    id: string;
    data: {
        asset_id?: number;
        asset_name?: string;
        maintenance_due_date?: string;
        due_date?: string;
        message?: string;
        module?: string;
    };
    status: 'unread' | 'read' | 'archived';
    read_at: string | null;
    created_at: string;
}

interface NotificationsPageProps {
    notifications_page: {
        data: Notification[];
        links: { url: string | null; label: string; active: boolean }[];
        meta: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
    filter: string;
    counts: {
        all: number;
        unread: number;
        archived: number;
    };
}

export default function NotificationsIndex({ notifications_page, filter, counts }: NotificationsPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Notifications', href: '/notifications' }];

    const handleTabChange = (type: string) => {
        router.get(route('notifications.index'), { filter: type }, { preserveState: true, preserveScroll: true });
    };

    // ✅ Detect "approval needed" notification
    const isApprovalNeeded = (n: Notification) => {
        const msg = (n.data?.message || '').toLowerCase();
        const module = (n.data?.module || '').toLowerCase();
        return msg.includes('approval') || msg.includes('approval is required') || module.includes('approval');
    };

    // ✅ Extract form type + ID from message like:
    // "Approval is required for: Inventory Scheduling - #1."
    const extractApprovalContext = (n: Notification) => {
        const message = n.data?.message || '';
        const idMatch = message.match(/#(\d+)/); // picks #1, #23, etc.
        const id = idMatch ? Number(idMatch[1]) : null;

        const lower = message.toLowerCase();

        let formType: 'inventory_scheduling' | 'transfer' | 'off_campus' | 'turnover_disposal' | null = null;

        if (lower.includes('inventory scheduling')) formType = 'inventory_scheduling';
        else if (lower.includes('transfer')) formType = 'transfer';
        else if (lower.includes('off-campus') || lower.includes('off campus')) formType = 'off_campus';
        else if (lower.includes('turnover') || lower.includes('disposal')) formType = 'turnover_disposal';

        return { formType, id };
    };

    // ✅ Map form type to your route/URL
    // IMPORTANT: adjust these to your real routes if needed.
    const FORM_ROUTES: Record<string, (id: number) => string> = {
        // If you have named routes, use route('name', id)
        // Example placeholders below:
        inventory_scheduling: (id) => `/inventory-scheduling/${id}/view`,
        transfer: (id) => `/transfers/${id}/view`,
        off_campus: (id) => `/off-campus/${id}/view`,
        turnover_disposal: (id) => `/turnover-disposal/${id}/view`,
    };

    const getViewFormUrl = (n: Notification) => {
        const { formType, id } = extractApprovalContext(n);
        if (!formType || !id) return null;

        const builder = FORM_ROUTES[formType];
        if (!builder) return null;

        return builder(id);
    };

    // ✅ Pagination Renderer (same style as Audit Trail)
    const renderPagination = (links: { url: string | null; label: string; active: boolean }[]) => {
        const prev = links.find((l) => l.label.includes('Previous') || l.label.includes('«'));
        const next = links.find((l) => l.label.includes('Next') || l.label.includes('»'));

        const pageLinks = links.filter((l) => /^\d+$/.test(l.label));
        const totalPages = pageLinks.length;

        if (totalPages === 0) return null;

        const first = pageLinks[0];
        const last = pageLinks[totalPages - 1];
        const activeIndex = pageLinks.findIndex((l) => l.active);
        const activePage = activeIndex !== -1 ? parseInt(pageLinks[activeIndex].label, 10) : 1;

        const maxVisible = 5;
        let start = Math.max(1, activePage - Math.floor(maxVisible / 2));
        let end = start + maxVisible - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxVisible + 1);
        }

        const visiblePages = pageLinks.slice(start - 1, end);

        return (
            <Pagination className="mt-4 flex justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationLink
                            href={first?.url || '#'}
                            className="rounded-md border px-3 py-1 text-black hover:bg-gray-100 disabled:opacity-50"
                            aria-disabled={activePage === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationPrevious
                            href={prev?.url || '#'}
                            className="rounded-md border px-3 py-1 text-black hover:bg-gray-100 disabled:opacity-50"
                            aria-disabled={activePage === 1}
                        />
                    </PaginationItem>

                    {visiblePages.map((link, i) => (
                        <PaginationItem key={i}>
                            <PaginationLink
                                href={link.url || '#'}
                                isActive={link.active}
                                className={
                                    link.active
                                        ? 'rounded-md border bg-[#155dfc] px-3 py-1 text-white'
                                        : 'rounded-md border px-3 py-1 text-black hover:bg-gray-100'
                                }
                            >
                                {link.label}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href={next?.url || '#'}
                            className="rounded-md border px-3 py-1 text-black hover:bg-gray-100 disabled:opacity-50"
                            aria-disabled={activePage === totalPages}
                        />
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationLink
                            href={last?.url || '#'}
                            className="rounded-md border px-3 py-1 text-black hover:bg-gray-100 disabled:opacity-50"
                            aria-disabled={activePage === totalPages}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </PaginationLink>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
                        <p className="text-sm text-muted-foreground">View all system notifications and maintenance alerts</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-900">
                    {[
                        { key: 'all', label: 'All', count: counts.all },
                        { key: 'unread', label: 'Unread', count: counts.unread },
                        { key: 'archived', label: 'Archived', count: counts.archived },
                    ].map((t) => (
                        <Button
                            key={t.key}
                            variant={filter === t.key ? 'default' : 'ghost'}
                            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition ${
                                filter === t.key ? 'font-semibold shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => handleTabChange(t.key)}
                        >
                            {t.label}
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                    filter === t.key ? 'bg-white text-gray-700' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}
                            >
                                {t.count}
                            </span>
                        </Button>
                    ))}
                </div>

                {/* Cards */}
                <div className="space-y-3">
                    {notifications_page.data.length > 0 ? (
                        notifications_page.data.map((n) => {
                            const approvalNeeded = isApprovalNeeded(n);
                            const viewFormUrl = approvalNeeded ? getViewFormUrl(n) : null;

                            return (
                                <div
                                    key={n.id}
                                    className={`flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-gray-900 ${
                                        n.status === 'unread' ? 'border-l-4 border-blue-500 bg-blue-50/60 dark:bg-blue-900/20' : ''
                                    }`}
                                >
                                    {/* Left content */}
                                    <div className="flex flex-col">
                                        <p
                                            className={`text-sm ${
                                                n.status === 'unread'
                                                    ? 'font-semibold text-gray-900 dark:text-white'
                                                    : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {approvalNeeded ? 'Approval Needed' : (n.data.asset_name ?? 'Maintenance Needed')}
                                        </p>

                                        {/* show message always for approvals; maintenance can show message too if you want */}
                                        {n.data.message && <p className="text-xs text-gray-500">{n.data.message}</p>}

                                        {/* show due only if present */}
                                        {(() => {
                                            const dueDate = n.data.maintenance_due_date || n.data.due_date;
                                            if (!dueDate) return null;

                                            const d = new Date(dueDate);
                                            if (Number.isNaN(d.getTime())) return null;

                                            return (
                                                <p className="text-xs text-gray-400">
                                                    Due:{' '}
                                                    {d.toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            );
                                        })()}
                                    </div>

                                    {/* Right actions (✅ removed timestamp here) */}
                                    <div className="flex items-center gap-2">
                                        {/* ✅ View Form for approvals */}
                                        {approvalNeeded && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!viewFormUrl}
                                                onClick={() => {
                                                    if (!viewFormUrl) return;

                                                    router.get(viewFormUrl, {
                                                        from: 'notifications',
                                                    });
                                                }}
                                            >
                                                View Form
                                            </Button>
                                        )}

                                        {/* ✅ View Asset for maintenance (needs asset_id) */}
                                        {!approvalNeeded && n.data.asset_id && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(route('inventory-list.view', n.data.asset_id), { from: 'notifications' })}
                                            >
                                                View Asset
                                            </Button>
                                        )}

                                        {/* Mark Read / Unread */}
                                        {n.status === 'unread' ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.post(route('notifications.read', n.id), {}, { preserveScroll: true })}
                                            >
                                                Mark as Read
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.post(route('notifications.unread', n.id), {}, { preserveScroll: true })}
                                            >
                                                Mark as Unread
                                            </Button>
                                        )}

                                        {/* Archive */}
                                        {n.status !== 'archived' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.post(route('notifications.archive', n.id), {}, { preserveScroll: true })}
                                            >
                                                Archive
                                            </Button>
                                        )}

                                        {/* Delete */}
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                router.delete(route('notifications.destroy', n.id), {
                                                    preserveScroll: true,
                                                })
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-md border bg-gray-50 py-6 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            No notifications found for this filter.
                        </div>
                    )}
                </div>

                <div>{renderPagination(notifications_page.links)}</div>
            </div>
        </AppLayout>
    );
}
