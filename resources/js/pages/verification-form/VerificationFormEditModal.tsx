import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface VerificationFormEditModalProps {
    show: boolean;
    onClose: () => void;
    verificationId: number | null;
}

export default function VerificationFormEditModal({
    show,
    onClose,
    verificationId,
}: VerificationFormEditModalProps) {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!show) {
        setNotes('');
        }
    }, [show]);

    const handleSubmit = () => {
        if (!verificationId) return;

        router.patch(
        route('verification-form.verify', verificationId),
        { notes },
        {
            preserveScroll: true,
            onSuccess: () => {
            onClose();
            },
        }
        );
    };

    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-md space-y-4">
                <DialogHeader>
                    <DialogTitle>Verify Form</DialogTitle>
                    <DialogDescription>
                        Please confirm verification and optionally add your notes below.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-1">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <textarea
                            id="notes"
                            placeholder="Add verification notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y whitespace-pre-wrap break-words"
                            rows={5}
                        />
                    </div>
                </div>

                <DialogFooter className="flex justify-end gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" className="cursor-pointer">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white">
                        Confirm Verification
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
