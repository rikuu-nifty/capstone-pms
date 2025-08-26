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
    approved_by_name?: string | null;
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

export const statusVariantMap: Record<string,'default'|'primary'|'secondary'|'success'|'destructive'> = {
    upcoming: 'secondary',
    in_progress: 'success',
    overdue: 'destructive',
    completed: 'primary',
};

export const formatDate = (dateStr?: string) =>
    !dateStr ? '' : new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const formatStatusLabel = (status: string) =>
     status.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
