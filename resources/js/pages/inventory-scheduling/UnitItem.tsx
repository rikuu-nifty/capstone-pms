import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { UnitOrDepartment } from './index';
import { Asset } from '../inventory-list';
import { Building, SubArea } from '@/types/custom-index';
import type { SchedulingBuildingRoom } from './index';

type Props = {
    unit: UnitOrDepartment;
    assets: Asset[];
    buildings: Building[];
    rooms: SchedulingBuildingRoom[];
    subAreas: SubArea[];
    selectedRooms: number[];
    selectedSubAreas: number[];
    onToggleRoom: (roomId: number, parentBuildingId: number, checked: boolean) => void;
    onToggleSubArea: (subAreaId: number, parentRoomId: number, parentBuildingId: number, checked: boolean) => void;
    onRemove: () => void;
};

export default function UnitItem({
    unit,
    assets,
    buildings,
    rooms,
    subAreas,
    selectedRooms,
    selectedSubAreas,
    onToggleRoom,
    onToggleSubArea,
    onRemove,
}: Props) {
    const [open, setOpen] = useState(false);

    // Get only buildings that have assets for this unit
    const filteredBuildings = buildings.filter((b) =>
        assets.some((a) => a.building?.id === b.id && a.unit_or_department_id === unit.id)
    );

    // Get only rooms that have assets for this unit
    const filteredRooms = rooms.filter((r) =>
        assets.some((a) => a.building_room_id === r.id && a.unit_or_department_id === unit.id)
    );

    // Get only subareas that have assets for this unit
    const filteredSubAreas = subAreas.filter((sa) =>
        assets.some((a) => a.sub_area_id === sa.id && a.unit_or_department_id === unit.id)
    );

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
                    {/* {buildings.length > 0 ? (
                        buildings.map((b) => ( */}
                    {filteredBuildings.length > 0 ? (
                        filteredBuildings.map((b) => (
                            <div key={b.id} className="pl-2">
                                <div className="font-medium text-gray-800">{b.name} ({b.code})</div>

                                {/* Rooms under building */}
                                {/* {rooms */}
                                {filteredRooms
                                    .filter((r) => r.building_id === b.id)
                                    .map((room) => (
                                        <div key={room.id} className="ml-4">
                                            <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="cursor-pointer"
                                                checked={selectedRooms.includes(room.id)}
                                                onChange={() => {
                                                    if (selectedRooms.includes(room.id)) {
                                                        // unselect room → unselect its sub-areas
                                                        onToggleRoom(room.id, b.id, false);
                                                        // subAreas
                                                        //     .filter(sa => sa.building_room_id === room.id)
                                                        //     .forEach(sa => onToggleSubArea(sa.id, room.id, b.id, false));
                                                        filteredSubAreas
                                                            .filter((sa) => sa.building_room_id === room.id)
                                                            .forEach((sa) =>
                                                                onToggleSubArea(sa.id, room.id, b.id, false)
                                                            );
                                                    } else {
                                                        // select room → ensure parent building is marked
                                                        onToggleRoom(room.id, b.id, true);
                                                    }
                                                }}
                                            />
                                                Room {room.room}
                                            </label>

                                            {/* Sub-areas under room */}
                                            {/* {subAreas */}
                                            {filteredSubAreas
                                                .filter((sa) => sa.building_room_id === room.id)
                                                .map((sa) => (
                                                    <div key={sa.id} className="ml-6">
                                                        <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className="cursor-pointer"
                                                            checked={selectedSubAreas.includes(sa.id)}
                                                            onChange={() => {
                                                                if (selectedSubAreas.includes(sa.id)) {
                                                                    // unselect sub-area only
                                                                    onToggleSubArea(sa.id, room.id, b.id, false);
                                                                } else {
                                                                    // select sub-area → also select its room + building
                                                                    onToggleSubArea(sa.id, room.id, b.id, true);
                                                                    onToggleRoom(room.id, b.id, true);
                                                                }
                                                            }}
                                                        />
                                                            {sa.name}
                                                        </label>
                                                    </div>
                                            ))}
                                        </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <div className="text-muted-foreground">No buildings found for this unit.</div>
                    )}
                </div>
            )}
        </div>
    );
}
