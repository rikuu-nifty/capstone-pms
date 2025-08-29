import { Role, UserDetail } from "./custom-index";

export type User = {
    id: number;
    role?: Role | null;
    name: string;
    email: string;
    email_verified_at?: string | null;
    status: string;
    approved_at?: string | null;
    detail?: UserDetail | null;
    created_at?: string;
};

export type UserPageProps = {
    open: boolean;
    onClose: () => void;
    user: User | null;
    roles: Role[];
};

export type TabKey = 'system' | 'approvals';

export type QueryParams = { 
    tab?: TabKey; 
    q?: string; 
    page?: number | string;
    filter?: 'pending' | 'approved' | 'denied' | '';
};

export type UserStatus = '' | 'pending' | 'approved' | 'denied';

export function formatFullName(
    firstName: string,
    middleName: string | null,
    lastName: string
): string {
    if (middleName && middleName.trim().length > 0) {
        const initial = middleName.trim().charAt(0).toUpperCase();
        return `${firstName} ${initial}. ${lastName}`;
    }
    return `${firstName} ${lastName}`;
}
