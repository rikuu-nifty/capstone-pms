export type Role = {
    id: number;
    name: string;
    code: string;
    description?: string;
};

export type RolePageProps = {
    show: boolean;
    onClose: () => void;
    userId: number | null;
    roles: Role[];
    action: "approve" | "reassign"; // approve = approving a pending user, reassign = change role
};