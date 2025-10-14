import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { XCircle } from 'lucide-react';

// adjust the import path to where your Scheduled type lives
import type { Scheduled } from '@/pages/inventory-scheduling/index';

type DeleteScheduleModalProps = {
    schedule: Scheduled;
    onClose: () => void;
    onDelete: (id: number) => void;
};

export const DeleteScheduleModal = ({ schedule, onClose, onDelete }: DeleteScheduleModalProps) => {
    // const label =
    //     `${schedule.inventory_schedule || 'Unscheduled'} • ` +
    //     `${schedule.unit_or_department?.name ?? 'No Unit'} • ` +
    //     `${schedule.building?.name ?? 'No Building'}`;

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-md space-y-4 p-6 text-center">
                {/* Icon */}
                <div className="flex justify-center">
                    <XCircle className="h-16 w-16 text-red-500" />
                </div>

                {/* Title & Description */}
                <DialogHeader className="items-center space-y-2">
                    <DialogTitle className="text-2xl font-semibold">Are you sure?</DialogTitle>
                    <DialogDescription className="text-center text-base leading-snug text-muted-foreground">
                        Do you really want to delete this schedule?
                        <br />
                        {/* <strong>"{label}"</strong> */}
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
                        <Button variant="destructive" className="px-6" onClick={() => onDelete(schedule.id)}>
                            Delete
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
