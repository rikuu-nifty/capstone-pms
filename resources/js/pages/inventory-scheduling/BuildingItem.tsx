import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Building } from '@/types/custom-index';
import type { SchedulingBuildingRoom } from './index';
import type { Asset } from '../inventory-list';
import { Button } from '@/components/ui/button';

type Props = {
    building: Building;
    rooms: SchedulingBuildingRoom[];
    selectedRooms: number[];
    selectedSubAreas: number[];
    expanded: boolean;          // 👈 controlled from parent
    onToggleExpand: () => void; // 👈 controlled from parent
    onToggleRoom: (roomId: number, parentBuildingId: number, checked: boolean) => void;
    onToggleSubArea: (subAreaId: number, parentRoomId: number, parentBuildingId: number, checked: boolean) => void;
    onRemove: () => void;
    assets: Asset[];
    onSelectAll: () => void;
    onClearAll: () => void;
};

export default function BuildingItem({
    building,
    rooms,
    selectedRooms,
    selectedSubAreas,
    expanded,
    onToggleExpand,
    onToggleRoom,
    onToggleSubArea,
    onRemove,
    assets,
    onSelectAll,
    onClearAll,
}: Props) {
    const filteredRooms = rooms.filter((room) =>
        assets.some((a) => a.building_room_id === room.id)
    );

    return (
        <div className="flex flex-col gap-2 rounded-lg border">
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-base font-semibold text-gray-900">
                        {building.name} <span className="text-gray-500">({building.code})</span>
                    </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onToggleExpand} // 👈 use parent state instead of local
                        className="cursor-pointer"
                    >
                        {expanded ? 'Hide Details' : 'Show Details'}
                        {expanded ? (
                            <ChevronDown className="ml-1 h-3.5 w-3.5" />
                        ) : (
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={onRemove}
                        className="cursor-pointer"
                    >
                        Remove
                    </Button>
                </div>
            </div>

            {/* Details */}
            {expanded && (
                <div className="px-3 pb-3 text-xs text-gray-700 space-y-2">
                    <div className="flex justify-center gap-3 mb-3">
                        <button
                            type="button"
                            onClick={onSelectAll}
                            className="rounded-full border border-blue-500 px-3 py-0.5 text-[11px] font-medium text-blue-600 hover:bg-blue-50 cursor-pointer transition"
                        >
                            Select All
                        </button>

                        <button
                            type="button"
                            onClick={onClearAll}
                            className="rounded-full border border-red-500 px-3 py-0.5 text-[11px] font-medium text-red-600 hover:bg-red-50 cursor-pointer transition"
                        >
                            Clear All
                        </button>
                    </div>

                    {filteredRooms.length > 0 ? (
                        filteredRooms.map((room) => {
                            const filteredSubAreas = (room.sub_areas ?? []).filter((sa) =>
                                assets.some((a) => a.sub_area_id === sa.id)
                            );

                            return (
                                <div key={room.id} className="pl-2">
                                    {/* Room Checkbox */}
                                    <label className="flex items-center gap-2 font-medium text-blue-700">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer"
                                            checked={selectedRooms.includes(room.id)}
                                            onChange={() => {
                                                const checked = !selectedRooms.includes(room.id);
                                                onToggleRoom(room.id, building.id, checked);
                                            }}
                                        />
                                        Room {String(room.room)}

                                        {selectedRooms.includes(room.id) && (
                                            <span className="text-[11px] text-red-500 italic">
                                                {filteredSubAreas.length > 0
                                                    ? '— Includes leftover assets not in sub-areas'
                                                    : '— Includes all assets in this room'}
                                            </span>
                                        )}
                                    </label>

                                    {/* Sub-areas under room */}
                                    {filteredSubAreas.length > 0 && (
                                        <div className="ml-6 mt-1 space-y-1">
                                            {filteredSubAreas.map((sa) => (
                                                <label key={sa.id} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSubAreas.includes(sa.id)}
                                                        className="cursor-pointer"
                                                        onChange={() => {
                                                            if (selectedSubAreas.includes(sa.id)) {
                                                                onToggleSubArea(sa.id, room.id, building.id, false);
                                                            } else {
                                                                onToggleSubArea(sa.id, room.id, building.id, true);
                                                                onToggleRoom(room.id, building.id, true);
                                                            }
                                                        }}
                                                    />
                                                    {sa.name}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-muted-foreground">No assets found in these rooms for this building.</div>
                    )}
                </div>
            )}
        </div>
    );
}
