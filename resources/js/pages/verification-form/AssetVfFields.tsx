import type { InventoryLite } from './index';

type Props = {
    value: { inventory_list_id: number; remarks?: string };
    asset: InventoryLite;
    onChange: (next: { inventory_list_id: number; remarks?: string }) => void;
};

export default function AssetVfFields({ value, asset, onChange }: Props) {
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
                    {asset.buildingRoom?.room ?? '—'}
                </dd>
            </div>

            {/* Sub-Area */}
            <div className="col-span-2 rounded-md bg-blue-50 p-2">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Sub-Area
                </dt>
                <dd className="mt-1 font-semibold text-gray-900">
                    {asset.subArea?.name ?? '—'}
                </dd>
            </div>

            {/* Remarks */}
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Remarks</label>
                <input
                    type="text"
                    className="w-full rounded-md border p-2 text-sm"
                    value={value.remarks ?? ''}
                    onChange={(e) =>
                        onChange({ ...value, remarks: e.target.value })
                    }
                    placeholder="Optional notes specific to this asset"
                />
            </div>
        </div>
    );
}
