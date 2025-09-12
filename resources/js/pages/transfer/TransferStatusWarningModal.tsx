import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ucwords } from '@/types/custom-index';
import { XCircle } from 'lucide-react';

interface TransferStatusWarningModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    desiredStatus: 'completed' | 'cancelled' | 'overdue' | 'pending_review' | 'upcoming' | 'in_progress';
    conflictingAssets: { id: number; name?: string; asset_transfer_status: string }[];
}

export default function TransferStatusWarningModal({
    show,
    onConfirm,
    onCancel,
    desiredStatus,
    conflictingAssets,
}: TransferStatusWarningModalProps) {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="w-full max-w-md space-y-4 p-6 text-center">
                {/* Icon */}
                <div className="flex justify-center">
                    <XCircle className="h-16 w-16 text-yellow-500" />
                </div>

                {/* Title & Description */}
                <DialogHeader className="items-center space-y-2">
                    <DialogTitle className="text-2xl font-semibold">
                        Transfer Status Conflict
                    </DialogTitle>
                    <DialogDescription className="text-center text-base leading-snug text-muted-foreground">
                        You are trying to set this transfer record to <b>{ucwords(desiredStatus)}</b>.
                    </DialogDescription>
                </DialogHeader>

                {/* Conflicting Assets List */}
                {conflictingAssets.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-md p-3 text-sm text-left">
                        {conflictingAssets.map((asset) => (
                            <div key={asset.id} className="mb-1">
                                • Asset #{asset.id}
                                {asset.name ? ` (${ucwords(asset.name)})` : ''} is currently <b>{ucwords(asset.asset_transfer_status)}</b> transfer.
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-sm text-muted-foreground mt-2">
                    {desiredStatus === 'overdue' && (
                        <>This transfer cannot be marked as <b>"Overdue"</b> unless there are still <b>"Pending"</b> assets.</>
                    )}
                    {(desiredStatus === 'completed' || desiredStatus === 'cancelled') && conflictingAssets.length > 0 && (
                        <>Any asset(s) still marked as <b>"Pending"</b> will be automatically updated to <b>"{ucwords(desiredStatus)}"</b>.</>
                    )}
                    {desiredStatus === 'pending_review' && (
                        <>Reverting to <b>"Pending Review"</b> will reset these assets back to <b>"Pending"</b> 
                        and roll back their locations.</>
                    )}
                    {desiredStatus === 'upcoming' && (
                        <>Setting to <b>"Upcoming"</b> will reset transferred assets back to <b>"Pending"</b> and roll back their locations.</>
                    )}
                    {desiredStatus === 'in_progress' && (
                        <>This transfer record will be automatically downgraded to <b>"In Progress"</b> because some assets are still marked as <b>"Pending"</b>.</>
                    )}
                    {desiredStatus === 'completed' && conflictingAssets.length === 0 && (
                        <>This transfer cannot remain marked as <b>Overdue</b> because there are no pending assets. 
                        It will be updated to <b>Completed</b> since the remaining assets are transferred or cancelled.</>
                    )}
                </p>

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
                        {desiredStatus !== 'overdue' && (
                            <Button
                                variant="destructive"
                                className="px-6 cursor-pointer"
                                onClick={onConfirm}
                            >
                                Proceed Anyway
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
