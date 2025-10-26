import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import AssetVfFields from './AssetVfFields';
import type { InventoryLite } from './index';

type Props = {
    line: { inventory_list_id: number; remarks?: string };
    asset: InventoryLite;
    onRemove: () => void;
    onChange: (next: { inventory_list_id: number; remarks?: string }) => void;
};

export default function AssetVfItem({ line, asset, onRemove, onChange }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <div
        className={`flex flex-col gap-2 rounded-lg border shadow-sm transition-all duration-300 ease-in-out ${
            open ? 'bg-white' : 'bg-white hover:bg-gray-50'
        }`}
        >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2">
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="truncate text-base font-semibold text-gray-900">
                        {asset.asset_name}
                    </span>
                    {asset.serial_no && (
                        <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                            {asset.serial_no}
                        </span>
                    )}
                </div>
                    {!open && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                        Click to show per-asset details
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50 cursor-pointer"
                    >
                        {open ? 'Hide Details' : 'Show Details'}
                        {open ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-red-500 text-xs hover:underline cursor-pointer"
                    >
                        Remove
                    </button>
                </div>
            </div>

            {/* Animated collapse */}
            <div
                className={`grid overflow-hidden transition-all duration-300 ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden px-3 pb-3">
                    <AssetVfFields value={line} asset={asset} onChange={onChange} />
                </div>
            </div>
        </div>
    );
}
