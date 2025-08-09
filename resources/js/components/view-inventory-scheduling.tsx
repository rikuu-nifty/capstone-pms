import type { Scheduled } from '@/pages/inventory-scheduling/index';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type ViewScheduleModalProps = {
    schedule: Scheduled;
    onClose: () => void;
};

export const ViewScheduleModal = ({ schedule, onClose }: ViewScheduleModalProps) => {
    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <form>
                <DialogContent className="w-full max-w-[700px] p-6 sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>View Schedule</DialogTitle>
                        <DialogDescription>Here are the details of the selected schedule.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-2 py-2">
                        <div>
                            <Label>Inventory Schedule (Month)</Label>
                            <Input value={schedule.inventory_schedule ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Actual Date of Inventory</Label>
                            <Input value={schedule.actual_date_of_inventory ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Building</Label>
                            <Input value={schedule.building?.name ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Room</Label>
                            <Input value={schedule.building_room?.room?.toString() ?? '—'} readOnly />
                        </div>

                        <div className="col-span-2">
                            <Label>Unit / Department</Label>
                            <Input value={schedule.unit_or_department?.name ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Assigned To (User)</Label>
                            <Input value={schedule.user?.name ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Designated Employee</Label>
                            <Input value={schedule.designated_employee?.name ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Assigned By</Label>
                            <Input value={schedule.assigned_by?.name ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Checked By</Label>
                            <Input value={schedule.checked_by ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Verified By</Label>
                            <Input value={schedule.verified_by ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Received By</Label>
                            <Input value={schedule.received_by ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Status</Label>
                            <Input value={schedule.scheduling_status ?? '—'} readOnly />
                        </div>

                        <div className="col-span-2">
                            <Label>Remarks</Label>
                            <Textarea value={schedule.description ?? ''} readOnly />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
};
