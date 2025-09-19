import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { InventoryList, SubArea } from '@/types/custom-index';
import type { TransferAssetPivot } from '@/types/transfer-asset';

type TransferHeaderStatus =
  | 'pending_review' | 'upcoming' | 'in_progress'
  | 'completed' | 'overdue' | 'cancelled';

type Props = {
  value: TransferAssetPivot;
  onChange: (next: TransferAssetPivot) => void;
  asset: InventoryList;
  fromSubAreas: SubArea[];
  toSubAreas: SubArea[];
  parentStatus?: TransferHeaderStatus;

  // layout controls
  renderContainer?: boolean; // keeps outer border; default true
  renderHeader?: boolean;    // shows internal header; default true
  externalOpen?: boolean;    // if defined, overrides internal open state
};

export default function PerAssetFields({
  value,
  onChange,
  asset,
  fromSubAreas,
  toSubAreas,
  // parentStatus,
  renderContainer = true,
  renderHeader = true,
  externalOpen,
}: Props) {
  const [open, setOpen] = useState(false);
  // const isHeaderPending = parentStatus === 'pending_review';

  // useEffect(() => {
  //   if (isHeaderPending && value.asset_transfer_status !== 'pending') {
  //     onChange({ ...value, asset_transfer_status: 'pending' });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isHeaderPending]);

  // Decide visibility: externalOpen wins; otherwise use internal state
  const isOpen = typeof externalOpen === 'boolean' ? externalOpen : open;

  const Wrapper: React.ElementType = renderContainer ? 'div' : 'section';
  const wrapperClass = renderContainer ? 'rounded-md border' : '';

  // Optional header (only when renderHeader is true)
  const Header = renderHeader ? (
    <button
      type="button"
      onClick={() => setOpen(o => !o)}
      className={`flex w-full items-center justify-between gap-2 border-b bg-gray-50 px-2 py-2 text-left transition hover:bg-gray-100 ${renderContainer ? 'rounded-md' : ''}`}
      aria-expanded={isOpen}
    >
      <span className="truncate text-sm font-medium text-gray-800">
        {asset.asset_name} {asset.serial_no ? `(${asset.serial_no})` : ''}
      </span>
      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </button>
  ) : null;

  return (
    <Wrapper className={wrapperClass}>
        {Header}
        {isOpen && (
            <div className={`grid w-full grid-cols-5 gap-1.5 ${renderHeader ? 'p-2' : ''} text-[12px]`}>
                {/* Date Transferred */}
                {/* <div className="col-span-5 sm:col-span-2">
                    <label className="mb-0.5 block font-medium">Date Transferred</label>
                    <input
                        type="date"
                        className="w-full rounded-md border p-1.5"
                        value={value.moved_at ?? ''}
                        onChange={e => onChange({ ...value, moved_at: e.target.value })}
                    />
                </div> */}

                {/* From Sub-area */}
                <div className="col-span-5 sm:col-span-1">
                    <label className="mb-0.5 block font-medium">From Sub-area</label>
                    <select
                      className="w-full rounded-md border p-1.5"
                      value={value.from_sub_area_id ?? ''}
                      onChange={e =>
                        onChange({
                          ...value,
                          from_sub_area_id: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    >
                      <option value="">—</option>
                      {fromSubAreas.map(sa => (
                        <option key={sa.id} value={sa.id}>{sa.name}</option>
                      ))}
                  </select>
                </div>

                {/* To Sub-area */}
                <div className="col-span-5 sm:col-span-1">
                    <label className="mb-0.5 block font-medium">To Sub-area</label>
                    <select
                      className="w-full rounded-md border p-1.5"
                      value={value.to_sub_area_id ?? ''}
                      onChange={e =>
                        onChange({
                          ...value,
                          to_sub_area_id: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    >
                      <option value="">—</option>
                      {toSubAreas.map(sa => (
                        <option key={sa.id} value={sa.id}>{sa.name}</option>
                      ))}
                  </select>
                </div>

                {/* Asset Status */}
                {/* <div className="col-span-5 sm:col-span-1">
                    <label className="mb-0.5 block font-medium">Asset Status</label>
                    <select
                        className="w-full rounded-md border p-1.5"
                        value={value.asset_transfer_status ?? 'pending'}
                        onChange={e =>
                            onChange({
                            ...value,
                            asset_transfer_status: e.target.value as 'pending' | 'transferred' | 'cancelled',
                            })
                        }
                        disabled={isHeaderPending}
                        title={isHeaderPending ? 'Disabled while the transfer is Pending Review' : undefined}
                    >
                        <option value="pending">Pending</option>
                        <option value="transferred">Transferred</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div> */}

                {/* Remarks */}
                {/* <div className="col-span-5">
                    <label className="mb-0.5 block font-medium">Remarks</label>
                    <input
                        type="text"
                        className="w-full rounded-md border p-1.5"
                        value={value.remarks ?? ''}
                        onChange={e => onChange({ ...value, remarks: e.target.value })}
                        placeholder="Optional notes specific to this asset"
                    />
                </div> */}
            </div>
        )}
    </Wrapper>
  );
}
