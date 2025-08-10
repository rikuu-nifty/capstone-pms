import { TurnoverDisposalAssets, UnitOrDepartment, AssetAssignment } from "./custom-index";

export type TurnoverDisposals = {
    id: number;
    issuing_office_id: number;
    type: 'turnover' | 'disposal';
    receiving_office_id: number;
    description: string | null;
    personnel_in_charge_id: number;
    document_date: string;
    status: 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    remarks: string | null;
    asset_count: number;

    issuing_office?: UnitOrDepartment;
    receiving_office?: UnitOrDepartment;
    turnover_disposal_assets?: TurnoverDisposalAssets[];
    assetAssignment?: AssetAssignment[];
};

export type TurnoverDisposalFormData = {
    issuing_office_id: number;
    type: 'turnover' | 'disposal';
    receiving_office_id: number;
    description: string | null;
    personnel_in_charge_id: number
    document_date: string;
    status: 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    remarks: string | null;

    selected_assets: number[];
};