// AssetTdaItem.tsx
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import PerTdaFields from './PerTdaFields';
import type { InventoryList } from '@/types/custom-index';
import type { TurnoverDisposalAssetInput } from '@/types/turnover-disposal-assets';

type HeaderStatus = 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';

type Props = {
  line: TurnoverDisposalAssetInput;
  asset: InventoryList;
  parentStatus?: HeaderStatus;
  onRemove: () => void;
  onChange: (next: TurnoverDisposalAssetInput) => void;
};

export default function AssetTdaItem({ line, asset, parentStatus, onRemove, onChange }: Props) {
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
          {!open && <div className="mt-0.5 text-xs text-muted-foreground">Click to show per-asset details</div>}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50 cursor-pointer"
          >
            {open ? 'Hide Details' : 'Show Details'}
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>

          <button type="button" onClick={onRemove} className="text-red-500 text-xs hover:underline cursor-pointer">
            Remove
          </button>
        </div>
      </div>

      {/* Details */}
      {open && (
        <div className="px-2 pb-2">
          <PerTdaFields value={line} asset={asset} parentStatus={parentStatus} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
