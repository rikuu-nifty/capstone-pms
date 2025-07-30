import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Asset } from '@/pages/inventory-list/index';
import { XCircle } from 'lucide-react'; // or any icon lib you prefer

type DeleteAssetModalProps = {
    asset: Asset;
    onClose: () => void;
    onDelete: (id: number) => void;
};

export const DeleteAssetModal = ({ asset, onClose, onDelete }: DeleteAssetModalProps) => {
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
                        Do you really want to delete <strong>"{asset.asset_name}"</strong>?<br />
                        This process cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <div className="flex w-full justify-center gap-4">
                        <DialogClose asChild>
                            <Button variant="outline" className="px-6">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button variant="destructive" className="px-6" onClick={() => onDelete(asset.id)}>
                            Delete
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
