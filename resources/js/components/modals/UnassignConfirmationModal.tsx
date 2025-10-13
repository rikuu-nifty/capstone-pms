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

interface UnassignConfirmationModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    assetName?: string;
    personnelName?: string;
}

export default function UnassignConfirmationModal({
    show,
    onConfirm,
    onCancel,
    assetName,
    personnelName,
}: UnassignConfirmationModalProps) {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="w-full max-w-md space-y-4 p-6 text-center">
                <div className="flex justify-center">
                    <AlertTriangle className="h-16 w-16 text-yellow-500" />
                </div>

                {/* Header */}
                <DialogHeader className="items-center space-y-2">
                    <DialogTitle className="text-2xl font-semibold">
                        Confirm Unassignment
                    </DialogTitle>
                    <DialogDescription className="text-center text-base leading-snug text-muted-foreground">
                        Are you sure you want to remove assignment of{' '}
                        <span className="font-semibold text-blue-600">
                            {assetName ?? 'this asset'}
                        </span>{' '}
                        from{' '}
                        <span className="font-semibold text-blue-600">
                            {personnelName ?? 'this personnel'}
                        </span>
                        ?
                    </DialogDescription>
                </DialogHeader>

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
                            Yes, Remove
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
