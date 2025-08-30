import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import type { Role } from "@/types/custom-index";

type Props = {
    roles: Role[];
    selectedRoleId: number | "";
    onApply: (roleId: number | "") => void;
    onClear: () => void;
};

export default function UserRoleFilterDropdown({ roles, selectedRoleId, onApply, onClear }: Props) {
    const [localRoleId, setLocalRoleId] = useState<number | "">(selectedRoleId);

    useEffect(() => {
        setLocalRoleId(selectedRoleId);
    }, [selectedRoleId]);

    const hasAny = localRoleId !== "";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                    <Filter className="mr-1 h-4 w-4" /> Role
                    {hasAny && <Badge className="ml-2" variant="secondary">Active</Badge>}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-3 w-[240px]">
                <div className="grid gap-3">
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Role</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localRoleId === "" ? "" : String(localRoleId)}
                            onChange={(e) => setLocalRoleId(e.target.value ? Number(e.target.value) : "")}
                        >
                            <option value="">All</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                                setLocalRoleId("");
                                onClear();
                            }}
                            className="cursor-pointer"
                        >
                            Clear
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onApply(localRoleId)}
                            className="cursor-pointer"
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
