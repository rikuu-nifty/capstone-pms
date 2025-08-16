import type { Building, InventoryList } from './custom-index';

export type BuildingRoom = {
    id: number;
    building_id: number;
    room: string;
    description: string;

    building?: Building;
    assets?: InventoryList[];
};