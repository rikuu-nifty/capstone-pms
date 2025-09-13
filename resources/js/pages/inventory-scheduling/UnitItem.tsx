import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { UnitOrDepartment } from './index';
import { Asset } from '../inventory-list';

type Props = {
    unit: UnitOrDepartment;
    assets: Asset[];
    onRemove: () => void;
};

export default function UnitItem({ unit, assets, onRemove }: Props) {
    const [open, setOpen] = useState(false);

    const buildingNames = [...new Set(assets.map((a) => a.building?.name ?? '—'))].filter(Boolean);
    const roomNames = [...new Set(assets.map((a) => a.building_room?.room ?? '—'))].filter(Boolean);

    return (
        <div className="flex flex-col gap-2 rounded-lg border">
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2 min-w-0">
            <span className="truncate text-base font-semibold text-gray-900">
                {unit.name} <span className="text-gray-500">({unit.code})</span>
            </span>
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
            <div className="px-3 pb-3 text-xs text-gray-700">
            <div><strong>Buildings:</strong> {buildingNames.join(', ') || '—'}</div>
            <div><strong>Rooms:</strong> {roomNames.join(', ') || '—'}</div>
            </div>
        )}
        </div>
    );
}
