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

type DeleteAssetModalProps = {
  asset: Asset;
  onClose: () => void;
  onDelete: (id: number) => void;
};

export const DeleteAssetModal = ({ asset, onClose, onDelete }: DeleteAssetModalProps) => {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Asset</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>"{asset.asset_name}"</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={() => onDelete(asset.id)}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
