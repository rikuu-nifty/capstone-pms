import type { Building } from './building';

export type BuildingRoom = {
    id: number;
    building_id: number;
    room: string;
    description: string;

    building?: Building;
};