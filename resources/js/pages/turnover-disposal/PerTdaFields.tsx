// PerTdaFields.tsx
import { useEffect } from 'react';
import type { InventoryList } from '@/types/custom-index';
import type { TurnoverDisposalAssetInput, TdaStatus } from '@/types/turnover-disposal-assets';

type HeaderStatus = 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';

type Props = {
  value: TurnoverDisposalAssetInput;
  onChange: (next: TurnoverDisposalAssetInput) => void;
  asset: InventoryList;
  parentStatus?: HeaderStatus;
};

export default function PerTdaFields({ value, onChange, asset, parentStatus }: Props) {
  // If header is pending_review, lock each per-asset status to 'pending'
  const headerPending = parentStatus === 'pending_review';

  useEffect(() => {
    if (headerPending && value.asset_status !== 'pending') {
      onChange({ ...value, asset_status: 'pending' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerPending]);

  return (
    <div className="grid w-full grid-cols-5 gap-1.5 text-[12px]">
      {/* Asset label (readonly, just context) */}
      <div className="col-span-5">
        <div className="text-xs text-gray-600">
          {asset.asset_name} {asset.serial_no ? `(${asset.serial_no})` : ''}
        </div>
      </div>

      {/* Asset Status */}
      <div className="col-span-5 sm:col-span-2">
        <label className="mb-0.5 block font-medium">Asset Status</label>
        <select
          className="w-full rounded-md border p-1.5"
          value={value.asset_status}
          onChange={(e) => onChange({ ...value, asset_status: e.target.value as TdaStatus })}
          disabled={headerPending}
          title={headerPending ? 'Disabled while record is Pending Review' : undefined}
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Date Finalized */}
      <div className="col-span-5 sm:col-span-2">
        <label className="mb-0.5 block font-medium">Date Finalized</label>
        <input
          type="date"
          className="w-full rounded-md border p-1.5"
          value={value.date_finalized ?? ''}
          onChange={(e) => onChange({ ...value, date_finalized: e.target.value || null })}
        />
      </div>

      {/* Remarks */}
      <div className="col-span-5">
        <label className="mb-0.5 block font-medium">Remarks</label>
        <input
          type="text"
          className="w-full rounded-md border p-1.5"
          value={value.remarks}
          onChange={(e) => onChange({ ...value, remarks: e.target.value })}
          placeholder="Optional notes for this asset"
        />
      </div>
    </div>
  );
}
