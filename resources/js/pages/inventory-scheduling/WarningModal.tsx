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

interface WarningModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: React.ReactNode;
    details?: string[];
}

const WarningModal = ({
    show,
    onConfirm,
    onCancel,
    title = 'Validation Warning',
    message = 'Something went wrong.',
    details = [],
}: WarningModalProps) => {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="w-full max-w-md space-y-4 p-6 text-center">
                {/* Icon */}
                <div className="flex justify-center">
                    <XCircle className="h-16 w-16 text-amber-500" />
                </div>

                {/* Title & Description */}
                <DialogHeader className="items-center space-y-2">
                    <DialogTitle className="text-2xl font-semibold">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-base leading-snug text-muted-foreground">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                {/* Extra details */}
                {details.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 text-sm text-left">
                        <p className="mb-2 font-semibold">Affected Assets :</p>
                        <ul className="list-disc pl-5 space-y-1 text-red-600">
                            {details.map((d, i) => (
                                <li key={i}>{d}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Footer */}
                <DialogFooter>
                    <div className="flex w-full justify-center gap-4">
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                className="px-6 cursor-pointer"
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            className="px-6 cursor-pointer"
                            onClick={onConfirm}
                        >
                            Proceed Anyway
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default WarningModal;
