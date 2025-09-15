import { InventoryList } from "./custom-index";

export type TdaStatus = 'pending' | 'completed' | 'cancelled';

export type TurnoverDisposalAssets = {
    id: number;
    turnover_disposal_id: number;
    asset_id: number;

    assets?: InventoryList;

    asset_status: TdaStatus;
    date_finalized: string | null;
    remarks?: string | null;
};

export type TurnoverDisposalAssetInput = {
    asset_id: number;
    asset_status: TdaStatus;
    date_finalized: string | null; // yyyy-mm-dd
    remarks: string;
};