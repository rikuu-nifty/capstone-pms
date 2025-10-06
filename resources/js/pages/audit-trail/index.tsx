import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronsLeft, ChevronsRight, Download, Search } from 'lucide-react';
import { useState } from 'react';
import FiltersPopover, { AuditLogFilters } from './FiltersPopover';
import { type BreadcrumbItem } from '@/types';
import LogCard from './LogCard';

// Pagination components
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// -------------------------
// Types
// -------------------------
export type AuditLog = {
    id: number;
    actor_name: string | null;
    unit_or_department?: { name: string };
    action: string;
    subject_type: string;
    old_values?: Record<string, unknown> | null;
    new_values?: Record<string, unknown> | null;
    created_at: string;
    status?: 'success' | 'failed';
};

type PaginationLinkType = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedLogs = {
    data: AuditLog[];
    total: number;
    links: PaginationLinkType[];
};

type PageProps = {
    title: string;
    userActions: PaginatedLogs;
    securityLogs: PaginatedLogs;
};


 const breadcrumbs: BreadcrumbItem[] = [{ title: 'Audit Trail', href: '/audit-trail' }];

export default function AuditTrailIndex() {
    const { title, userActions, securityLogs } = usePage<PageProps>().props;

    const [filters, setFilters] = useState<AuditLogFilters>({});
    const [expanded, setExpanded] = useState<number | null>(null);
    const [tab, setTab] = useState<'user' | 'security'>('user');
    const [search, setSearch] = useState('');

    function applySearch(extraFilters?: AuditLogFilters) {
        const payload = { search, tab, ...filters, ...extraFilters };
        router.get(route('audit-trail.index'), payload, { preserveState: true });
    }

    // Render pagination using shadcn/ui
    const renderPagination = (links: PaginationLinkType[]) => {
        const prev = links.find((l) => l.label.includes('Previous') || l.label.includes('«'));
        const next = links.find((l) => l.label.includes('Next') || l.label.includes('»'));

        // Only keep numeric pages
        const pageLinks = links.filter((l) => /^\d+$/.test(l.label));
        const totalPages = pageLinks.length;

        if (totalPages === 0) return null;

        const first = pageLinks[0];
        const last = pageLinks[totalPages - 1];

        // Find active page
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
            <Pagination className="flex justify-end">
                <PaginationContent className="justify-end">
                    {/* First */}
                    <PaginationItem>
                        <PaginationLink
                            href={first?.url || '#'}
                            className="rounded-md border px-3 py-1 text-black hover:bg-gray-100 disabled:opacity-50"
                            aria-disabled={activePage === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </PaginationLink>
                    </PaginationItem>

                    {/* Previous */}
                    <PaginationItem>
                        <PaginationPrevious
                            href={prev?.url || '#'}
                            className="rounded-md border px-3 py-1 text-black hover:bg-gray-100 disabled:opacity-50"
                            aria-disabled={activePage === 1}
                        />
                    </PaginationItem>

                    {/* Page numbers */}
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

                    {/* Next */}
                    <PaginationItem>
                        <PaginationNext
                            href={next?.url || '#'}
                            className="rounded-md border px-3 py-1 text-black hover:bg-gray-100 disabled:opacity-50"
                            aria-disabled={activePage === totalPages}
                        />
                    </PaginationItem>

                    {/* Last */}
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
            <Head title={title} />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{title}</h1>
                        <p className="text-sm text-muted-foreground">
                            Monitor user actions and security events in
                            real time, combining all server pages with live updates.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                applySearch();
                            }}
                            className="flex gap-2"
                        >
                            {/* Search Input with Icon */}
                            <div className="relative w-64">
                                <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search subject..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-8"
                                />
                            </div>

                            {/* Search Button */}
                            <Button type="submit" className="flex items-center gap-1">
                                <Search className="h-4 w-4" />
                                <span>Search</span>
                            </Button>
                        </form>

                        <FiltersPopover
                            initialFilters={filters}
                            onApply={(newFilters) => {
                                setFilters(newFilters);
                                applySearch(newFilters);
                            }}
                        />
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="user" value={tab} onValueChange={(v) => setTab(v as 'user' | 'security')}>
                    <TabsList className="inline-flex h-10 items-center rounded-lg bg-gray-100 p-1 text-sm">
                        <TabsTrigger
                            value="user"
                            className="rounded-md px-4 py-2 data-[state=active]:bg-[#155dfc] data-[state=active]:text-white data-[state=active]:shadow-sm"
                        >
                            User Actions
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="rounded-md px-4 py-2 data-[state=active]:bg-[#155dfc] data-[state=active]:text-white data-[state=active]:shadow-sm"
                        >
                            Security Logs
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="user">
                        <div className="mb-2 flex justify-end text-sm text-muted-foreground">{userActions.total} items</div>
                        <div className="space-y-4">
                            {userActions.data.map((log) => (
                                <LogCard
                                    key={log.id}
                                    log={log}
                                    expanded={expanded === log.id}
                                    onToggle={() => setExpanded(expanded === log.id ? null : log.id)}
                                />
                            ))}
                        </div>
                        <div className="mt-4">{renderPagination(userActions.links)}</div>
                    </TabsContent>

                    <TabsContent value="security">
                        <div className="mb-2 flex justify-end text-sm text-muted-foreground">{securityLogs.total} items</div>
                        <div className="space-y-4">
                            {securityLogs.data.map((log) => (
                                <LogCard
                                    key={log.id}
                                    log={log}
                                    expanded={expanded === log.id}
                                    onToggle={() => setExpanded(expanded === log.id ? null : log.id)}
                                />
                            ))}
                        </div>
                        <div className="mt-4">{renderPagination(securityLogs.links)}</div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
