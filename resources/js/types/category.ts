import type { AssetModel } from './custom-index';

export type Category = {
    id: number;
    name: string;
    description?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
};

export type CategoryWithModels = Category & {
    models_count: number;
    assets_count: number;
    brands_count: number;
    asset_models: AssetModel[];
};

export type CategoriesPageProps = {
    categories: CategoryWithModels[],
    totals: {
        categories: number;
        asset_models: number;
        assets: number;
    };
};

export type CategoryFormData = {
    name: string;
    description: string;
};

export type CategoryFilters = {
    status: string;
};

export type AssetModelRow = {
    id: number;
    brand: string | null;
    model: string | null;
    status: 'active' | 'is_archived';
    category_id: number;
    category_name?: string | null;
    assets_count?: number; //from withCount ('assets')
};