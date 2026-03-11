import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { XCircle } from 'lucide-react';

type VerificationFormDeleteModalProps = {
    verification: {
        id: number;
        status: string;
    };
    onClose: () => void;
    onDelete: (id: number) => void;
};

export default function VerificationFormDeleteModal({
    verification,
    onClose,
    onDelete,
}: VerificationFormDeleteModalProps) {
    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-md space-y-4 p-6 text-center">
                <div className="flex justify-center">
                    <XCircle className="h-16 w-16 text-red-500" />
                </div>

                <DialogHeader className="items-center space-y-2">
                    <DialogTitle className="text-2xl font-semibold">Are you sure?</DialogTitle>
                    <DialogDescription className="text-center text-base leading-snug text-muted-foreground">
                        Do you really want to delete{' '}
                        <strong className="text-blue-600">
                            VF-{verification.id.toString().padStart(3, '0')}
                        </strong>
                        ?
                        <br />
                        <br />
                        This will move it to the Trash Bin and can be restored later.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <div className="flex w-full justify-center gap-4">
                        <DialogClose asChild>
                            <Button variant="outline" className="px-6">
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            variant="destructive"
                            className="px-6"
                            onClick={() => onDelete(verification.id)}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}