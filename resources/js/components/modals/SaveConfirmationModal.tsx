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
import { CheckCircle2 } from 'lucide-react';

interface SaveConfirmationModalProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    message?: React.ReactNode;
}

const SaveConfirmationModal = ({
    show,
    onClose,
    title = 'Changes Saved',
    message = 'Your profile information has been successfully updated.',
}: SaveConfirmationModalProps) => {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-md space-y-4 p-6 text-center">
                {/* Icon */}
                <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>

                {/* Title & Message */}
                <DialogHeader className="items-center space-y-2">
                    <DialogTitle className="text-2xl font-semibold text-green-600">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-base leading-snug text-muted-foreground">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                {/* Footer */}
                <DialogFooter>
                    <div className="flex w-full justify-center">
                        <DialogClose asChild>
                            <Button
                                variant="success"
                                className="px-6 cursor-pointer bg-green-600 hover:bg-green-700"
                                onClick={onClose}
                            >
                                OK
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SaveConfirmationModal;
