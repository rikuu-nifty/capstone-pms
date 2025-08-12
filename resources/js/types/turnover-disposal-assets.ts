import { InventoryList } from "./custom-index";

export type TurnoverDisposalAssets = {
    id: number;
    turnover_disposal_id: number;
    asset_id: number;

    assets?: InventoryList;
};