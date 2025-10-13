import { useForm } from "@inertiajs/react";
import EditModal from "@/components/modals/EditModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Role, Permission } from "@/types/custom-index";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
    show: boolean;
    onClose: () => void;
    role: Role;
    permissions: Permission[];
}

const PERMISSION_GROUPS: Record<string, string[]> = {
    "Reports": [
        "view-reports"
    ],
    "Audit Logs": [
        "view-audit-logs"
    ],
    "Profile": [
        "view-profile", 
        "manage-profile"
    ],
    "Viewer Permissions": [
        "view-own-unit-inventory-list",
        "view-own-unit-buildings",
    ],
    "Calendar": [
        "view-calendar"
    ],
    "Trash Bin": [
        "view-trash-bin",
        "restore-trash-bin",
        "permanent-delete-trash-bin",
    ],
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
    "Signatories": [
        "view-signatories",
        "create-signatories",
        "update-signatories",
        "delete-signatories",
    ],
    "Form Approvals": [
        "view-form-approvals",
        "approve-form-approvals",
        "delete-form-approvals",
        "reset-form-approvals",
    ],
    "Personnels": [
        "view-personnels",
        "create-personnels",
        "update-personnels",
        "delete-personnels",
    ],
    "Assignments": [
        "view-assignments",
        "create-assignments",
        "update-assignments",
        "delete-assignments",
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
    "Equipment Codes": [
        "view-equipment-codes",
        "create-equipment-codes",
        "update-equipment-codes",
        "delete-equipment-codes",
    ],
    "Unit or Departments": [
        "view-unit-or-departments",
        "create-unit-or-departments",
        "update-unit-or-departments",
        "delete-unit-or-departments",
    ],
    "Notifications": [
        "view-notifications",
        "update-notifications",
        "archive-notifications",
        "delete-notifications",
    ],
};

export default function ManagePermissionsModal({
    show,
    onClose,
    role,
    permissions,
}: Props) {
    const { data, setData, put, processing, reset } = useForm<{ permissions: number[] }>({
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
                : [...data.permissions, id],
        );
    };

    return (
        <EditModal
            show={show}
            onClose={onClose}
            title={`Manage Permissions for ${role.name}`}
            onSubmit={handleSubmit}
            processing={processing}
            contentClassName="flex max-h-[80vh] min-h-[80vh] flex-col overflow-hidden"
        >
            <div className="col-span-2 mb-4 flex items-center gap-2">
                <Input
                    type="text"
                    placeholder="Search permissions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                />

                <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                        setData("permissions", permissions.map((p) => p.id));
                        setSearch("");
                    }}
                    className="cursor-pointer whitespace-nowrap"
                >
                    Select All
                </Button>

                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                        setData("permissions", []);
                        setSearch("");
                    }}
                    className="cursor-pointer whitespace-nowrap"
                >
                    Clear All
                </Button>
            </div>

            {/* Permission groups */}
            <div className="col-span-2 space-y-6 max-h-[500px] min-h-[500px] overflow-y-auto rounded-lg p-4 bg-muted/10">
                {Object.entries(PERMISSION_GROUPS).map(([group, codes]) => {
                    const groupPerms = codes
                        .map((code) => permMap[code])
                        .filter(
                            (p) =>
                                p &&
                                (!search ||
                                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                                    p.code.toLowerCase().includes(search.toLowerCase())),
                        );

                    if (groupPerms.length === 0) return null;

                    return (
                        <div key={group} className="space-y-2">
                            <div className="flex items-center border-b pb-1 mb-2">
                                <h3 className="text-lg font-semibold text-blue-600">
                                    {group}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                                {groupPerms.map((perm) => (
                                    <div
                                        key={perm.id}
                                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/30 transition"
                                    >
                                        <Checkbox
                                            id={`perm-${perm.id}`}
                                            checked={data.permissions.includes(perm.id)}
                                            onCheckedChange={() => togglePermission(perm.id)}
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
