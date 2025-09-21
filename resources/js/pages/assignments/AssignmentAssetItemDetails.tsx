import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { MinimalAsset } from '@/types/asset-assignment';

type Props = {
    asset: MinimalAsset;
    onRemove: () => void;
};

export default function AssignmentAssetItemDetails({ 
    asset, 
    onRemove 
}: Props) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex flex-col gap-2 rounded-lg border bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-t-lg">
                <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="truncate text-base font-semibold text-gray-900">
                    {asset.asset_name ?? 'Unnamed Asset'}
                    </span>
                    {asset.serial_no && (
                    <span className="inline-block rounded-md bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {asset.serial_no}
                    </span>
                    )}
                </div>
                {!open && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                    Click to view asset details
                    </p>
                )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
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

            {/* Details */}
            {open && (
                <div className="px-4 pb-3 pt-2 text-sm text-gray-700">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase">
                        Building
                    </dt>
                    <dd className="mt-0.5 font-medium text-gray-900">
                        {asset.building?.name ?? '—'}
                    </dd>
                    </div>

                    <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase">
                        Room
                    </dt>
                    <dd className="mt-0.5 font-medium text-gray-900">
                        {asset.building_room?.room ?? '—'}
                    </dd>
                    </div>

                    <div className="col-span-2">
                    <dt className="text-xs font-medium text-gray-500 uppercase">
                        Sub-area
                    </dt>
                    <dd className="mt-0.5 font-medium text-gray-900">
                        {asset.sub_area?.name ?? '—'}
                    </dd>
                    </div>
                </dl>
                </div>
            )}
        </div>
    );
}
