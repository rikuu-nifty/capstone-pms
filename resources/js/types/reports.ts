export interface InventoryReportRow {
    id: number;
    asset_name: string;
    asset_type: string;
    sub_area?: string | null;
    quantity: number;
    remarks: string;
}