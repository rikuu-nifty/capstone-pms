export type InventoryList = {
    id: number;
    memorandum_no: number;
    asset_model_id: number;
    asset_name: string;
    description: string | null;
    status: 'active' | 'archived';
    unit_or_department_id: number;
    building_id: number;
    building_room_id: number;
    serial_number: string;
    supplier: string;
    unit_cost: number;
    date_purchased: string;
    asset_type: string;
    quantity: number;
    transfer_status: 'not_transferred' | 'transferred' | 'pending';
}