import type { InventoryList } from "./custom-index";

export type AssetModel = {
    id: number;
    brand: string | null;
    model: string | null;
    category_id: number;
    equipment_code_id: number | null;
    status: 'active' | 'is_archived';

    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
    assets_count?: number;
    
    assets?: InventoryList[];
    category?:{ 
        id: number;
        name: string;
    } | null;

    equipment_code?: { id: number; code: string; description?: string | null } | null;
};

export type AssetModelWithCounts = AssetModel & {
    assets_count: number;
    active_assets_count: number;
};

export type AssetModelsPageProps = {
    asset_models: AssetModelWithCounts[];
    
    categories: { id: number; name: string }[];
    equipment_codes: {
        id: number;
        code: string;
        description?: string | null;
        category_id: number;
    }[];

    viewing?: AssetModelWithCounts;
    
    totals: {
        asset_models: number;
        distinct_brands: number;
        assets: number;
        active_assets: number;
    };
};

export type StatusOption = '' | 'active' | 'is_archived';

export type AssetModelFilters = {
    category_id: number | '';
    status: StatusOption;
    brand?: string;
    model?: string;
    equipment_code_id?: number | '';
};

export type AssetModelFormData = {
    brand: string;
    model: string;
    category_id: number;
    equipment_code_id: number | '' | null;
    status: '' | 'active' | 'is_archived';
};