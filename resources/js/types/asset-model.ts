export type AssetModel = {
    id: number;
    brand: string;
    model: string;
    category_id: number;
    status: 'active' | 'is_archived';

    assets_count?: number; //present because withCount('assets')
    category?: { 
        id: number;
        name: string;
    };
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
};