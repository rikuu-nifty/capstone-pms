import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, KeyRound, PlusCircle } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { formatNumber } from "@/types/custom-index";

import Pagination, { PageInfo } from "@/components/Pagination";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";

import { RoleManagementPageProps, RoleWithCounts } from "@/types/role";

import AddRoleModal from "./AddRoleModal";
import EditRoleModal from "./EditRoleModal";
import ManagePermissionsModal from "./ManagePermissionModal";

const PAGE_SIZE = 10;

export default function RoleManagement() {
    const { props } = usePage<RoleManagementPageProps>();

    const [rawSearch, setRawSearch] = useState("");
    const search = rawSearch.trim().toLowerCase();

    // Modal state
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleWithCounts | null>(null);
    const [showDelete, setShowDelete] = useState(false);
    const [deletingRole, setDeletingRole] = useState<RoleWithCounts | null>(null);
    const [showManagePermissions, setShowManagePermissions] = useState(false);

    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const filtered = useMemo(() => {
        return props.roles.data.filter((r) => {
        const haystack = `${r.name ?? ""} ${r.code ?? ""} ${r.description ?? ""}`.toLowerCase();
        return !search || haystack.includes(search);
        });
    }, [props.roles.data, search]);

    const start = (page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    return (
        <AppLayout breadcrumbs={[{ title: "Role Management", href: "/role-management" }]}>
            <Head title="Role Management" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-2 w-full">
                <div>
                    <h1 className="text-2xl font-semibold">Role Management</h1>
                    <p className="text-sm text-muted-foreground">
                    Manage system roles and their permissions.
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    {/* Left: search */}
                    <Input
                    type="text"
                    placeholder="Search by role name, code, or description..."
                    value={rawSearch}
                    onChange={(e) => setRawSearch(e.target.value)}
                    className="w-64"
                    />

                    <Button
                    variant="primary"
                    className="cursor-pointer"
                    onClick={() => setShowAdd(true)}
                    >
                    <PlusCircle className="mr-1 h-4 w-4" /> Add New Role
                    </Button>
                </div>
                </div>

                {/* KPI Cards */}
                {props.totals && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border p-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <Shield className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Total Roles</div>
                        <div className="text-3xl font-bold">
                        {formatNumber(props.totals.roles)}
                        </div>
                    </div>
                    </div>

                    <div className="rounded-2xl border p-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                        <KeyRound className="h-7 w-7 text-green-600" />
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Total Permissions</div>
                        <div className="text-3xl font-bold">
                        {formatNumber(props.totals.permissions)}
                        </div>
                    </div>
                    </div>

                    <div className="rounded-2xl border p-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                        <Users className="h-7 w-7 text-purple-600" />
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Total Users</div>
                        <div className="text-3xl font-bold">
                        {formatNumber(props.totals.users)}
                        </div>
                    </div>
                    </div>
                </div>
                )}

                {/* Roles Table */}
                <div className="rounded-lg overflow-x-auto border">
                <Table>
                    <TableHeader>
                    <TableRow className="bg-muted/40">
                        <TableHead className="text-center w-[160px]">Name</TableHead>
                        <TableHead className="text-center w-[140px]">Code</TableHead>
                        <TableHead className="text-center w-[200px]">Description</TableHead>
                        <TableHead className="text-center w-[160px]">Associated Permissions</TableHead>
                        <TableHead className="text-center w-[160px]">Users Assigned</TableHead>
                        <TableHead className="text-center w-[200px]">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {pageItems.length > 0 ? (
                        pageItems.map((r) => (
                        <TableRow key={r.id} className="text-center">
                            <TableCell className="truncate max-w-[160px]">{r.name}</TableCell>
                            <TableCell className="truncate max-w-[160px]">
                            {r.code === "superuser" ? (
                                <Badge className="bg-neutral-800 text-white hover:bg-neutral-700">
                                Superuser
                                </Badge>
                            ) : r.code === "pmo_head" ? (
                                <Badge className="bg-blue-700 text-white hover:bg-blue-600">
                                PMO Head
                                </Badge>
                            ) : r.code === "pmo_staff" ? (
                                <Badge className="bg-teal-600 text-white hover:bg-teal-500">
                                PMO Staff
                                </Badge>
                            ) : (
                                <Badge
                                variant="outline"
                                className="text-gray-700 border-gray-300"
                                >
                                {r.code.toUpperCase()}
                                </Badge>
                            )}
                            </TableCell>
                            <TableCell className="whitespace-normal break-words max-w-[300px]">
                            {r.description ?? "—"}
                            </TableCell>
                            <TableCell>{r.permissions_count}</TableCell>
                            <TableCell>{r.users_count}</TableCell>
                            <TableCell className="w-[200px]">
                            <div className="flex justify-center gap-2">
                                <Button
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => {
                                    setEditingRole(r);
                                    setShowEdit(true);
                                }}
                                >
                                Edit
                                </Button>
                                <Button
                                variant="blue"
                                className="cursor-pointer"
                                onClick={() => {
                                    setEditingRole(r);
                                    setShowManagePermissions(true);
                                }}
                                >
                                Manage Permissions
                                </Button>
                                <Button
                                variant="destructive"
                                className="cursor-pointer"
                                onClick={() => {
                                    setDeletingRole(r);
                                    setShowDelete(true);
                                }}
                                >
                                Delete
                                </Button>
                            </div>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell
                            colSpan={6}
                            className="text-center text-sm text-muted-foreground py-8"
                        >
                            No roles found.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </div>

                {/* Pagination */}
                {props.roles.data.length > 0 && (
                <div className="flex items-center justify-between">
                    <PageInfo
                    page={page}
                    total={filtered.length}
                    pageSize={PAGE_SIZE}
                    label="roles"
                    />
                    <Pagination
                    page={page}
                    total={filtered.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                    />
                </div>
                )}

                {/* Modals */}
                <AddRoleModal
                show={showAdd}
                onClose={() => setShowAdd(false)}
                permissions={props.permissions}
                />

                {editingRole && showEdit && (
                <EditRoleModal
                    show={showEdit}
                    onClose={() => setShowEdit(false)}
                    role={editingRole}
                    permissions={props.permissions}
                />
                )}

                {deletingRole && (
                <DeleteConfirmationModal
                    show={showDelete}
                    onCancel={() => setShowDelete(false)}
                    onConfirm={() => {
                    if (deletingRole) {
                        // Still call backend for deletion
                        router.delete(route("roles.destroy", deletingRole.id), {
                        preserveScroll: true,
                        onSuccess: () => setShowDelete(false),
                        });
                    }
                    }}
                    title="Delete Role"
                    message={
                    <>
                        Are you sure you want to delete the role{" "}
                        <strong>{deletingRole.name}</strong>?
                    </>
                    }
                />
                )}

                {editingRole && showManagePermissions && (
                <ManagePermissionsModal
                    show={showManagePermissions}
                    onClose={() => setShowManagePermissions(false)}
                    role={editingRole}
                    permissions={props.permissions}
                />
                )}
            </div>
        </AppLayout>
    );
}
