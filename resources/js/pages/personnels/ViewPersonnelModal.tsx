import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import axios from "axios";

import ViewModal from "@/components/modals/ViewModal";
import { formatDateLong, formatFullName } from "@/types/custom-index";
import type { AssetAssignment, AssetAssignmentItem, Paginated } from "@/types/asset-assignment";

import type { Personnel } from "@/types/personnel";
import ReassignAssetsModal from "../assignments/ReassignAssetsModal";
import ViewAssignmentModal from "../assignments/ViewAssignmentModal";

interface Props {
    open: boolean;
    onClose: () => void;
    personnel: Personnel | null;
    personnels: Personnel[];
}

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const statusMap: Record<Personnel["status"], { label: string; variant: BadgeVariant }> = {
    active: { label: "Active", variant: "personnel_active" },
    inactive: { label: "Inactive", variant: "personnel_inactive" },
    left_university: { label: "Left University", variant: "personnel_left" },
};

export default function ViewPersonnelModal({ 
    open, 
    onClose, 
    personnel,
    personnels,
}: Props) {
    const [showReassign, setShowReassign] = useState(false);
    const [showViewAssignment, setShowViewAssignment] = useState(false);
    const [assignmentData, setAssignmentData] = useState<AssetAssignment | null>(null);
    const [assignmentItems, setAssignmentItems] = useState<Paginated<AssetAssignmentItem> | null>(null);
    
    const initials = useMemo(() => {
        if (!personnel) return "";
        return `${personnel.first_name?.[0] ?? ""}${personnel.last_name?.[0] ?? ""}`.toUpperCase();
    }, [personnel]);

    if (!personnel) return null;

    const openAssignment = async (assignmentId: number) => {
        try {
            const res = await axios.get(route("assignments.show.json", { assignment: assignmentId }));
            setAssignmentData(res.data.assignment);
            setAssignmentItems(res.data.items);
            setShowViewAssignment(true);
        } catch (err) {
            console.error("Failed to load assignment:", err);
        }
    };

    const statusConfig = statusMap[personnel.status];

    return (
        <>
        <ViewModal
            open={open}
            onClose={onClose}
            size="lg"
            contentClassName="relative max-h-[55vh] min-h-[55vh] overflow-y-auto"
        >
            {/* Header */}
            <div className="flex items-center gap-6 border-b pb-4">
                {/* Avatar */}
                <div className="h-20 w-20 flex items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-700">
                    {initials || "?"}
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">
                        {formatFullName(
                            personnel.first_name,
                            personnel.middle_name ?? "",
                            personnel.last_name
                        )}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {personnel.position ?? "—"}
                    </p>
                </div>
            </div>

            {/* Details */}
            <div className="mt-6 grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-12">
                <div className="mb-2">
                    <span className="block text-xs font-medium text-muted-foreground">Unit / Department</span>
                    <p className="text-base font-semibold">{personnel.unit_or_department ?? "—"}</p>
                </div>
                
               <div>
                    <span className="block text-xs font-medium text-muted-foreground">Assets Assigned</span>
                    <p className="text-base font-semibold">
                        {personnel.assigned_assets ? personnel.assigned_assets.length : 0}
                    </p>
                </div>
                
                <div>
                    <span className="block text-xs font-medium text-muted-foreground">System User</span>
                    <p className="flex items-center gap-2 text-base font-semibold">
                        {personnel.user_id ? (
                            <>
                                <Check className="h-5 w-5 text-green-600" />
                                Linked
                            </>
                        ) : (
                            <>
                                <X className="h-5 w-5 text-red-600" />
                                Not Linked
                            </>
                        )}
                    </p>
                </div>

                <div>
                    <span className="block text-xs font-medium text-muted-foreground">Status</span>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                </div>

                <div className="col-span-2 border-t mt-4 mb-4"></div>

                <div>
                    <span className="block text-xs font-medium text-muted-foreground">Created At</span>
                    <p className="text-base">{formatDateLong(personnel.created_at) ?? "—"}</p>
                </div>

                <div>
                    <span className="block text-xs font-medium text-muted-foreground">Updated At</span>
                    <p className="text-base">{formatDateLong(personnel.updated_at) ?? "—"}</p>
                </div>

                <div className="col-span-2 border-t mt-4 mb-8"></div>

                {/* Actions */}
                <div className="col-span-2 flex flex-wrap justify-center gap-4">
                    <Button
                        // variant="outline"
                        onClick={() => {
                            // open reassign modal
                            setShowReassign(true);
                        }}
                        className="cursor-pointer"
                    >
                        Transfer Asset Assignment
                    </Button>
                    
                    {/* {personnel.latest_assignment_id ? (
                        <Button
                            variant="primary"
                            onClick={() => openAssignment(personnel.latest_assignment_id!)}
                            className="cursor-pointer"
                        >
                            View Assigned Assets
                        </Button>
                    ) : (
                        <Button variant="outline" disabled className="cursor-not-allowed">
                            No Assigned Assets
                        </Button>
                    )} */}

                    {personnel.assigned_assets && personnel.assigned_assets.length > 0 && personnel.latest_assignment_id && (
                        <Button
                            variant="primary"
                            onClick={() => openAssignment(personnel.latest_assignment_id!)}
                            className="cursor-pointer"
                        >
                            View Assigned Assets
                        </Button>
                    )}

                </div>
            </div>

           {showReassign && (
                <ReassignAssetsModal
                    open={showReassign}
                    onClose={() => setShowReassign(false)}
                    personnels={personnels} // from props, not allPersonnels
                    assignmentId={personnel?.latest_assignment_id ?? null}
                />
            )}

            {/* View Assignment Modal */}
            {showViewAssignment && assignmentData && assignmentItems && (
                <ViewAssignmentModal
                    open={showViewAssignment}
                    onClose={() => setShowViewAssignment(false)}
                    assignment={assignmentData}
                    items={assignmentItems}
                />
            )}
        </ViewModal>
        </>
    );
}
