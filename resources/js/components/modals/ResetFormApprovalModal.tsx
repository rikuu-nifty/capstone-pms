import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { RefreshCcw } from 'lucide-react';

interface ResetConfirmationModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: React.ReactNode;
}

const ResetConfirmationModal = ({
    show,
    onConfirm,
    onCancel,
    title = 'Confirm Reset',
    message = (
    <>
      Are you sure you want to move this back to <strong>Pending Review</strong>?
    </>
  ),
}: ResetConfirmationModalProps) => {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="w-full max-w-md space-y-4 p-6 text-center">
                {/* Icon */}
                <div className="flex justify-center">
                    <RefreshCcw className="h-16 w-16 text-blue-500" />
                </div>

                {/* Title & Description */}
                <DialogHeader className="items-center space-y-2">
                    <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
                    <DialogDescription className="text-center text-base leading-snug text-muted-foreground">
                        {message}
                        <br />
                        This action will overwrite the current status.
                    </DialogDescription>
                </DialogHeader>

                {/* Footer */}
                <DialogFooter>
                    <div className="flex w-full justify-center gap-4">
                        <DialogClose asChild>
                        <Button 
                            variant="destructive" 
                            className="px-6 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        </DialogClose>
                        <Button
                            variant="blue"
                            className="px-6 cursor-pointer"
                            onClick={onConfirm}
                        >
                            Reset
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ResetConfirmationModal;
