// import { Asset } from "@/pages/inventory-list";
import { UnitOrDepartment, AssetModel, Category } from "./custom-index";

export type InventoryList = {
    id: number;
    memorandum_no: number;
    asset_model_id: number;
    asset_name: string | null;
    description: string | null;
    status: 'active' | 'archived';
    unit_or_department_id: number;
    building_id: number;
    building_room_id: number;
    sub_area_id?: number | null;
    
    serial_no: string;
    supplier: string;
    unit_cost: number;
    date_purchased: string;
    asset_type: string;
    quantity: number;
    transfer_status: 'not_transferred' | 'transferred' | 'pending';

    assetModel?: AssetModel;
    category?: Category;
    unitOrDepartment?: UnitOrDepartment;
}