import { Permission } from "./permission";

export type Role = {
    id: number;
    name: string;
    code: string;
    description?: string;

    permissions?: Permission[];
};

export type RoleWithCounts = Role & {
    permissions_count?: number;
    users_count?: number;
};

export type RolePageProps = {
    show: boolean;
    onClose: () => void;
    userId: number | null;
    roles: Role[];
    action: "approve" | "reassign"; // approve = approving a pending user, reassign = change role
};

export type RoleEditProps = {
    show: boolean;
    onClose: () => void;
    role: Role;
}

export type LinkItem = { url: string | null; label: string; active: boolean };

export type Paginator<T> = {
    data: T[];
    links?: LinkItem[];
    current_page?: number;
    last_page?: number;
    total?: number;
};

export type RoleManagementPageProps = {
    roles: Paginator<RoleWithCounts>;
    totals: {
        roles: number;
        permissions: number;
        users: number;
    };
    permissions: Permission[];
};