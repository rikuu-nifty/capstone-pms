// PerTdaFields.tsx
import type { InventoryList } from '@/types/custom-index';
import type { TurnoverDisposalAssetInput } from '@/types/turnover-disposal-assets';

type Props = {
  value: TurnoverDisposalAssetInput;
  asset: InventoryList;
  onChange: (next: TurnoverDisposalAssetInput) => void;
  parentStatus?: string;
};

export default function PerTdaFields({ asset }: Props) {
  return (
    <div className="grid w-full grid-cols-2 gap-3 text-sm">
      {/* Building */}
      <div className="rounded-md bg-blue-50 p-2">
        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Building
        </dt>
        <dd className="mt-1 font-semibold text-gray-900">
          {asset.building?.name ?? '—'}
        </dd>
      </div>

      {/* Room */}
      <div className="rounded-md bg-blue-50 p-2">
        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Room
        </dt>
        <dd className="mt-1 font-semibold text-gray-900">
          {asset.building_room?.room ?? '—'}
        </dd>
      </div>

      {/* Sub-area */}
      <div className="col-span-2 rounded-md bg-blue-50 p-2">
        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Sub-area
        </dt>
        <dd className="mt-1 font-semibold text-gray-900">
          {asset.sub_area?.name ?? '—'}
        </dd>
      </div>
    </div>
  );
}
