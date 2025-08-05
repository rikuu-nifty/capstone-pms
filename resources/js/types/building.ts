export type Building = {
    id: number;
    name: string;
    code: string;
    description: string;
    building_rooms_count: number;
};

export type BuildingRoom = {
    id: number;
    building_id: number;
    room: string;
    description: string;

    building?: Building;
};