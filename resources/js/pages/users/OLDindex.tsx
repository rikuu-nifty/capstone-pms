import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatDateTime } from '@/types/custom-index';

type User = {
  id: number;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
};

type LinkItem = { url: string | null; label: string; active: boolean };
type Paginator<T> = { data: T[]; links?: LinkItem[]; current_page?: number; last_page?: number };

// ---- Tabs typing ----
type TabKey = 'all' | 'approved' | 'pending' | 'denied' | 'role';
type TabDef = { key: TabKey; label: string; disabled?: boolean };
type QueryParams = { tab?: TabKey; q?: string; page?: number | string };

type PageProps = {
  users: Paginator<User>;
  tab: TabKey;
};

const tabs: Readonly<TabDef[]> = [
  { key: 'all',      label: 'All Users' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending',  label: 'Pending' },
  { key: 'denied',   label: 'Denied' },
  { key: 'role',     label: 'Role Change Request', disabled: true },
] as const;

const StatusBadge = ({ status }: { status: User['status'] }) => {
  const cls =
    status === 'approved'
      ? 'bg-green-100 text-green-700'
      : status === 'pending'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';
  const text = status[0].toUpperCase() + status.slice(1);
  return <span className={`rounded-full px-2.5 py-1 text-xs ${cls}`}>{text}</span>;
};

export default function UserApprovals() {
    const { props, url } = usePage<PageProps>();
    const currentTab: TabKey = props.tab ?? 'all';

    const initialQ = useMemo(() => {
        const qs = url.includes('?') ? url.split('?')[1] : '';
        return new URLSearchParams(qs).get('q') ?? '';
    }, [url]);

    const [q, setQ] = useState(initialQ);

    const go = (params: QueryParams = {}) =>
        router.get(
        route('user-approvals.index'),
        { tab: currentTab, q: q || undefined, ...params },
        { preserveState: true, preserveScroll: true, replace: true },
        );

    const changeTab = (key: TabKey) =>
        router.get(
        route('user-approvals.index'),
        { tab: key, q: q || undefined },
        { preserveState: true, preserveScroll: true, replace: true },
        );

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        go({});
    };

    const heading = tabs.find((t) => t.key === currentTab)?.label ?? 'All Users';

    return (
        <AppLayout breadcrumbs={[{ title: 'User Approvals', href: '/user-approvals' }]}>
            <Head title="User Approvals" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold">User Approvals</h1>
                    <p className="text-sm text-muted-foreground">Approve or deny new registrations.</p>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex gap-4">
                        {tabs.map((t) => {
                            const active = t.key === currentTab;
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => !t.disabled && changeTab(t.key)}
                                    disabled={!!t.disabled}
                                    className={`cursor-pointer pb-2 text-sm ${
                                        t.disabled
                                        ? 'text-muted-foreground cursor-not-allowed'
                                        : active
                                        ? 'font-semibold text-foreground border-b-2 border-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    >
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={submitSearch} className="relative w-72">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-8"
                            placeholder="Search User"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </form>
                </div>

                <h2 className="text-xl font-semibold">{heading}</h2>

                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="text-center">User</TableHead>
                                <TableHead className="text-center">Email</TableHead>
                                <TableHead className="text-center">Registration Date</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {props.users.data.map((u) => (
                            <TableRow key={u.id} className="text-center">
                                <TableCell className="font-medium">{u.name}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{formatDateTime(u.created_at)}</TableCell>
                                <TableCell><StatusBadge status={u.status} /></TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            title="Approve"
                                            onClick={() =>
                                            router.post(route('user-approvals.approve', u.id), {}, { preserveScroll: true })
                                            }
                                            disabled={u.status === 'approved'}
                                            className="cursor-pointer"
                                        >
                                            <ThumbsUp className="h-4 w-4 text-green-600" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            title="Deny"
                                            onClick={() =>
                                                router.post(route('user-approvals.deny', u.id), {}, { preserveScroll: true })
                                            }
                                            disabled={u.status === 'denied'}
                                            className="cursor-pointer"
                                        >
                                            <ThumbsDown className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {props.users.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>

                {props.users.links && props.users.links.length > 0 && (
                    <div className="mt-2 flex items-center justify-center gap-1">
                        {props.users.links.map((link, idx) => {
                        const label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                        const isNumber = /^\d+$/.test(label);
                        const baseClasses =
                            'h-8 min-w-8 rounded-md border px-2 text-sm flex items-center justify-center';
                        const active = link.active;

                        return (
                            <button
                            key={idx}
                            disabled={!link.url}
                            onClick={() =>
                                link.url
                                ? router.get(link.url, {}, { preserveScroll: true, preserveState: true })
                                : null
                            }
                            className={[
                                baseClasses,
                                !link.url ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted',
                                active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background',
                                isNumber ? 'mx-0.5' : 'mx-1',
                            ].join(' ')}
                            dangerouslySetInnerHTML={{ __html: label }}
                            />
                        );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
