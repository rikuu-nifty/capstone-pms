import { User } from "./custom-index";

export type TurnoverDisposals = {
    id: number;
    type: 'turnover' | 'disposal';
    description: string | null;
    personnel_in_charge: string;
    document_date: string;
    status: 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    issued_by: number;
    remarks: string | null;
    asset_count: number;

    issuedBy?: User; //single object
};

export type TurnoverDisposalFormData = {
    type: 'turnover' | 'disposal';
    description: string | null;
    personnel_in_charge: string;
    document_date: string;
    status: 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    issued_by: number;
    remarks: string | null;

    selected_assets: number[];
};