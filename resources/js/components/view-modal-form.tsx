import type { Asset } from '@/pages/inventory-list/index';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type ViewAssetModalProps = {
    asset: Asset;
    onClose: () => void;
};

export const ViewAssetModal = ({ asset, onClose }: ViewAssetModalProps) => {
    const totalCost = asset.unit_cost && asset.quantity
        ? `₱ ${(Number(asset.unit_cost) * Number(asset.quantity)).toFixed(2)}`
        : '—';

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <form>
                <DialogContent className="w-full max-w-[700px] p-6 sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>View Asset</DialogTitle>
                        <DialogDescription>Here are the details of the selected asset.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-2 py-2">
                        <div className="col-span-2">
                            <Label>Asset Name</Label>   
                            <Input value={asset.asset_name} readOnly />
                        </div>

                        <div>
                            <Label>Asset Type</Label>
                            <Input value={asset.asset_type ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Category</Label>
                            <Input value={asset.asset_model?.category?.name ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Brand</Label>
                            <Input value={asset.asset_model?.brand ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Model</Label>
                            <Input value={asset.asset_model?.model ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Quantity</Label>
                            <Input value={asset.quantity?.toString() ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Unit Cost</Label>
                            <Input value={asset.unit_cost?.toString() ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Total Cost</Label>
                            <Input value={totalCost} readOnly />
                        </div>

                        <div>
                            <Label>Serial Number</Label>
                            <Input value={asset.serial_no ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Supplier</Label>
                            <Input value={asset.supplier ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Date Purchased</Label>
                            <Input value={asset.date_purchased ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Building</Label>
                            <Input value={asset.building?.name ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Room</Label>
                            <Input value={asset.building_room?.room?.toString() ?? '—'} readOnly />
                        </div>

                        <div className="col-span-2">
                            <Label>Unit / Department</Label>
                            <Input value={asset.unit_or_department?.name ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Transfer Status</Label>
                            <Input value={asset.transfer_status ?? '—'} readOnly />
                        </div>

                        <div>
                            <Label>Status</Label>
                            <Input value={asset.status === 'active' ? 'Active' : 'Archived'} readOnly />
                        </div>

                        <div>
                            <Label>Memorandum Number</Label>
                            <Input value={asset.memorandum_no?.toString() ?? '—'} readOnly />
                        </div>

                        <div className="col-span-2">
                            <Label>Description</Label>
                            <Textarea value={asset.description} readOnly />
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
