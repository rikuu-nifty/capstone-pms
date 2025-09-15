import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Building } from '@/types/custom-index';
import type { SchedulingBuildingRoom } from './index';
import type { Asset } from '../inventory-list';

type Props = {
    building: Building;
    rooms: SchedulingBuildingRoom[];
    selectedRooms: number[];
    selectedSubAreas: number[];
    onToggleRoom: (roomId: number, parentBuildingId: number, checked: boolean) => void;
    onToggleSubArea: (subAreaId: number, parentRoomId: number, parentBuildingId: number, checked: boolean) => void;
    onRemove: () => void;
    assets: Asset[];
};

export default function BuildingItem({
    building,
    rooms,
    selectedRooms,
    selectedSubAreas,
    onToggleRoom,
    onToggleSubArea,
    onRemove,
    assets,
}: Props) {

    const [open, setOpen] = useState(false);

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
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
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
                <div className="px-3 pb-3 text-xs text-gray-700 space-y-2">
                    {filteredRooms.length > 0 ? (
                        filteredRooms.map((room) => {
                            // 🔹 Filter subareas → only subareas with assets
                            const filteredSubAreas = (room.sub_areas ?? []).filter((sa) =>
                                assets.some((a) => a.sub_area_id === sa.id)
                            );

                            return (
                                <div key={room.id} className="pl-2">
                                    {/* Room Checkbox */}
                                    <label className="flex items-center gap-2 font-medium">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer"
                                            checked={selectedRooms.includes(room.id)}
                                            onChange={() => {
                                                if (selectedRooms.includes(room.id)) {
                                                    onToggleRoom(room.id, building.id, false);
                                                    filteredSubAreas.forEach((sa) =>
                                                        onToggleSubArea(sa.id, room.id, building.id, false)
                                                    );
                                                } else {
                                                    onToggleRoom(room.id, building.id, true);
                                                }
                                            }}
                                        />
                                        Room {String(room.room)}
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
                        <div className="text-muted-foreground">No rooms found for this building.</div>
                    )}
                </div>
            )}
        </div>
    );
}
