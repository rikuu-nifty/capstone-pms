import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMemo, useState, useEffect } from 'react';
import { formatDateTime, Role, User, QueryParams, formatStatusLabel, formatNumber } from '@/types/custom-index';
import { formatFullName } from '@/types/user';

import RoleAssignmentModal from '@/components/modals/RoleAssignmentModal';
import ViewUserModal from '@/components/modals/ViewUserModal';
import UserStatusFilterDropdown, { type UserStatus } from '@/components/filters/UserStatusFilterDropdown';

import Pagination, { PageInfo } from '@/components/Pagination';
import useDebouncedValue from '@/hooks/useDebouncedValue';

export type LinkItem = { url: string | null; label: string; active: boolean };

type Paginator<T> = {
    data: T[];
    links?: LinkItem[];
    current_page?: number;
    last_page?: number;
    total?: number;
};

type UserManagementPageProps = {
    users: Paginator<User>;
    tab: 'system' | 'approvals';
    filter?: string;
    roles: Role[];
    totals: {
        users: number;
        approved: number;
        pending: number;
        denied: number;
    };
};

export default function UserApprovals() {
    const { props, url } = usePage<UserManagementPageProps>();
    const currentTab = props.tab ?? 'approvals';

    // ✅ Normalize filter to union type
    const currentFilter: UserStatus =
        props.filter === 'pending' ||
        props.filter === 'approved' ||
        props.filter === 'denied'
        ? (props.filter as UserStatus)
        : ''
    ;

    // ✅ State for modals
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [showViewUser, setShowViewUser] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const initialQ = useMemo(() => {
        const qs = url.includes('?') ? url.split('?')[1] : '';
        return new URLSearchParams(qs).get('q') ?? '';
    }, [
        url
    ]);

    const [rawSearch, setRawSearch] = useState(initialQ);
    const search = useDebouncedValue(rawSearch, 300);

    useEffect(() => {
        router.get(
            route('user-approvals.index'),
            { tab: currentTab, q: search || undefined },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    }, [
        search, 
        currentTab
    ]);

    const go = (params: QueryParams = {}) =>
        router.get(
            route('user-approvals.index'),
            { tab: currentTab, ...params },
            { preserveState: true, preserveScroll: true, replace: true }
        );

    const changeTab = (key: 'system' | 'approvals') =>
        router.get(
            route('user-approvals.index'),
            { tab: key, q: search || undefined },
            { preserveState: true, preserveScroll: true, replace: true }
        );

    return (
        <AppLayout breadcrumbs={[{ title: 'User Approvals', href: '/user-approvals' }]}>
        <Head title="User Management" />

        <div className="flex flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">User Management</h1>
                    <p className="text-sm text-muted-foreground">
                    Manage system users and approve new registrations.
                    </p>

                    {/* Search */}
                    <div className="flex items-center gap-2 w-96">
                        <Input
                            type="text"
                            placeholder="Search by name or email..."
                            value={rawSearch}
                            onChange={(e) => setRawSearch(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    {currentTab === 'approvals' && (
                        <UserStatusFilterDropdown
                            selected_status={currentFilter}
                            onApply={(status) =>
                                router.get(
                                route('user-approvals.index'),
                                { tab: currentTab, q: search || undefined, filter: status },
                                { preserveState: true, preserveScroll: true, replace: true }
                                )
                            }
                            
                            onClear={() =>
                                router.get(
                                route('user-approvals.index'),
                                { tab: currentTab, q: search || undefined, filter: '' },
                                { preserveState: true, preserveScroll: true, replace: true }
                                )
                            }
                        />
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            {props.totals && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border p-4">
                <div className="text-sm text-muted-foreground">Total Users</div>
                <div className="mt-1 text-2xl font-semibold">
                    {formatNumber(props.totals.users)}
                </div>
                </div>

                <div className="rounded-2xl border p-4">
                <div className="text-sm text-muted-foreground">Approved</div>
                <div className="mt-1 text-2xl font-semibold">
                    {formatNumber(props.totals.approved)}
                </div>
                </div>

                <div className="rounded-2xl border p-4">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="mt-1 text-2xl font-semibold">
                    {formatNumber(props.totals.pending)}
                </div>
                </div>

                <div className="rounded-2xl border p-4">
                <div className="text-sm text-muted-foreground">Rejected</div>
                <div className="mt-1 text-2xl font-semibold">
                    {formatNumber(props.totals.denied)}
                </div>
                </div>
            </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 border-b pb-2">
            <button
                onClick={() => changeTab('system')}
                className={`cursor-pointer pb-2 text-sm ${
                currentTab === 'system'
                    ? 'font-semibold text-foreground border-b-2 border-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                System Users
            </button>
            <button
                onClick={() => changeTab('approvals')}
                className={`cursor-pointer pb-2 text-sm ${
                currentTab === 'approvals'
                    ? 'font-semibold text-foreground border-b-2 border-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                User Approvals
            </button>
            </div>

            {/* System Users Tab */}
            {currentTab === 'system' && (
            <div className="rounded-lg overflow-x-auto border">
                <Table>
                <TableHeader>
                    <TableRow className="bg-muted/40">
                    <TableHead className="text-center">Full Name</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">Role</TableHead>
                    <TableHead className="text-center">Approved On</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {props.users.data.map((u) => (
                    <TableRow key={u.id} className="text-center">
                        <TableCell>
                        {u.detail
                            ? formatFullName(
                                u.detail.first_name,
                                u.detail.middle_name ?? '',
                                u.detail.last_name
                            )
                            : u.name}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.role?.name ?? '—'}</TableCell>
                        <TableCell>
                        {u.approved_at ? formatDateTime(u.approved_at) : '—'}
                        </TableCell>
                        <TableCell>
                        <div className="flex justify-center gap-2">
                            <Button
                            className="cursor-pointer"
                            onClick={() => {
                                setSelectedUser(u);
                                setShowViewUser(true);
                            }}
                            >
                            View
                            </Button>
                            <Button
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() =>
                                router.delete(route('user-approvals.destroy', u.id), {
                                preserveScroll: true,
                                })
                            }
                            >
                            Delete
                            </Button>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
            )}

            {/* User Approvals Tab */}
            {currentTab === 'approvals' && (
            <div className="rounded-lg overflow-x-auto border">
                <Table>
                <TableHeader>
                    <TableRow className="bg-muted/40">
                    <TableHead className="text-center">Full Name</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">Created On</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {props.users.data.map((u) => (
                    <TableRow key={u.id} className="text-center">
                        <TableCell>
                        {u.detail
                            ? formatFullName(
                                u.detail.first_name,
                                u.detail.middle_name ?? '',
                                u.detail.last_name
                            )
                            : u.name}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                        {u.created_at ? formatDateTime(u.created_at) : '—'}
                        </TableCell>
                        <TableCell>{formatStatusLabel(u.status)}</TableCell>
                        <TableCell>
                        <div className="flex justify-center gap-2">
                            {u.status === 'pending' && (
                            <>
                                <Button
                                className="cursor-pointer"
                                onClick={() => {
                                    setSelectedUserId(u.id);
                                    setShowRoleModal(true);
                                }}
                                >
                                Approve
                                </Button>
                                <Button
                                variant="destructive"
                                className="cursor-pointer"
                                onClick={() =>
                                    router.post(
                                    route('user-approvals.deny', u.id),
                                    {},
                                    { preserveScroll: true }
                                    )
                                }
                                >
                                Reject
                                </Button>
                            </>
                            )}
                        </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
            )}

            {/* Pagination */}
            {props.users.data.length > 0 && (
            <div className="flex items-center justify-between">
                <PageInfo
                page={props.users.current_page ?? 1}
                total={props.users.total ?? 0}
                pageSize={10}
                label="users"
                />
                <Pagination
                page={props.users.current_page ?? 1}
                total={props.users.total ?? 0}
                pageSize={10}
                onPageChange={(p) => go({ page: p })}
                />
            </div>
            )}

            {/* Modals */}
            <RoleAssignmentModal
            show={showRoleModal}
            onClose={() => setShowRoleModal(false)}
            userId={selectedUserId}
            roles={props.roles}
            action="approve"
            />

            <ViewUserModal
            open={showViewUser}
            onClose={() => setShowViewUser(false)}
            user={selectedUser}
            roles={props.roles}
            />
        </div>
        </AppLayout>
    );
}
