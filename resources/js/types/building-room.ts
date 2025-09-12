import type { InventoryList, SubArea } from './custom-index';

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
    
    sub_areas?: SubArea[];
    sub_areas_count?: number;
};

export type BuildingRoomFormData = {
    building_id: number | ''; 
    room: string;
    description: string | null;

    sub_areas?: {
        id?: number;
        name: string;
        description?: string | null;
<<<<<<< HEAD
        _open?: boolean;
=======
>>>>>>> 394a679 (Feature to add new sub areas during room creation in Buildings page)
    }[];
    remove_sub_area_ids?: number[];
};

export type AssetLite = {
    id: number;
    asset_model_id: number;
    asset_name: string | null;
    serial_no: string | null;
    status: string | null;
    asset_model?: {
    id: number;
    brand?: string | null;
    model?: string | null;
    category?: {
        id: number;
        name: string;
        } | null;
    } | null;
    sub_area?: {
        id: number;
        name: string;
        description?: string | null;
        building_room_id?: number;
    } | null;
};

export type RoomWithAssets = {
    id: number | string;
    building_id: number | string;
    room: string | null;
    description: string | null;

    building?: { 
        id: number | string; 
        code?: string | null; 
        name?: string | null 
    } | null;

    assets?: AssetLite[];
    assets_count?: number;
    asset_share?: number;

    sub_areas?: SubArea[];
};