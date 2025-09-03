// import { InventoryList } from "./inventory-list";

export type UnitOrDepartment = {
    id: number;
    name: string;
    code: string;
    description: string | null;
    unit_head?: string;

    assets_count?: number;
    inventory_lists?: InventoryListLite[];
};

export type UnitOrDepartmentFormData = {
    name: string;
    code: string;
    description: string | null;
    unit_head: string;
};

export type Totals = {
    total_units: number;
    total_assets: number;
};

export type UnitDeptPageProps = {
    unit_or_departments: UnitOrDepartment[];
    totals?: Totals;
    viewing?: UnitOrDepartment;
};

export type InventoryListLite = {
    id: number;
    asset_name: string;
    serial_no: string;
    asset_model?: {
        brand: string;
        model: string;
        category?: {
            name: string;
        };
    };
    building_room?: {
        room: string;
        building?: {
            code: string;
            name: string;
        };
    };
};
