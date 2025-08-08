import type { BuildingRoom } from './building-room';
import type { UnitOrDepartment } from './unit-or-department';
import type { User } from './user';
import type { TransferAsset } from './transfer-asset';

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

    currentBuildingRoom?: BuildingRoom;
    currentOrganization?: UnitOrDepartment;
    receivingBuildingRoom?: BuildingRoom;
    receivingOrganization?: UnitOrDepartment;
    designatedEmployee?: User;
    assignedBy?: User;

    transferAssets: TransferAsset[];
};

export type TransferFormData = {
    current_building_room: number;
    current_organization: number;
    receiving_building_room: number;
    receiving_organization: number;
    designated_employee: number;
    assigned_by: number;
    scheduled_date: string;
    actual_transfer_date: string | null;
    received_by: string | null;
    status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
    remarks: string | null;

    current_building_id: number;
    receiving_building_id: number;

    selected_assets: number[];
}
