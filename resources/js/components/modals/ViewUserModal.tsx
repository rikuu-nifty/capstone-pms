import { useState } from "react";
import { router } from "@inertiajs/react";
import ViewModal from "@/components/modals/ViewModal";
import { Button } from "@/components/ui/button";
import RoleAssignmentModal from "@/components/modals/RoleAssignmentModal";
import { UserPageProps } from "@/types/custom-index";

export default function ViewUserModal({ open, onClose, user, roles }: UserPageProps) {
    const [showReassign, setShowReassign] = useState(false);

    if (!user) return null;

    return (
        <>
            <ViewModal open={open} onClose={onClose} size="lg">
                <h2 className="text-xl font-semibold mb-4">User Details</h2>

                {/* User Info */}
                <div className="grid gap-2 mb-6">
                <div><span className="font-medium">Full Name:</span> {user.detail ? `${user.detail.first_name} ${user.detail.last_name}` : user.name}</div>
                <div><span className="font-medium">Email:</span> {user.email}</div>
                <div><span className="font-medium">Role:</span> {user.role?.name ?? "—"}</div>
                <div><span className="font-medium">Status:</span> {user.status}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                <Button variant="outline" className="cursor-pointer">
                    Reset Password
                </Button>
                <Button variant="outline" className="cursor-pointer">
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
                    onClick={() =>
                    window.confirm("Are you sure?") &&
                    router.delete(route("user-approvals.destroy", user.id), {
                        preserveScroll: true,
                    })
                    }
                >
                    Delete User
                </Button>
                </div>
            </ViewModal>

            {/* Stacked modal for role reassignment */}
            <RoleAssignmentModal
                show={showReassign}
                onClose={() => setShowReassign(false)}
                userId={user.id}
                roles={roles}
                action="reassign"
            />
        </>
    );
}
