import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Layers } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSingle: () => void;
  onBulk: () => void;
};

export function ChooseAddTypeModal({ open, onClose, onSingle, onBulk }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6 sm:max-w-4xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold">Choose Add Type</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Select how you want to add assets.
          </p>
        </DialogHeader>

        {/* Options */}
        <div className="mt-2 mb-5 grid grid-cols-2 gap-6">
          {/* Left card — outlined / white with blue icon */}
          <button
            onClick={onSingle}
            className="cursor-pointer flex flex-col items-center justify-center gap-3 rounded-xl border p-6 shadow-sm transition hover:shadow-md hover:bg-blue-50 focus:outline-none"
          >
            <Package className="h-12 w-12 text-blue-600" />
            <div className="text-base font-semibold">Single Asset</div>
            <div className="text-center text-xs text-muted-foreground">
              Add one item with full details
            </div>
          </button>

          {/* Right card — solid black with white icon/text */}
<button
  onClick={onBulk}
  className="cursor-pointer flex flex-col items-center justify-center gap-3 rounded-xl bg-blue-600 p-6 text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none"
>
  <Layers className="h-12 w-12 text-white" />
  <div className="text-base font-semibold">Bulk Assets</div>
  <div className="text-center text-xs opacity-90">
    Upload multiple items at once
  </div>
</button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
