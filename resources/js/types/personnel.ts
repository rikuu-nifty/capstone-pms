export type Personnel = {
    id: number;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    full_name: string;

    user_id?: number | null;
    user_name?: string | null;

    position?: string | null;
    unit_or_department_id?: number | null;
    unit_or_department?: string | null;
    status: 'active' | 'inactive' | 'left_university';
};

export type UserLite = {
    id: number;
    name: string;
    email: string;
};

export type PersonnelFormData = {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    user_id?: number | null | string;

    position?: string | null;
    unit_or_department_id?: number | null | string;
    status: 'active' | 'inactive' | 'left_university';
};

export type PersonnelTotals = {
    total_personnels: number;
    active_personnels: number;
};

export type UnitLite = {
    id: number;
    name: string;
};

export type PersonnelPageProps = {
    personnels: Personnel[];
    users: UserLite[];
    units: UnitLite[];
    totals?: PersonnelTotals;
};
