import { Role, UserDetail, UnitOrDepartment } from "./custom-index";

export type User = {
    id: number;
    role?: Role | null;
    name: string;
    email: string;
    email_verified_at?: string | null;
    status: string;
    approved_at?: string | null;
    approval_notes?: string | null;
    detail?: UserDetail | null;
    created_at?: string;
    updated_at?: string;
    can_delete?: boolean;

    unit_or_department_id?: number | null;
    unit_or_department?: UnitOrDepartment | null;
};

export type UserPageProps = {
    open: boolean;
    onClose: () => void;
    user: User | null;
    roles: Role[];

    unitOrDepartments: { id: number; name: string }[];
};

export type TabKey = 'system' | 'approvals';

export type QueryParams = { 
    tab?: TabKey; 
    q?: string; 
    page?: number | string;
    filter?: 'pending' | 'approved' | 'denied' | '';
};

export type UserStatus = '' | 'pending' | 'approved' | 'denied';