import type { Category } from './category';

export type AssetModel = {
    id: number;
    brand: string;
    model: string;
    category_id: number;
    status: 'active' | 'is_archived';

    category?: Category;
};