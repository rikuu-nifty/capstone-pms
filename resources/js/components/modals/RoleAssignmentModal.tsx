import { useState } from "react";
import { router } from "@inertiajs/react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// import { Role, RolePageProps } from "@/types/role";
import { RolePageProps } from "@/types/role";

export default function RoleAssignmentModal({
    show,
    onClose,
    userId,
    roles,
    action,
}: RolePageProps) {

    const [roleId, setRoleId] = useState<number | "">("");
    const [notes, setNotes] = useState("");

    const handleSubmit = () => {
        if (!userId || !roleId) return;

        if (action === "approve") {
        router.post(
            route("users.approve", userId),
            { role_id: roleId, notes },
            {
            preserveScroll: true,
            onSuccess: onClose,
            }
        );
        } else if (action === "reassign") {
        router.post(
            route("users.reassignRole", userId),
            { role_id: roleId, notes },
            {
            preserveScroll: true,
            onSuccess: onClose,
            }
        );
        }
    };

    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-md space-y-4">
                <DialogHeader>
                    <DialogTitle>
                        {action === "approve" ? "Assign Role on Approval" : "Reassign Role"}
                    </DialogTitle>
                    <DialogDescription>
                        {action === "approve"
                        ? "Select a role before approving this user."
                        : "Select a new role for this user."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    {/* Role Select */}
                    <div className="grid gap-1">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            value={roleId}
                            onChange={(e) =>
                            setRoleId(e.target.value ? Number(e.target.value) : "")
                            }
                            className="border rounded-md p-2"
                        >
                            <option value="">-- Select Role --</option>
                            {(roles ?? []).map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="grid gap-1">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Input
                            id="notes"
                            placeholder="Add notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="flex justify-end gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" className="cursor-pointer">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} className="cursor-pointer">
                        {action === "approve" ? "Approve & Assign" : "Reassign"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
