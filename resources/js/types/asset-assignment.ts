export type AssetAssignment = {
    id: number;
    asset_id: number;
    unit_or_department_id: number;
    assigned_to: string;
    assigned_by: number;
    date_assigned: string;
    remarks: string | null;
};