import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useMemo, useState, useEffect } from 'react';
import { formatDateTime, Role, User, QueryParams, formatNumber, formatFullName } from '@/types/custom-index';

import RoleAssignmentModal from '@/components/modals/RoleAssignmentModal';
import ViewUserModal from '@/components/modals/ViewUserModal';
import UserStatusFilterDropdown, { type UserStatus } from '@/components/filters/UserStatusFilterDropdown';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import UserRoleFilterDropdown from '@/components/filters/UserRoleFilterDropdown';

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
    
    const { version } = usePage();

    const currentFilter: UserStatus =
        props.filter === 'pending' ||
        props.filter === 'approved' ||
        props.filter === 'denied'
        ? (props.filter as UserStatus)
        : ''
    ;

    const currentRoleFilter = props.filter_role ? Number(props.filter_role) : "";

    // ✅ State for modals
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [showViewUser, setShowViewUser] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDelete, setShowDelete] = useState(false);

    const initialQ = useMemo(() => {
        const qs = url.includes('?') ? url.split('?')[1] : '';
        return new URLSearchParams(qs).get('q') ?? '';
    }, [
        url
    ]);

    const [rawSearch, setRawSearch] = useState(initialQ);
    const search = useDebouncedValue(rawSearch, 200);

    useEffect(() => {
        if (!version) return;

        router.visit(route('users.index'), {
            method: 'get',
            data: { tab: currentTab, q: search || undefined },
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [search, currentTab, version]);

    const go = (params: QueryParams = {}) =>
        router.get(
            route('users.index'),
            { tab: currentTab, ...params },
            { preserveState: true, preserveScroll: true, replace: true }
        );

    const changeTab = (key: 'system' | 'approvals') =>
        router.get(
            route('users.index'),
            { tab: key, q: search || undefined },
            { preserveState: true, preserveScroll: true, replace: true }
        );

    return (
        <AppLayout breadcrumbs={[{ title: 'Users', href: '/user-approvals' }]}>
            <Head title="Users" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-2 w-full">
                    <div>
                        <h1 className="text-2xl font-semibold">Users</h1>
                        <p className="text-sm text-muted-foreground">
                        Manage system users and approve new registrations.
                        </p>
                    </div>

                    <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="Search by name or email..."
                                value={rawSearch}
                                onChange={(e) => setRawSearch(e.target.value)}
                                className="w-64"
                            />

                            {currentTab === "system" && (
                                <UserRoleFilterDropdown
                                    roles={props.roles}
                                    selectedRoleId={currentRoleFilter}
                                    onApply={(roleId) =>
                                        router.get(
                                            route("users.index"),
                                            { tab: currentTab, q: search || undefined, filter_role: roleId || undefined },
                                            { preserveState: true, preserveScroll: true, replace: true }
                                        )
                                    }
                                    onClear={() =>
                                        router.get(
                                        route("users.index"),
                                            { tab: currentTab, q: search || undefined, filter_role: "" },
                                            { preserveState: true, preserveScroll: true, replace: true }
                                        )
                                    }
                                />
                            )}

                            {currentTab === "approvals" && (
                                <UserStatusFilterDropdown
                                    selected_status={currentFilter}
                                    onApply={(status) =>
                                        router.get(
                                        route("users.index"),
                                            { tab: currentTab, q: search || undefined, filter: status },
                                            { preserveState: true, preserveScroll: true, replace: true }
                                        )
                                    }
                                    onClear={() =>
                                        router.get(
                                        route("users.index"),
                                            { tab: currentTab, q: search || undefined, filter: "" },
                                            { preserveState: true, preserveScroll: true, replace: true }
                                        )
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                {props.totals && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                <Users className="h-7 w-7 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Users</div>
                                    <div className="mt-1 flex items-center gap-2 text-3xl font-bold">
                                    {formatNumber(props.totals.users)}
                                </div>
                            </div>
                        </div>

                        {/* Approved */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <CheckCircle2 className="h-7 w-7 text-green-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Approved</div>
                                    <div className="mt-1 flex items-center gap-2 text-3xl font-bold">
                                    {formatNumber(props.totals.approved)}
                                </div>
                            </div>
                        </div>

                        {/* Pending */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                                <Clock className="h-7 w-7 text-yellow-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Pending</div>
                                    <div className="mt-1 flex items-center gap-2 text-3xl font-bold">
                                    {formatNumber(props.totals.pending)}
                                </div>
                            </div>
                        </div>

                        {/* Rejected */}
                        <div className="rounded-2xl border p-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                <XCircle className="h-7 w-7 text-red-600" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Rejected</div>
                                    <div className="mt-1 flex items-center gap-2 text-3xl font-bold">
                                    {formatNumber(props.totals.denied)}
                                </div>
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
                        <TableHead className="text-center">Roles</TableHead>
                        <TableHead className="text-center">Approved On</TableHead>
                        <TableHead className="text-center">Updated On</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {props.users.data.length > 0 ? (
                        props.users.data.map((u) => (
                            <TableRow key={u.id} className="text-center">
                                <TableCell>
                                    {u.detail
                                    ? formatFullName(
                                        u.detail.first_name,
                                        u.detail.middle_name ?? "",
                                        u.detail.last_name
                                        )
                                    : u.name}
                                </TableCell>
                                <TableCell>{u.email}</TableCell>

                                <TableCell>
                                    {u.role ? (
                                        <Badge
                                            variant={
                                            u.role.code === "superuser"
                                                ? "superuser"
                                                : u.role.code === "vp_admin"
                                                ? "vp_admin"
                                                : u.role.code === "pmo_head"
                                                ? "pmo_head"
                                                : u.role.code === "pmo_staff"
                                                ? "pmo_staff"
                                                : "outline"
                                            }
                                            className="text-xs"
                                        >
                                            {u.role.name}
                                        </Badge>
                                    ) : (
                                    "—"
                                    )}
                                </TableCell>

                                <TableCell>
                                    {u.approved_at ? formatDateTime(u.approved_at) : "—"}
                                </TableCell>

                                <TableCell>
                                    {u.updated_at ? formatDateTime(u.updated_at) : "N/A"}
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
                                        {u.can_delete && (
                                            <Button
                                                variant="destructive"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setSelectedUser(u);
                                                    setShowDelete(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        )}

                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell
                            colSpan={5}
                            className="text-center text-sm text-muted-foreground py-8"
                            >
                            No users found.
                            </TableCell>
                        </TableRow>
                        )}
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
                                    <TableHead className="text-center">Username</TableHead>
                                    <TableHead className="text-center">Email</TableHead>
                                    <TableHead className="text-center">Email Verified</TableHead>
                                    <TableHead className="text-center">Date Applied</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {props.users.data.length > 0 ? props.users.data.map((u) => (
                                    <TableRow key={u.id} className="text-center">
                                        <TableCell>
                                            {/* {u.detail ? 
                                                formatFullName(
                                                    u.detail.first_name,
                                                    u.detail.middle_name ?? '',
                                                    u.detail.last_name
                                                )
                                                : u.name
                                            } */}
                                            {u.name}
                                        </TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>{u.email_verified_at ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>
                                            {u.created_at ? formatDateTime(u.created_at) : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {u.status === "approved" && <Badge variant="success">Approved</Badge>}
                                            {u.status === "pending" && <Badge variant="primary">Pending</Badge>}
                                            {u.status === "denied" && <Badge variant="destructive">Rejected</Badge>}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <>
                                                    <Button
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedUserId(u.id);
                                                            setShowRoleModal(true);
                                                        }}
                                                        disabled={u.status == 'approved'}
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
                                                        disabled={u.status == 'denied'}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )): (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                )}
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

                {selectedUser && (
                    <DeleteConfirmationModal
                        show={showDelete}
                        onCancel={() => setShowDelete(false)}
                        onConfirm={() => {
                            router.delete(route("user-approvals.destroy", selectedUser.id), {
                                preserveScroll: true,
                                onSuccess: () => setShowDelete(false),
                            });
                        }}
                        title="Delete User"
                        message={
                            <>
                                Are you sure you want to delete the user{" "}
                                <strong>
                                    {selectedUser.detail
                                        ? `${selectedUser.detail.first_name} ${selectedUser.detail.last_name}`
                                        : selectedUser.name}
                                </strong>
                                ?
                            </>
                        }
                    />
                )}

            </div>
        </AppLayout>
    );
}
