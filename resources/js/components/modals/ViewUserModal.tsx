import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import ViewModal from "@/components/modals/ViewModal";
import { Button } from "@/components/ui/button";
import RoleAssignmentModal from "@/components/modals/RoleAssignmentModal";
import { formatDateLong, UserPageProps, formatFullName } from "@/types/custom-index";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import axios from 'axios';

export default function ViewUserModal({ open, onClose, user, roles, unitOrDepartments }: UserPageProps) {
    const [showReassign, setShowReassign] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [localUser, setLocalUser] = useState(user);

    // When parent user prop changes (like after page reload), sync it
    useEffect(() => {
        if (user) setLocalUser(user);
    }, [user]);

    const refreshUser = async () => {
        if (!localUser?.id) return;
        setRefreshing(true);
        try {
            const res = await axios.get(route("users.show", localUser.id)); // backend JSON endpoint
            setLocalUser(res.data.user);
        } catch (err) {
            console.error("Failed to refresh user:", err);
        } finally {
            setRefreshing(false);
        }
    };

    if (!localUser) return null;

    const initials = localUser.detail
        ? `${localUser.detail.first_name?.[0] ?? ""}${localUser.detail.last_name?.[0] ?? ""}`.toUpperCase()
        : (localUser.name?.[0] ?? "").toUpperCase();

    const avatarSrc = localUser?.detail?.image_url ?? (localUser?.detail?.image_path
        ? (localUser.detail.image_path.startsWith('http')
            ? localUser.detail.image_path
            : localUser.detail.image_path.startsWith('images/')
                ? `/${localUser.detail.image_path}`
                : `/storage/${localUser.detail.image_path}`)
        : '')
    ;

    return (
        <>
            <ViewModal
                open={open}
                onClose={onClose}
                size="lg"
                contentClassName="relative max-h-[80vh] overflow-y-auto"
            >
                {refreshing && (
                    <div className="absolute top-2 right-4 text-xs text-blue-500 animate-pulse">
                        Refreshing…
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-6 border-b pb-4">
                    {avatarSrc ? (
                        <img
                            src={avatarSrc}
                            alt={localUser?.name ?? 'User'}
                            className="h-20 w-20 rounded-full object-cover border shadow-md"
                        />
                    ) : (
                        <div className="h-20 w-20 flex items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-700">
                            {initials || "?"}
                        </div>
                    )}

                    <div>
                        <h2 className="text-2xl font-semibold">
                            {localUser.detail
                                ? formatFullName(
                                    localUser.detail.first_name,
                                    localUser.detail.middle_name ?? "",
                                    localUser.detail.last_name
                                )
                                : localUser.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">{localUser.email}</p>
                    </div>
                </div>

                {/* Details */}
                <div className="mt-6 grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-12">
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground">Role</span>
                        <p className="text-base font-semibold">{localUser.role?.name ?? "—"}</p>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground">Status</span>
                        <p className="flex items-center gap-1 text-base font-semibold capitalize">
                            {localUser.status === "approved" && (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-600" /> Approved
                                </>
                            )}
                            {localUser.status === "denied" && (
                                <>
                                    <XCircle className="h-5 w-5 text-red-600" /> Denied
                                </>
                            )}
                            {localUser.status === "pending" && (
                                <>
                                    <Clock className="h-5 w-5 text-yellow-600" /> Pending
                                </>
                            )}
                        </p>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground">Unit / Department</span>
                        <p className="text-base font-semibold text-blue-600">
                            {localUser.unit_or_department?.name ?? "—"}
                        </p>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground">Approved On</span>
                        <p className="text-base">{formatDateLong(localUser.approved_at) ?? "—"}</p>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground">Updated On</span>
                        <p className="text-base">{formatDateLong(localUser.updated_at) ?? "N/A"}</p>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground">Notes</span>
                        <p className="text-base">{localUser.approval_notes ?? "N/A"}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-wrap gap-3 justify-center">
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => router.post(route("users.reset-password", localUser.id))}
                    >
                        Reset Password
                    </Button>
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => router.post(route("users.request-email-change", localUser.id))}
                    >
                        Request Email Change
                    </Button>
                    <Button className="cursor-pointer" onClick={() => setShowReassign(true)}>
                        Reassign Role/Unit
                    </Button>
                </div>
            </ViewModal>

            {/* Role Reassignment Modal */}
            {showReassign && (
                <RoleAssignmentModal
                    show={showReassign}
                    onClose={() => {
                        setShowReassign(false);
                        refreshUser(); // ✅ instant refresh from DB
                    }}
                    userId={localUser.id}
                    roles={roles}
                    action="reassign"
                    unitOrDepartments={unitOrDepartments}
                    currentRoleId={localUser.role?.id ?? null}
                    currentUnitOrDeptId={localUser.unit_or_department_id ?? null}
                />
            )}
        </>
    );
}
