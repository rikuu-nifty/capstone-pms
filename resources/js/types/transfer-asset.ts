import type { InventoryList, SubArea } from './custom-index';

export type TransferAsset = {
    id: number;
    transfer_id: number;
    asset_id: number;
    asset: InventoryList;

    moved_at?: string | null;
    from_sub_area_id?: number | null;
    to_sub_area_id?: number | null;
    asset_transfer_status?: 'pending' | 'transferred' | 'cancelled';
    remarks?: string | null;

    fromSubArea?: SubArea | null;
    toSubArea?: SubArea | null;
}

export type TransferAssetPivot = {
    id?: number; // present when editing, absent when creating
    asset_id: number;
    moved_at?: string | null;
    from_sub_area_id?: number | null;
    to_sub_area_id?: number | null;
    asset_transfer_status?: 'pending' | 'transferred' | 'cancelled';
    remarks?: string | null;
};