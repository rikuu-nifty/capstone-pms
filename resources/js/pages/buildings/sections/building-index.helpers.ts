// building-index.helpers.ts
import { type BreadcrumbItem } from '@/types';
import { type Building } from '@/types/building';
import { type BuildingRoom } from '@/types/custom-index';

export const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Buildings', href: '/buildings' },
];

export const buildingSortOptions = [
    { value: 'id', label: 'ID' },
    { value: 'code', label: 'Building Code' },
    { value: 'name', label: 'Name' },
    { value: 'building_rooms_count', label: 'Room Count' },
    { value: 'assets_count', label: 'Assets Count' },
] as const;

export const roomSortOptions = [
    { value: 'id', label: 'Room ID' },
    { value: 'building_code', label: 'Building Code' },
    { value: 'room', label: 'Room' },
] as const;

export type BuildingSortKey = (typeof buildingSortOptions)[number]['value'];
export type RoomSortKey = (typeof roomSortOptions)[number]['value'];

export const PAGE_SIZE = 5;
export const ROOM_PAGE_SIZE = 5;

// helpers for sorting
export const numberKey = (b: Building, k: BuildingSortKey) =>
    k === 'id' ? Number(b.id) || 0
    : k === 'building_rooms_count' ? Number(b.building_rooms_count) || 0
    : k === 'assets_count' ? b.assets_count
    : 0;

export const roomNumberKey = (r: BuildingRoom, k: RoomSortKey) =>
    k === 'id' ? Number(r.id) || 0 : 0;

export const roomStringKey = (r: BuildingRoom, k: RoomSortKey) =>
    k === 'room' ? (r.room ?? '')
    : k === 'building_code' ? (r.building?.code ?? '')
    : '';

export const isStringKey = (k: RoomSortKey): k is 'room' | 'building_code' =>
    k === 'room' || k === 'building_code';