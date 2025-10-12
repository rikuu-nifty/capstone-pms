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
import { AlertTriangle } from 'lucide-react';

interface ConfirmActionModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmActionModal = ({
    show,
    onConfirm,
    onCancel,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Yes, Continue',
    cancelText = 'Cancel',
}: ConfirmActionModalProps) => {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="w-full max-w-md space-y-4 p-6 text-center">
                {/* Icon */}
                <div className="flex justify-center">
                    <AlertTriangle className="h-16 w-16 text-red-500" />
                </div>

                {/* Title & Message */}
                <DialogHeader className="items-center space-y-2">
                    <DialogTitle className="text-2xl font-semibold text-red-600">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-base leading-snug text-muted-foreground">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                {/* Footer Buttons */}
                <DialogFooter>
                    <div className="flex w-full justify-center gap-4">
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                className="px-6 cursor-pointer"
                                onClick={onCancel}
                            >
                                {cancelText}
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            className="px-6 cursor-pointer"
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmActionModal;
