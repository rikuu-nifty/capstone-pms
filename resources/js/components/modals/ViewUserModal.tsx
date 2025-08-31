import { useState } from "react";
import { router } from "@inertiajs/react";
import ViewModal from "@/components/modals/ViewModal";
import { Button } from "@/components/ui/button";
import RoleAssignmentModal from "@/components/modals/RoleAssignmentModal";
import { formatDateLong, UserPageProps, formatFullName } from "@/types/custom-index";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export default function ViewUserModal({ open, onClose, user, roles }: UserPageProps) {
    const [showReassign, setShowReassign] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    if (!user) return null;

    const initials = user.detail
        ? `${user.detail.first_name?.[0] ?? ""}${user.detail.last_name?.[0] ?? ""}`.toUpperCase()
        : (user.name?.[0] ?? "").toUpperCase();

    return (
        <>
            <ViewModal 
                open={open} 
                onClose={onClose} 
                size="lg" 
                contentClassName="relative max-h-[80vh] overflow-y-auto"
            >
                {/* Header Section */}
                <div className="flex items-center gap-6 border-b pb-4">
                    {/* Avatar Placeholder */}
                    <div className="h-20 w-20 flex items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-700">
                        {initials || "?"}
                    </div>

                    {/* User Name & Email */}
                    <div>
                        <h2 className="text-2xl font-semibold">
                            {user.detail
                                ? formatFullName(
                                    user.detail.first_name,
                                    user.detail.middle_name ?? '',
                                    user.detail.last_name
                                )
                                : user.name
                            }
                        </h2>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                {/* Details Section */}
                <div className="mt-6 grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-12">
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground">Role</span>
                        <p className="text-base font-semibold">{user.role?.name ?? '—'}</p>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground">Status</span>
                        <p className="text-base font-semibold capitalize">{user.status}</p>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground">Approved On</span>
                        <p className="text-base">{formatDateLong(user.approved_at) ?? '—'}</p>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground">Updated On</span>
                        <p className="text-base">{formatDateLong(user.updated_at) ?? 'N/A'}</p>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground">Notes</span>
                        <p className="text-base">{user.approval_notes ?? 'N/A'}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-wrap gap-3 justify-center">
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                            router.post(route("users.reset-password", user.id), 
                            {}, 
                            { preserveScroll: true });
                        }}
                    >
                        Reset Password
                    </Button>
                    <Button 
                        variant="outline" 
                        className="cursor-pointer"
                        onClick={() => {
                            router.post(route("users.request-email-change", user.id),
                            {}, 
                            { preserveScroll: true });
                        }}
                    >
                        Request Email Change
                    </Button>
                    <Button
                        className="cursor-pointer"
                        onClick={() => setShowReassign(true)}
                    >
                        Reassign Role
                    </Button>
                    <Button
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => setShowDelete(true)}
                    >
                        Delete User
                    </Button>
                </div>
            </ViewModal>

            {/* Role Reassignment Modal */}
            <RoleAssignmentModal
                show={showReassign}
                onClose={() => setShowReassign(false)}
                userId={user.id}
                roles={roles}
                action="reassign"
            />

            <DeleteConfirmationModal
                show={showDelete}
                onCancel={() => setShowDelete(false)}
                onConfirm={() => {
                    router.delete(route("user-approvals.destroy", user.id), {
                        preserveScroll: true,
                        onSuccess: () => setShowDelete(false),
                    });
                }}
                title="Delete User"
                message={
                    <>
                        Are you sure you want to delete the user{" "}
                        <strong>
                            {user.detail 
                                ? `${user.detail.first_name} ${user.detail.last_name}` 
                                : user.name
                            }
                        </strong>
                        ?
                    </>
                }

            />
        </>
    );
}
