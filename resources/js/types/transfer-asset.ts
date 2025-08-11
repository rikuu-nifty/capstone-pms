import type { InventoryList } from './custom-index';

export type TransferAsset = {
    id: number;
    transfer_id: number;
    asset_id: number;
    asset: InventoryList;
}