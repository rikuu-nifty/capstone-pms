import { BuildingRoom, RoomWithAssets } from "./building-room";

export type Building = {
    id: number;
    name: string;
    code: string;
    description: string;

    building_rooms_count: number;
    assets_count: number;

    building_rooms?: BuildingRoom[];
};

export type NewRoomPayload = {
    room:string;
    description?: string | null;
}

export type BuildingFormData = {
    name: string;
    code: string;
    description: string | null;

    rooms?: NewRoomPayload[];
};

export type Totals = {
    total_buildings: number;
    total_rooms: number;
    total_assets: number;
    avg_assets_per_building: number;
    avg_assets_per_room: number;
}

export type PageProps = {
    buildings: Building[];
    totals?: Totals;
    viewing?: Building;

    rooms?: BuildingRoom[];
    selected?: number | null;
    viewingRoom?: RoomWithAssets;
};