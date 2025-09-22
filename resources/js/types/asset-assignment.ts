export type AssetAssignment = {
    id: number;
    personnel_id: number;
    assigned_by?: number | null;
    date_assigned: string;
    remarks?: string | null;

    // counts
    items_count?: number;

    // relations
    personnel?: {
        id: number;
        full_name: string;
        position?: string;
        unit_or_department?: { id: number; name: string };
    };
    assigned_by_user?: { id: number; name: string };
};

export type AssetAssignmentItem = {
    id: number;
    asset_assignment_id: number;
    asset_id: number;

    asset?: {
        id: number;
        serial_no: string;
        asset_name?: string;
        asset_model?: {
            id: number;
            brand: string;
            model: string;
            category?: { id: number; name: string };
        };
        unit_or_department?: { id: number; name: string };
    };
};

export type AssignmentTotals = {
    total_assignments: number;
    total_personnels_with_assets: number;
    total_assets_assigned: number;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
};

export type AssignmentPageProps = {
    assignments: Paginated<AssetAssignment>;
    totals?: AssignmentTotals;
    viewing?: AssetAssignment | null;

    personnels: { 
        id: number; 
        full_name: string;
        unit_or_department_id?: number | null;
    }[];
    units: { 
        id: number; 
        name: string 
    }[];
    assets: MinimalAsset[];
    currentUser?: { 
        id: number; 
        name: string 
    } | null;
};

export type MinimalAsset = {
    id: number;
    serial_no: string;
    asset_name?: string;
    building?: { 
        id: number; 
        name: string 
    };
    building_room?: { 
        id: number; 
        room: string 
    };
    sub_area?: { 
        id: number; 
        name: string 
    };
    unit_or_department_id?: number | null;
};