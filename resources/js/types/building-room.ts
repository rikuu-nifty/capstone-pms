import type { InventoryList } from './custom-index';

export type BuildingRoom = {
    id: number;
    building_id: number;
    room: string;
    description: string;

    building?: {
        id: number;
        code: string;
        name: string;
    };

    assets?: InventoryList[];
    assets_count?: number;
    asset_share?: number;
};