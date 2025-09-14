import type { InventorySchedulingFormData, UnitOrDepartment, SchedulingBuildingRoom } from '@/pages/inventory-scheduling/index';
import type { Asset } from '@/pages/inventory-list';
import type { Building } from '@/types/custom-index';

export type ValidationResult = {
    valid: boolean;
    message?: string;
    details?: string[];
};

export function validateScheduleForm(
    data: InventorySchedulingFormData,
    assets: Asset[],
    unitOrDepartments: UnitOrDepartment[],
    buildings: Building[],
    buildingRooms: SchedulingBuildingRoom[]
): ValidationResult {
    if (data.scope_type === 'unit') {
        const badUnits = data.unit_ids
            .map((id) => unitOrDepartments.find((u) => u.id === id))
            .filter((u) => {
                const hasBuildings = assets.some(
                    (a) => a.unit_or_department?.id === u?.id && a.building !== null
                );
                return !hasBuildings;
            })
            .map((u) => `${u?.name} (${u?.code})`);

        if (badUnits.length > 0) {
            return {
                valid: false,
                message: 'These units have no associated buildings:',
                details: badUnits,
            };
        }
    }

    if (data.scope_type === 'building') {
        if (data.building_ids.length === 0) {
            return {
                valid: false,
                message: 'Please select at least one building.',
            };
        }

        // Check if buildings have rooms
        const badBuildings = data.building_ids
            .map((id) => buildings.find((b) => b.id === id))
            .filter((b) => {
                const roomsForBuilding = buildingRooms.filter((r) => r.building_id === b?.id);
                return roomsForBuilding.length === 0;
            })
            .map((b) => `${b?.name} (${b?.code})`);

        if (badBuildings.length > 0) {
            return {
                valid: false,
                message: 'These buildings have no rooms defined:',
                details: badBuildings,
            };
        }

        if (data.room_ids.length === 0) {
            const badBuildings = data.building_ids
                .map((id) => buildings.find((b) => b.id === id))
                .map((b) => `${b?.name} (${b?.code})`);

            return {
                valid: false,
                message: 'These buildings have no rooms selected:',
                details: badBuildings,
            };
        }
    }

    return { valid: true };
}
