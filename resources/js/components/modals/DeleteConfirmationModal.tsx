import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { XCircle } from 'lucide-react';

interface DeleteConfirmationModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: React.ReactNode;
}

const DeleteConfirmationModal = ({
    show,
    onConfirm,
    onCancel,
    title = 'Confirm Deletion',
    message = 'Are you sure you want to delete this transfer?',
}: DeleteConfirmationModalProps) => {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="w-full max-w-md space-y-4 p-6 text-center">
                {/* Icon */}
                <div className="flex justify-center">
                    <XCircle className="h-16 w-16 text-red-500" />
                </div>

                {/* Title & Description */}
                <DialogHeader className="items-center space-y-2">
                    <DialogTitle className="text-2xl font-semibold">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-base leading-snug text-muted-foreground">
                        {message}
                        <br />
                        This process cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                {/* Footer */}
                <DialogFooter>
                    <div className="flex w-full justify-center gap-4">
                        <DialogClose asChild>
                            <Button 
                                variant="outline" 
                                className="px-6 cursor-pointer"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            className="px-6 cursor-pointer"
                            onClick={onConfirm}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteConfirmationModal;
