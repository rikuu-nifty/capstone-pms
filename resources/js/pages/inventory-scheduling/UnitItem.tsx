import { ChevronDown, ChevronRight } from 'lucide-react';
import type { UnitOrDepartment } from './index';
import { Asset } from '../inventory-list';
import { Building, formatEnums, SubArea } from '@/types/custom-index';
import type { SchedulingBuildingRoom } from './index';
import { Button } from '@/components/ui/button';

type Props = {
    unit: UnitOrDepartment;
    assets: Asset[];
    buildings: Building[];
    rooms: SchedulingBuildingRoom[];
    subAreas: SubArea[];
    selectedBuildings: number[];
    selectedRooms: number[];
    selectedSubAreas: number[];
    expanded: boolean;          // 👈 controlled by parent
    onToggleExpand: () => void; // 👈 controlled by parent
    onToggleBuilding: (buildingId: number, checked: boolean) => void;
    onToggleRoom: (roomId: number, parentBuildingId: number, checked: boolean) => void;
    onToggleSubArea: (subAreaId: number, parentRoomId: number, parentBuildingId: number, checked: boolean) => void;
    onRemove: () => void;
    onClearAll: () => void;
    onSelectAll: () => void;
};

export default function UnitItem({
    unit,
    assets,
    buildings,
    rooms,
    subAreas,
    expanded,
    onToggleExpand,
    onToggleBuilding,
    selectedBuildings,
    selectedRooms,
    selectedSubAreas,
    onToggleRoom,
    onToggleSubArea,
    onRemove,
    onClearAll,
    onSelectAll,
}: Props) {
    // 🔹 Filter relevant data
    const filteredBuildings = buildings.filter((b) =>
        assets.some((a) => a.building?.id === b.id && a.unit_or_department_id === unit.id)
    );
    const filteredRooms = rooms.filter((r) =>
        assets.some((a) => a.building_room_id === r.id && a.unit_or_department_id === unit.id)
    );
    const filteredSubAreas = subAreas.filter((sa) =>
        assets.some((a) => a.sub_area_id === sa.id && a.unit_or_department_id === unit.id)
    );

    return (
        <div className="flex flex-col gap-2 rounded-lg border">
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-base font-semibold text-gray-900">
                        {formatEnums(unit.name)} <span className="text-gray-500">({unit.code})</span>
                    </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onToggleExpand} // 👈 now uses parent-controlled expand
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

                    {filteredBuildings.length > 0 ? (
                        filteredBuildings.map((b) => {
                            const buildingRooms = filteredRooms.filter((r) => r.building_id === b.id);
                            const buildingSubAreas = filteredSubAreas.filter((sa) =>
                                buildingRooms.some((r) => r.id === sa.building_room_id)
                            );

                            const isBuildingChecked = selectedBuildings.includes(b.id);

                            return (
                                <div key={b.id} className="pl-2">
                                    {/* Building Checkbox */}
                                    <label className="flex items-center gap-2 font-medium text-gray-800">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer"
                                            checked={isBuildingChecked}
                                            onChange={(e) => onToggleBuilding(b.id, e.target.checked)}
                                        />
                                        {b.name} ({formatEnums(b.code)})
                                    </label>

                                    {/* Rooms under building */}
                                    {buildingRooms.map((room) => {
                                        const roomSubAreas = buildingSubAreas.filter(
                                            (sa) => sa.building_room_id === room.id
                                        );

                                        return (
                                            <div key={room.id} className="ml-4">
                                                <label className="flex items-center gap-2 font-medium text-blue-700">
                                                    <input
                                                        type="checkbox"
                                                        className="cursor-pointer"
                                                        checked={selectedRooms.includes(room.id)}
                                                        onChange={(e) =>
                                                            onToggleRoom(room.id, b.id, e.target.checked)
                                                        }
                                                    />
                                                    Room {room.room}
                                                    {selectedRooms.includes(room.id) && (
                                                        <span className="text-[11px] text-red-500 italic">
                                                            {roomSubAreas.length > 0
                                                                ? '— includes leftover assets not in sub-areas'
                                                                : '— includes all assets in this room'}
                                                        </span>
                                                    )}
                                                </label>

                                                {/* Sub-areas under room */}
                                                {roomSubAreas.map((sa) => (
                                                    <div key={sa.id} className="ml-6">
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                className="cursor-pointer"
                                                                checked={selectedSubAreas.includes(sa.id)}
                                                                onChange={(e) =>
                                                                    onToggleSubArea(sa.id, room.id, b.id, e.target.checked)
                                                                }
                                                            />
                                                            {sa.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-muted-foreground">No buildings found for this unit.</div>
                    )}
                </div>
            )}
        </div>
    );
}
