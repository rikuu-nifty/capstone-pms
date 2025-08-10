import { BuildingRoom } from "./building-room";

export type Building = {
    id: number;
    name: string;
    code: string;
    description: string;
    building_rooms_count: number;

    buildingRooms: BuildingRoom[];
};

export type BuildingFormData = {
    name: string;
    code: string;
    description: string | null;
};