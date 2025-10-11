import { useState, useEffect } from "react";
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
import Select, { SingleValue } from "react-select";
import { RolePageProps } from "@/types/role";

type Option = { value: number; label: string };

interface ExtendedProps extends RolePageProps {
    unitOrDepartments: { id: number; name: string }[];
    currentRoleId?: number | null;
    currentUnitOrDeptId?: number | null;   
}

export default function RoleAssignmentModal({
    show,
    onClose,
    userId,
    roles,
    action,
    unitOrDepartments,
    currentRoleId,
    currentUnitOrDeptId,
}: ExtendedProps) {
    const [roleId, setRoleId] = useState<number | "">("");
    const [unitOrDeptId, setUnitOrDeptId] = useState<number | "">("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (show) {
            setRoleId(currentRoleId ?? ""); 
            setUnitOrDeptId(currentUnitOrDeptId ?? "");
        }
    }, [show, currentRoleId, currentUnitOrDeptId]);

    const handleSubmit = () => {
        if (!userId || !roleId) return;

        const payload = {
        role_id: roleId,
        notes,
        unit_or_department_id: unitOrDeptId || null,
        };

        if (action === "approve") {
        router.post(route("users.approve", userId), payload, {
            preserveScroll: true,
            onSuccess: onClose,
        });
        } else if (action === "reassign") {
        router.post(route("users.reassignRole", userId), payload, {
            preserveScroll: true,
            onSuccess: onClose,
        });
        }
    };

    const roleOptions: Option[] = (roles ?? []).map((r) => ({
        value: r.id,
        label: r.name,
    }));

    const unitOptions: Option[] = (unitOrDepartments ?? []).map((u) => ({
        value: u.id,
        label: u.name,
    }));

    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-full max-w-md space-y-4">
            <DialogHeader>
            <DialogTitle>
                {action === "approve" ? "Assign Role & Unit" : "Reassign Role & Unit"}
            </DialogTitle>
            <DialogDescription>
                {action === "approve"
                ? "Select a role and unit before approving this user."
                : "Select a new role and/or unit for this user."}
            </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
            {/* Role Select */}
            <div className="grid gap-1">
                <Label htmlFor="role">Role</Label>
                <Select
                    options={roleOptions}
                    value={roleOptions.find((o) => o.value === roleId) || null}
                    onChange={(opt: SingleValue<Option>) =>
                        setRoleId(opt ? opt.value : "")
                    }
                    placeholder="Select a role..."
                />
            </div>

            {/* Unit/Department Select */}
            <div className="grid gap-1">
                <Label htmlFor="unit">Unit/Department (Optional)</Label>
                <Select
                    options={unitOptions}
                    value={unitOptions.find((o) => o.value === unitOrDeptId) || null}
                    onChange={(opt: SingleValue<Option>) =>
                        setUnitOrDeptId(opt ? opt.value : "")
                    }
                    placeholder="Select a unit/department"
                    isClearable
                />
            </div>

            {/* Notes */}
            <div className="grid gap-1">
                <Label htmlFor="notes">Notes (Optional)</Label>
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
