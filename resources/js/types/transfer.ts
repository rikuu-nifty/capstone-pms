import type { BuildingRoom } from './building-room';
import type { UnitOrDepartment } from './unit-or-department';
import type { User } from './user';

export type Transfer = {
    id: number;
    current_building_room: number;
    current_organization: number;
    receiving_building_room: number;
    receiving_organization: number;
    designated_employee: number;
    assigned_by: number;
    scheduled_date: string;
    actual_transfer_date: string | null;
    received_by: number | null;
    status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
    remarks: string | null;
    asset_count: number;
    // assets: InventoryList[];

    currentBuildingRoom?: BuildingRoom;
    currentOrganization?: UnitOrDepartment;
    receivingBuildingRoom?: BuildingRoom;
    receivingOrganization?: UnitOrDepartment;
    designatedEmployee?: User;
    assignedBy?: User;
};