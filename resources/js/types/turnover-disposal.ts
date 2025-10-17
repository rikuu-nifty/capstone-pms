import { UnitOrDepartment, AssetAssignment, Personnel } from "./custom-index";
import { TurnoverDisposalAssets, TurnoverDisposalAssetInput } from "./turnover-disposal-assets";

export type TurnoverDisposals = {
    id: number;
    issuing_office_id: number;
    type: 'turnover' | 'disposal';
    turnover_category?: 'sharps' | 'breakages' | 'chemical' | 'hazardous' | 'non_hazardous' | null;

    receiving_office_id: number | null; // now nullable
    external_recipient?: string | null;

    description: string | null;
    personnel_in_charge: string;
    personnel_id?: number | null;
    document_date: string;
    status: 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    remarks: string | null;
    is_donation?: boolean;

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

    personnel?: Personnel;
};

export type TurnoverDisposalFormData = {
    issuing_office_id: number;
    type: 'turnover' | 'disposal';
    turnover_category?: 'sharps' | 'breakages' | 'chemical' | 'hazardous' | 'non_hazardous' | null;

    receiving_office_id: number | null; // now nullable
    external_recipient?: string | null;

    description: string | null;
    personnel_in_charge: string;
    document_date: string;
    status: 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    remarks: string | null;
    is_donation?: boolean;

    turnover_disposal_assets: TurnoverDisposalAssetInput[];

    personnel_id?: number | null;
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

export type TurnoverDisposalTotals = {
    pending_review_this_month: number;
    turnover_percentage_month: number;
    disposal_percentage_month: number;
    turnover_percentage_all: number;
    disposal_percentage_all: number;
    cancellation_rate: number;
};

