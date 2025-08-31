import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import EditModal from "@/components/modals/EditModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Role, Permission } from "@/types/custom-index";

type Props = {
    show: boolean;
    onClose: () => void;
    role: Role;
    permissions: Permission[];
};

export default function EditRoleModal({ show, onClose, role, permissions }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name || "",
        code: role.code || "",
        description: role.description || "",
        permissions: role.permissions?.map((p) => p.id) ?? [],
    });

    useEffect(() => {
        if (show && role) {
            setData({
            name: role.name || "",
            code: role.code || "",
            description: role.description || "",
            permissions: role.permissions?.map((p) => p.id) ?? [],
            });
        }
    }, [show, role, setData]);


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(route("role-management.update", role.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    const togglePermission = (id: number) => {
        setData("permissions",
            data.permissions.includes(id)
                ? data.permissions.filter((p) => p !== id)
                : [...data.permissions, id]
        );
    };

    return (
        <EditModal
            show={show}
            onClose={() => {
                onClose();
            }}
            title="Edit Role"
            onSubmit={handleSubmit}
            processing={processing}
        >
            {/* Role Name */}
            <div>
                <Label htmlFor="name">Role Name</Label>
                <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    placeholder="e.g., PMO Head"
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Role Code */}
            <div>
                <Label htmlFor="code">Code</Label>
                <Input
                    id="code"
                    type="text"
                    value={data.code}
                    onChange={(e) => setData("code", e.target.value)}
                    placeholder="e.g., pmo_head"
                />
                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
            </div>

            {/* Description */}
            <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    type="text"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    placeholder="Short description"
                />
                {errors.description && (
                    <p className="text-xs text-red-500">{errors.description}</p>
                )}
            </div>

            {/* Permissions */}
            <div className="col-span-2 space-y-3 max-h-[320px] overflow-y-auto rounded-lg border bg-muted/10 p-4 mt-4">
                <Label className="font-medium block mb-2">Assign View Permissions</Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {permissions
                        .filter((perm) => perm.code.startsWith("view-"))
                        .map((perm) => (
                            <div
                                key={perm.id}
                                className="flex items-start gap-2 rounded-md p-2 hover:bg-muted/20 transition"
                            >
                                <Checkbox
                                    id={`perm-${perm.id}`}
                                    checked={data.permissions.includes(perm.id)}
                                    onCheckedChange={() => togglePermission(perm.id)}
                                    className="cursor-pointer"
                                />
                                <Label
                                    htmlFor={`perm-${perm.id}`}
                                    className="leading-snug"
                                >
                                    <span className="block font-medium">{perm.name}</span>
                                    <span className="block text-xs text-muted-foreground">
                                        {perm.code}
                                    </span>
                                </Label>
                            </div>
                        ))}
                </div>
            </div>
        </EditModal>
    );
}
