import type { AssetModel, Category } from './custom-index'

export type EquipmentCode = {
    id: number
    code_number: string
    description: string
    category_id: number
    category_name?: string | null
    created_at?: string | null
    updated_at?: string | null
    deleted_at?: string | null
}

export type EquipmentCodeWithModels = EquipmentCode & {
    asset_models: AssetModel[]
    asset_models_count: number
}

export type EquipmentCodesPageProps = {
    equipment_codes: EquipmentCodeWithModels[]
    totals: {
        equipment_codes: number
        categories: number
        asset_models: number
    }
    categories: Category[]
    viewing?: EquipmentCodeWithModels
}

export type EquipmentCodeFormData = {
    code_number: string
    description: string
    category_id: number | ''
}
