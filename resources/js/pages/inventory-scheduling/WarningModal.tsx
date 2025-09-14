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
    onClose: () => void;
    title?: string;
    message?: React.ReactNode;
    details?: string[];
}

const WarningModal = ({
    show,
    onClose,
    title = 'Validation Warning',
    message = 'Something went wrong.',
    details = [],
}: WarningModalProps) => {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
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
                    <div className="mt-2 text-left">
                        <p className="text-sm font-medium text-gray-700 mb-1">Affected:</p>
                        <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
                            {details.map((d, i) => (
                                <li key={i}>{d}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Footer */}
                <DialogFooter>
                    <div className="flex w-full justify-center">
                        <DialogClose asChild>
                            <Button className="px-6 cursor-pointer">OK</Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default WarningModal;
