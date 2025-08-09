import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TransferPageProps, FilterModalProps } from '@/types/page-props';
import { Button } from '@/components/ui/button';

const statusOptions = ['upcoming', 'in_progress', 'overdue', 'completed'] as const;

function formatStatusLabel(status: string): string {
  return status
    .split('_')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export default function FilterModal({
    open,
    onClose,
    onApply,
    onClear,
    selected_status,
    selected_building,
    selected_receiving_building,
    selected_org,
    buildingCodes,
    orgCodes,
}: FilterModalProps) {
    const [localStatus, setLocalStatus] = useState(selected_status);
    const [localBuilding, setLocalBuilding] = useState(selected_building);
    const [localReceivingBuilding, setLocalReceivingBuilding] = useState(selected_receiving_building);
    const [localOrg, setLocalOrg] = useState(selected_org);

    useEffect(() => {
        setLocalStatus(selected_status);
        setLocalBuilding(selected_building);
        setLocalReceivingBuilding(selected_receiving_building);
        setLocalOrg(selected_org);
    }, [
        selected_status, 
        selected_building, 
        selected_receiving_building, 
        selected_org, 
        open
    ]);

    return (
        <Dialog open={open} onOpenChange={(v) => (v ? null : onClose())}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                <DialogTitle>Filter Transfers</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                {/* Status */}
                <div className="grid gap-1">
                    <label className="text-sm font-medium">Status</label>
                    <select
                    className="border rounded-md p-2"
                    value={localStatus}
                    onChange={(e) => setLocalStatus(e.target.value)}
                    >
                    <option value="">All</option>
                    {statusOptions.map((s) => (
                        <option key={s} value={s}>{formatStatusLabel(s)}</option>
                    ))}
                    </select>
                </div>

                {/* Current Building */}
                <div className="grid gap-1">
                    <label className="text-sm font-medium">Current Building</label>
                    <select
                    className="border rounded-md p-2"
                    value={localBuilding}
                    onChange={(e) => setLocalBuilding(e.target.value)}
                    >
                    <option value="">All</option>
                    {buildingCodes.map((code) => (
                        <option key={code} value={code}>{code}</option>
                    ))}
                    </select>
                </div>

                {/* Receiving Building */}
                <div className="grid gap-1">
                    <label className="text-sm font-medium">Receiving Building</label>
                    <select
                    className="border rounded-md p-2"
                    value={localReceivingBuilding}
                    onChange={(e) => setLocalReceivingBuilding(e.target.value)}
                    >
                    <option value="">All</option>
                    {buildingCodes.map((code) => (
                        <option key={code} value={code}>{code}</option>
                    ))}
                    </select>
                </div>

                {/* Unit/Department */}
                <div className="grid gap-1">
                    <label className="text-sm font-medium">Unit / Department</label>
                    <select
                    className="border rounded-md p-2"
                    value={localOrg}
                    onChange={(e) => setLocalOrg(e.target.value)}
                    >
                    <option value="">All</option>
                    {orgCodes.map((code) => (
                        <option key={code} value={code}>{code}</option>
                    ))}
                    </select>
                </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                    variant="outline" 
                    onClick={onClear}
                >
                    Clear
                </Button>
                <Button
                    onClick={() => {
                    onApply({
                        status: localStatus,
                        building: localBuilding,
                        receiving_building: localReceivingBuilding,
                        org: localOrg,
                    });
                    onClose();
                    }}
                >
                    Apply Filters
                </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
    );
};