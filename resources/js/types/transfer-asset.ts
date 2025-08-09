import type { InventoryList } from './inventory-list';

export type TransferAsset = {
    id: number;
    transfer_id: number;
    asset_id: number;
    asset: InventoryList;
}