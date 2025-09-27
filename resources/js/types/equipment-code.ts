import type { AssetModel, Category } from './custom-index'

export type EquipmentCode = {
    id: number;
    code: string;
    description: string;
    category_id: number;
    category_name?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

export type EquipmentCodeWithModels = EquipmentCode & {
    asset_models: AssetModel[];
    asset_models_count: number;
    assets_count: number;
}

export type EquipmentCodesPageProps = {
    equipment_codes: {
        data: EquipmentCodeWithModels[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    totals: {
        total_codes: number;
        unused_codes: number;
        used_codes: number;
        avg_models_per_code: number;
        top_categories: { id: number; name: string; equipment_codes_count: number }[];
        top_codes: { id: number; code: string; description: string | null; asset_models_count: number }[];
        used_percentage: number;
        unused_percentage: number;
    };
    categories: Category[];
    viewing?: EquipmentCodeWithModels;
}

export type EquipmentCodeFormData = {
    code: string;
    description: string | null;
    category_id: number | '' | null;
}
