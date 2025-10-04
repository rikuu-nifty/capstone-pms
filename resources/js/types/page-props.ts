import { 
    Transfer, 
    InventoryList, 
    Building, 
    BuildingRoom, 
    UnitOrDepartment, 
    User, 
    TurnoverDisposals, 
    TurnoverDisposalAssets,
    SubArea, 
    Personnel,
} from './custom-index';

import { TurnoverDisposalTotals } from "./turnover-disposal";

export type TransferPageProps = {
    transfers: Transfer[];
    assets: InventoryList[];
    buildings: Building[];
    buildingRooms: BuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
    users: User[];

    currentUser: User;

    flash?: {
        success?: string;
        error?: string;
    };

    subAreas: SubArea[];
    signatories: Record<string, { name: string; title: string }>; // ✅ add this
}

export type TransferViewPageProps = {
    transfer: Transfer;
    assets: InventoryList[];
};

export type FilterModalProps = {
    open: boolean;
    onClose: () => void;
    onApply: (filters: {
        status: string;
        building: string;
        receiving_building: string;
        org: string;
    }) => void;
    onClear: () => void;

    selected_status: string;
    selected_building: string;
    selected_receiving_building: string;
    selected_org: string;

    buildingCodes: string[];
    orgCodes: string[];
}

export type TransferFilters = {
    status: string;
    building: string;
    receiving_building: string;
    org: string;
};

export type TurnoverDisposalPageProps = {
    turnoverDisposals: TurnoverDisposals[];
    turnoverDisposalAssets: TurnoverDisposalAssets[];
    assignedBy: User;
    unitOrDepartments: UnitOrDepartment[];
    assets: InventoryList[];
    personnels: Personnel[];

    asset_count: number;
    pmoHead?: { id: number; name: string } | null;

    totals: TurnoverDisposalTotals;
}

export type TurnoverFilterProps = {
    onApply: (filters: {
        status: string;
        type: string;
        issuing_office: string;
        receiving_office: string;
    }) => void;
    onClear: () => void;

    selected_status: string;
    selected_type: string;
    selected_issuing_office: string;
    selected_receiving_office: string;

    unitOrDepartments: UnitOrDepartment[];
};
