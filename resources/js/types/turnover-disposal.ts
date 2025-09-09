import { UnitOrDepartment, AssetAssignment } from "./custom-index";
import { TurnoverDisposalAssets, TurnoverDisposalAssetInput } from "./turnover-disposal-assets";

export type TurnoverDisposals = {
    id: number;
    issuing_office_id: number;
    type: 'turnover' | 'disposal';
    receiving_office_id: number;
    description: string | null;
    personnel_in_charge: string;
    document_date: string;
    status: 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    remarks: string | null;
    asset_count: number;

    issuing_office?: UnitOrDepartment;
    receiving_office?: UnitOrDepartment;
    turnover_disposal_assets?: (TurnoverDisposalAssets & {
        asset_status: 'pending' | 'completed' | 'cancelled';
        date_finalized?: string | null;
        remarks?: string | null;
    })[];
        assetAssignment?: AssetAssignment[];

    noted_by_name?: string | null;
    noted_by_title?: string | null;
};

export type TurnoverDisposalFormData = {
    issuing_office_id: number;
    type: 'turnover' | 'disposal';
    receiving_office_id: number;
    description: string | null;
    personnel_in_charge: string;
    document_date: string;
    status: 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    remarks: string | null;

    // selected_assets: number[];
    turnover_disposal_assets: TurnoverDisposalAssetInput[];
};

export function labelLineStatus(
    recordType: 'turnover' | 'disposal',
    status: 'pending' | 'completed' | 'cancelled'
) {
    const map = {
        turnover: { pending: 'Pending Turnover', completed: 'Turned Over', cancelled: 'Cancelled' },
        disposal: { pending: 'Pending Disposal', completed: 'Disposed',    cancelled: 'Cancelled' },
    } as const;
    return map[recordType][status];
}
