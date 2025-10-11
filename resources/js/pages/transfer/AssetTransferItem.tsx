import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import PerAssetFields from './PerAssetFields';
import type { InventoryList, SubArea } from '@/types/custom-index';
import type { TransferAssetPivot } from '@/types/transfer-asset';

type TransferHeaderStatus =
    | 'pending_review' | 'upcoming' | 'in_progress'
    | 'completed' | 'overdue' | 'cancelled'
;

type Props = {
    ta: TransferAssetPivot;
    asset: InventoryList;
    fromSubAreas: SubArea[];
    toSubAreas: SubArea[];
    
    parentStatus?: TransferHeaderStatus;
    onRemove: () => void;
    onChange: (next: TransferAssetPivot) => void;
};

export default function AssetTransferItem({
    ta, 
    asset, 
    fromSubAreas, 
    toSubAreas, 
    parentStatus, 
    onRemove, 
    onChange,
}: Props) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex flex-col gap-2 rounded-lg border">
            {/* Card header */}
            <div className="flex items-center justify-between px-2 py-2">
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
                        <div className="mt-0.5 text-xs text-muted-foreground">Click to show per-asset details</div>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => setOpen(o => !o)}
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50 cursor-pointer"
                    >
                        {open ? 'Hide Details' : 'Show Details'}
                        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
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

            {/* Details */}
            {open && (
                <div className="px-2 pb-2">
                    <PerAssetFields
                        value={ta}
                        asset={asset}
                        fromSubAreas={fromSubAreas.filter(
                            (sa) => sa.building_room_id === asset.building_room_id
                        )}
                        toSubAreas={toSubAreas}
                        parentStatus={parentStatus}
                        onChange={onChange}
                        renderContainer={false}  // no inner border
                        renderHeader={false}     // no inner toggle header
                        externalOpen={true} 
                    />
                </div>
            )}
        </div>
    );
}
