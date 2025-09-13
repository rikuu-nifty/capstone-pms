import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatEnums, ucwords } from '@/types/custom-index';
import { XCircle } from 'lucide-react';

interface TransferStatusWarningModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    desiredStatus: 'completed' | 'cancelled' | 'overdue' | 'pending_review' | 'upcoming' | 'in_progress';
    actualStatus?: 'completed' | 'cancelled' | 'overdue' | 'pending_review' | 'upcoming' | 'in_progress';
    conflictingAssets: { id: number; name?: string; asset_transfer_status: string }[];
}

export default function TransferStatusWarningModal({
    show,
    onConfirm,
    onCancel,
    desiredStatus,
    actualStatus,
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
                        {/* {actualStatus
                            ? <>You are trying to set this transfer record to <b>"{formatEnums(desiredStatus)}"</b>.</>
                            : <>You are trying to set this transfer record to <b>"{formatEnums(actualStatus)}"</b>.</>
                        } */}
                        You are trying to set this transfer record to <b>"{formatEnums(desiredStatus)}"</b>.
                    </DialogDescription>
                </DialogHeader>

                {/* Conflicting Assets List */}
                {conflictingAssets.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-md p-3 text-sm text-left">
                        {conflictingAssets.map((asset) => (
                            <div key={asset.id} className="mb-2">
                                • <b>Asset #{asset.id}</b>
                                {asset.name ? ` (${ucwords(asset.name)})` : ''} is currently set as{' '}
                                <b
                                    className={
                                    asset.asset_transfer_status === 'pending'
                                        ? 'text-yellow-600'
                                        : asset.asset_transfer_status === 'transferred'
                                        ? 'text-green-600'
                                        : asset.asset_transfer_status === 'cancelled'
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                    }
                                >
                                    <i>{ucwords(asset.asset_transfer_status)}</i>
                                </b>.
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-sm text-muted-foreground mt-2">
                    {/* Overdue but no pending assets */}
                    {desiredStatus === 'overdue' && actualStatus && (
                        <>
                            You are trying to set this transfer record to <b>"Overdue"</b>, 
                            but there are no pending assets.
                            It will instead remain <b>"{ucwords(actualStatus)}"</b> 
                            .
                        </>
                    )}

                    {/* Overdue and has pending assets */}
                    {desiredStatus === 'overdue' && conflictingAssets.some(a => a.asset_transfer_status === 'pending') && (
                        <>
                        This transfer can only be marked as <b>"Overdue"</b> while one or more assets remain in a <b>"Pending"</b> state. <br />
                        Any pending assets must be resolved <i>("transferred" or "cancelled")</i> before this record can move out of the <b>"Overdue"</b> status.
                        </>
                    )}

                    {/* Mixed transferred + cancelled assets */}
                    {desiredStatus === 'completed' &&
                        conflictingAssets.every(a => a.asset_transfer_status !== 'pending') && 
                        conflictingAssets.some(a => a.asset_transfer_status === 'cancelled') &&
                        conflictingAssets.some(a => a.asset_transfer_status === 'transferred') && (
                            <>
                            This transfer record contains assets with both <b>"Transferred"</b> and <b>"Cancelled"</b> statuses. <br />
                            The record cannot be marked as <b>"Completed"</b> and will remain <b>"In Progress"</b>.
                            </>
                    )}


                    {/* Completed/Cancelled but still pending assets */}
                    {(desiredStatus === 'completed' || desiredStatus === 'cancelled') && conflictingAssets.length > 0 && (
                        <>Any asset(s) still marked as <b>"Pending"</b> will be automatically updated to <b>"{ucwords(desiredStatus)}"</b>.</>
                    )}

                    {/* Pending Review */}
                    {desiredStatus === 'pending_review' && (
                        <>Reverting to <b>"Pending Review"</b> will reset these assets back to <b>"Pending"</b> 
                        and revert back to their original locations.</>
                    )}

                    {/* Upcoming */}
                    {desiredStatus === 'upcoming' && (
                        <>Setting to <b>"Upcoming"</b> will reset transferred assets back to <b>"Pending"</b> and revert back to their original locations.</>
                    )}

                    {/* In Progress */}
                    {desiredStatus === 'in_progress' && (
                        <>This transfer record is currently marked as <b>"{formatEnums(actualStatus ?? 'Completed')}"</b>, 
                        but because some assets are still marked as <b>"Pending"</b>, 
                        it will be automatically downgraded to <b>"In Progress"</b>.</>
                    )}

                    {/* Overdue after revert (completed → overdue with pending) */}
                    {desiredStatus === 'overdue' && actualStatus === 'completed' && conflictingAssets.some(a => a.asset_transfer_status === 'pending') && (
                        <>This transfer record is currently marked as <b>Completed</b>, 
                        but because some assets were reverted to <b>Pending</b> and the scheduled date has passed, 
                        it will be automatically downgraded to <b>Overdue</b>.</>
                    )}

                    {/* Completed after overdue (no pending) */}
                    {desiredStatus === 'completed' && conflictingAssets.length === 0 && actualStatus === 'overdue' && (
                        <>This transfer record is currently marked as <b>"Overdue"</b>, 
                        but since there are no pending assets, it will be updated to <b>"Completed"</b>.</>
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
