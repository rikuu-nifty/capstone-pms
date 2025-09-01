import { useForm } from "@inertiajs/react";
import EditModal from "@/components/modals/EditModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Role, Permission } from "@/types/custom-index";
import { useMemo, useState } from "react";

interface Props {
    show: boolean;
    onClose: () => void;
    role: Role;
    permissions: Permission[];
};

const PERMISSION_GROUPS: Record<string, string[]> = {
    "Users Management": [
        "view-users-page",
        "approve-users",
        "reset-user-password",
        "send-email-change-request",
        "delete-users",
    ],
    "Roles & Permissions": [
        "view-roles-page",
        "create-roles",
        "update-roles",
        "delete-role",
        "update-permissions",
    ],
    "Inventory Scheduling": [
        "view-inventory-scheduling",
        "create-inventory-scheduling",
        "update-inventory-scheduling",
        "delete-inventory-scheduling",
    ],
    "Inventory List": [
        "view-inventory-list",
        "create-inventory-list",
        "update-inventory-list",
        "delete-inventory-list",
    ],
    "Transfers": [
        "view-transfers",
        "create-transfers",
        "update-transfers",
        "delete-transfers",
    ],
    "Turnover / Disposal": [
        "view-turnover-disposal",
        "create-turnover-disposal",
        "update-turnover-disposal",
        "delete-turnover-disposal",
    ],
    "Off Campus": [
        "view-off-campus",
        "create-off-campus",
        "update-off-campus",
        "delete-off-campus",
        "restore-off-campus",
    ],
    "Buildings": [
        "view-buildings",
        "create-buildings",
        "update-buildings",
        "delete-buildings",
    ],
    "Building Rooms": [
        "view-building-rooms",
        "create-building-rooms",
        "update-building-rooms",
        "delete-building-rooms",
    ],
    "Categories": [
        "view-categories",
        "create-categories",
        "update-categories",
        "delete-categories",
    ],
    "Asset Models": [
        "view-asset-models",
        "create-asset-models",
        "update-asset-models",
        "delete-asset-models",
    ],
    "Unit or Departments": [
        "view-unit-or-departments",
        "create-unit-or-departments",
        "update-unit-or-departments",
        "delete-unit-or-departments",
    ],
    "Form Approvals": [
        "view-form-approvals",
        "approve-form-approvals",
        "delete-form-approvals",
    ],
    "Reports": ["view-reports"],
    // "Assignments": [
    //     "view-assignments",
    //     "create-assignments",
    //     "update-assignments",
    //     "delete-assignments",
    // ],
    "Profile": ["view-profile", "manage-profile"],
};

export default function ManagePermissionsModal({
    show,
    onClose,
    role,
    permissions,
}: Props) {
    const { data, setData, put, processing, reset } = useForm<{permissions: number[];}>({
        permissions: role?.permissions?.map((p) => p.id) ?? [],
    });

    const [search, setSearch] = useState("");

    const permMap = useMemo(() => {
        const map: Record<string, Permission> = {};
        permissions.forEach((p) => {
            map[p.code] = p;
        });
        return map;
    }, [permissions]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route("role-management.permissions.update", role.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const togglePermission = (id: number) => {
        setData(
            "permissions",
            data.permissions.includes(id)
                ? data.permissions.filter((p) => p !== id)
                : [...data.permissions, id]
        );
    };

    return (
        <EditModal
            show={show}
            onClose={onClose}
            title={`Manage Permissions for ${role.name}`}
            onSubmit={handleSubmit}
            processing={processing}
        >
            <div className="col-span-2 mb-4">
                <Input
                    type="text"
                    placeholder="Search permissions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Permission groups */}
            <div className="col-span-2 space-y-6 max-h-[500px] overflow-y-auto rounded-lg p-4 bg-muted/10">
                {Object.entries(PERMISSION_GROUPS).map(([group, codes]) => {
                    // Filter group based on search
                    const groupPerms = codes
                        .map((code) => permMap[code])
                        .filter(
                            (p) =>
                                p &&
                                (!search ||
                                    p.name
                                        .toLowerCase()
                                        .includes(search.toLowerCase()) ||
                                    p.code
                                        .toLowerCase()
                                        .includes(search.toLowerCase()))
                        );

                    if (groupPerms.length === 0) return null;

                    return (
                        <div key={group} className="space-y-2">
                            {/* Group header */}
                            <div className="flex items-center border-b pb-1 mb-2">
                                <h3 className="text-sm font-semibold text-foreground/80">
                                    {group}
                                </h3>
                            </div>

                            {/* Group permissions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                                {groupPerms.map((perm) => (
                                    <div
                                        key={perm.id}
                                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/30 transition"
                                    >
                                        <Checkbox
                                            id={`perm-${perm.id}`}
                                            checked={data.permissions.includes(perm.id)}
                                            onCheckedChange={() =>
                                                togglePermission(perm.id)
                                            }
                                            className="cursor-pointer"
                                        />
                                        <Label
                                            htmlFor={`perm-${perm.id}`}
                                            className="flex-1"
                                        >
                                            {perm.name}
                                            <span className="ml-1 text-xs text-muted-foreground">
                                                ({perm.code})
                                            </span>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </EditModal>
    );
}
