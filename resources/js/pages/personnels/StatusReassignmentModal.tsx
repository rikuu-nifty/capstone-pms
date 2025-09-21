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

interface Props {
    show: boolean;
    onClose: () => void;
    personnelId: number;
    action: "reassign";
}

export default function StatusReassignmentModal({
    show,
    onClose,
    personnelId,
    action,
}: Props) {
    const [status, setStatus] = useState<"" | "active" | "inactive" | "left_university">("");
    const [notes, setNotes] = useState("");

    const handleSubmit = () => {
        if (!personnelId || !status) return;

        if (action === "reassign") {
        router.post(
            route("personnels.reassignStatus", personnelId), // 👉 define this route in web.php
            { status, notes },
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
            <DialogTitle>Reassign Status</DialogTitle>
            <DialogDescription>
                Select a new status for this personnel.
            </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
            {/* Status Select */}
            <div className="grid gap-1">
                <Label htmlFor="status">Status</Label>
                <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive" | "left_university" | "")}
                className="border rounded-md p-2 cursor-pointer"
                >
                <option value="">-- Select Status --</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="left_university">Left University</option>
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
                Reassign
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
}
