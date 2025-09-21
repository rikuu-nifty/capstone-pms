export type AssetAssignment = {
    id: number;
    asset_id: number;
    unit_or_department_id: number;
    personnel_id: number;
    assigned_by?: number | null;
    date_assigned: string;
    remarks?: string | null;

    // relations
    asset?: {
        id: number;
        property_number: string;
        asset_model?: {
            id: number;
            brand: string;
            model: string;
            category?: { id: number; name: string };
        };
    }
    personnel?: { id: number; full_name: string; position?: string };
    unit_or_department?: { id: number; name: string };
    assigned_by_user?: { id: number; name: string };
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
};