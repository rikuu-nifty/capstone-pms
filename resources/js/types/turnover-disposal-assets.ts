import { InventoryList } from "./inventory-list";

export type TurnoverDisposalAssets = {
    id: number;
    turnover_disposal_id: number;
    asset_id: number;

    assets?: InventoryList;
};