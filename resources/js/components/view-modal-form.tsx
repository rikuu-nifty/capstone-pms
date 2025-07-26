import type { Asset } from '@/pages/inventory-list/index';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ViewAssetModalProps = {
  asset: Asset;
  onClose: () => void;
};

export const ViewAssetModal = ({ asset, onClose }: ViewAssetModalProps) => {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>View Asset</DialogTitle>
            <DialogDescription>
              Here are the details of the selected asset.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="asset_name">Asset Name</Label>
              <Input
                id="asset_name"
                value={asset.asset_name}
                readOnly
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="serial_no">Serial No</Label>
              <Input
                id="serial_no"
                value={asset.asset_model?.model || '—'}
                readOnly
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={asset.asset_model?.category?.name ?? '—'}
                readOnly
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="building">Building</Label>
              <Input
                id="building"
                value={asset.building?.name ?? '—'}
                readOnly
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="unit">Unit / Department</Label>
              <Input
                id="unit"
                value={asset.unit_or_department?.name ?? '—'}
                readOnly
              />
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
