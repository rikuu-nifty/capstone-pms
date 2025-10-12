import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Button } from "@/components/ui/button";
import type { Asset } from '@/pages/inventory-list/index';
import { FileText, Package } from 'lucide-react';

interface ChooseViewModalProps {
    open: boolean;
    onClose: () => void;
    asset: Asset;
    onViewAsset: () => void;
    onViewMemo: () => void;
}

export function ChooseViewModal({ open, onClose, asset, onViewAsset, onViewMemo }: ChooseViewModalProps) {
    if (!asset) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent 
                className="p-6 sm:max-w-4xl"
                aria-describedby={undefined}
            >
                <DialogHeader className="text-center">
                    <DialogTitle className="text-xl font-bold">Choose View Option</DialogTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Select what you want to view for <strong>{asset.asset_name}</strong>.
                    </p>
                </DialogHeader>

                {/* Options */}
                <div className="mt-2 mb-5 grid grid-cols-2 gap-6">
                    {/* Memorandum Receipt */}
                    <button
                        onClick={onViewMemo}
                         
                        className="flex flex-col items-center justify-center gap-3 rounded-xl border p-6 shadow-sm transition hover:bg-blue-50 hover:shadow-md dark:hover:bg-zinc-800 cursor-pointer"
                    >
                        <FileText className="h-12 w-12 text-blue-600" />
                        <div className="text-base font-semibold">Memorandum Receipt</div>
                        <div className="text-center text-xs text-muted-foreground">View official receipt details</div>
                    </button>

                    {/* Asset Details */}
                    <button
                        onClick={onViewAsset}
                        className="cursor-pointer flex flex-col items-center justify-center gap-3 rounded-xl bg-blue-600 p-6 text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none"
                    >
                        <Package className="h-12 w-12" />
                        <div className="text-base font-semibold">Asset Details</div>
                        <div className="text-center text-xs opacity-90">View detailed information</div>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
