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
//   DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CustomModalFormProps = {
  asset: Asset;
  onClose: () => void;
};

export const EditAssetModalForm = ({ asset, onClose }: CustomModalFormProps) => {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>
              Make changes to the asset. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="asset_name">Asset Name</Label>
              <Input
                id="asset_name"
                name="asset_name"
                defaultValue={asset.asset_name}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="serial_no">Serial No</Label>
              <Input
                id="serial_no"
                name="serial_no"
                defaultValue={asset.asset_model?.model || ''}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};
