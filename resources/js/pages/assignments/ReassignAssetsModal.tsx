import { useEffect, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Pagination, { PageInfo } from '@/components/Pagination';
import Select from 'react-select';
import axios from 'axios';
import type { AssetAssignmentItem, AssignmentAssetsResponse } from '@/types/asset-assignment';

interface Props {
    open: boolean;
    onClose: () => void;
    personnels: { 
        id: number; 
        full_name: string 
    }[];
    assignmentId?: number | null;
    }

export default function ReassignAssetsModal({
    open,
    onClose,
    personnels,
    assignmentId,
}: Props) {
    const [fromPersonnel, setFromPersonnel] = useState<number | null>(null);
    const [toPersonnel, setToPersonnel] = useState<number | null>(null);

    const [assets, setAssets] = useState<AssetAssignmentItem[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    const [mode, setMode] = useState<'single' | 'bulk'>('single');

    // Per-row selection memory for single-mode
    const [rowSelections, setRowSelections] = useState<Record<number, number | null>>({});

    const fetchAssets = useCallback(
        async (p: number, id: number | null) => {
            if (!id) {
                setAssets([]);
                setTotal(0);
                return;
            }

            const res = await axios.get<AssignmentAssetsResponse>(
                route('assignments.assignmentAssets', { assignment: id }),
                { params: { page: p, per_page: pageSize } }
            );

            setAssets(res.data.items.data);
            setTotal(res.data.items.total);
            setFromPersonnel(res.data.personnel_id);
        },
        [pageSize]
    );

    useEffect(() => {
        if (open && assignmentId) {
            setPage(1);
            fetchAssets(1, assignmentId);
        }
    }, [open, assignmentId, fetchAssets]);

    const bulkReassign = () => {
        if (!toPersonnel || !assignmentId) return;

        router.put(
            route('assignments.bulkReassign', { assignment: assignmentId }),
            { new_personnel_id: toPersonnel },
            {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
            onError: (errors) => {
                console.error(errors);
            },
            }
        );
    };

    const saveSingleReassignments = () => {
  const changes = Object.entries(rowSelections)
    .filter(([, targetId]) => targetId != null)
    .map(([itemIdStr, targetId]) => ({
      item_id: Number(itemIdStr),
      new_personnel_id: targetId!,
    }));

  if (changes.length === 0) return;

  router.put(
    route('assignments.bulkReassignItems', { assignment: assignmentId }),
    { changes },
    {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
      },
      onError: (errors) => {
        console.error(errors);
      },
    }
  );
};

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="flex max-h-[90vh] min-h-[75vh] w-full max-w-[750px] flex-col overflow-hidden p-6 sm:max-w-[850px]">
                <DialogHeader>
                    <DialogTitle>
                        Reassign Assets
                        {/* {fromPersonnel && (
                            <span className="ml-1 font-bold text-blue-700">
                                {personnels.find((p) => p.id === fromPersonnel)?.full_name ?? ''}
                            </span>
                        )} */}
                    </DialogTitle>
                    <DialogDescription>
                        Select personnel and reassign assets as needed.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2">
                    <Button
                        variant={mode === 'single' ? 'default' : 'outline'}
                        onClick={() => setMode('single')}
                        className="cursor-pointer"
                    >
                        Single Asset Mode
                    </Button>
                    <Button
                        variant={mode === 'bulk' ? 'default' : 'outline'}
                        onClick={() => setMode('bulk')}
                        className="cursor-pointer"
                    >
                        Bulk Mode
                    </Button>
                </div>

                {/* <div className="flex-1 overflow-y-auto pr-2 -mr-2 text-sm"> */}
                <div className="flex-1 overflow-y-scroll pr-2 -mr-2 text-sm">

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-muted-foreground">
                                Current Personnel
                            </label>
                            <div className="text-xl font-bold tracking-wide text-blue-700">
                                {fromPersonnel
                                ? personnels.find((p) => p.id === fromPersonnel)?.full_name ?? '—'
                                : '—'}
                            </div>
                        </div>

                        {mode === 'bulk' && (
                            <div>
                                <label className="mb-1 block font-medium">Transfer To</label>
                                <Select
                                    className="w-full"
                                    value={
                                        toPersonnel
                                        ? personnels.find((p) => p.id === toPersonnel) ?? null
                                        : null
                                    }
                                    options={personnels.filter((p) => p.id !== fromPersonnel)}
                                    getOptionValue={(p) => String(p.id)}
                                    getOptionLabel={(p) => p.full_name}
                                    onChange={(opt) => setToPersonnel(opt ? opt.id : null)}
                                    isClearable
                                    placeholder="Select target personnel"
                                    styles={{
                                        control: (base) => ({ ...base, minHeight: 36, textAlign: 'left' }),
                                        valueContainer: (base) => ({ ...base, textAlign: 'left' }),
                                        placeholder: (base) => ({ ...base, marginLeft: 2 }),
                                        menu: (base) => ({ ...base, zIndex: 50 }),
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {mode === 'single' && (
                        <div className="mt-4 overflow-visible rounded-md border border-gray-200">
                            {assets.length > 0 ? (
                                <table className="w-full text-sm border-collapse table-fixed">
                                    <thead className="bg-gray-100 text-gray-700">
                                        <tr>
                                            <th className="px-3 py-2 text-center w-12">#</th>
                                            <th className="px-3 py-2 text-center w-50">Serial No</th>
                                            <th className="px-3 py-2 text-center w-50">Asset Name</th>
                                            <th className="px-3 py-2 text-center" style={{ width: '18rem' }}>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assets.map((a, idx) => {
                                            const selectedId = rowSelections[a.id] ?? null;
                                            const selectedOption =
                                                selectedId != null
                                                ? personnels.find((p) => p.id === selectedId) ?? null
                                                : null;

                                            return (
                                                <tr key={a.id} className="border-t">
                                                    <td className="px-3 py-2 text-center">
                                                        {(page - 1) * pageSize + idx + 1}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {a.asset?.serial_no ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {a.asset?.asset_name ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-2 align-middle">
                                                        <div className="w-64 mx-auto">
                                                            <Select
                                                                className="w-full"
                                                                value={selectedOption}
                                                                options={personnels.filter((p) => p.id !== fromPersonnel)}
                                                                getOptionValue={(p) => String(p.id)}
                                                                getOptionLabel={(p) => p.full_name}
                                                                onChange={(opt) => {
                                                                    const newId = opt ? opt.id : null;
                                                                    setRowSelections((prev) => ({ ...prev, [a.id]: newId }));
                                                                    // if (newId) reassignItem(a.id, newId); THIS IS AUTO REASSIGN IMMEDIATELY
                                                                }}
                                                                placeholder="Reassign to..."
                                                                isClearable
                                                                // IMPORTANT: no menuPortalTarget here (Radix Dialog would inert it)
                                                                styles={{
                                                                    container: (base) => ({ ...base, width: '100%' }),
                                                                    control: (base) => ({
                                                                        ...base,
                                                                        minHeight: 36,
                                                                        textAlign: 'left',
                                                                    }),
                                                                    valueContainer: (base) => ({
                                                                        ...base,
                                                                        textAlign: 'left',
                                                                    }),
                                                                    placeholder: (base) => ({ ...base, marginLeft: 2 }),
                                                                    menu: (base) => ({
                                                                        ...base,
                                                                        zIndex: 50,
                                                                        position: 'absolute',
                                                                    }),
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="p-4 text-center text-muted-foreground">
                                    {fromPersonnel
                                        ? 'No assets found for this personnel.'
                                        : 'Select a personnel to load assets.'}
                                </p>
                            )}
                        </div>
                    )}

                    {mode === 'bulk' && (
                        <div className="mt-4 overflow-hidden rounded-md border border-gray-200">
                            {assets.length > 0 ? (
                                <table className="w-full text-sm border-collapse">
                                <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                    <th className="px-3 py-2 text-center w-12">#</th>
                                    <th className="px-3 py-2 text-center">Serial No</th>
                                    <th className="px-3 py-2 text-center">Asset Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map((a, idx) => (
                                    <tr key={a.id} className="border-t">
                                        <td className="px-3 py-2 text-center">
                                        {(page - 1) * pageSize + idx + 1}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                        {a.asset?.serial_no ?? '—'}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                        {a.asset?.asset_name ?? '—'}
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                                </table>
                            ) : (
                                <p className="p-4 text-center text-muted-foreground">
                                {fromPersonnel
                                    ? 'No assets found for this personnel.'
                                    : 'Select a personnel to load assets.'}
                                </p>
                            )}
                        </div>
                    )}

                    {assets.length > 0 && (
                        <div className="flex items-center justify-between p-3">
                        <PageInfo page={page} total={total} pageSize={pageSize} label="assets" />
                        <Pagination
                            page={page}
                            total={total}
                            pageSize={pageSize}
                            onPageChange={setPage}
                        />
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4 shrink-0 border-t pt-4 flex justify-end gap-2">
                    <DialogClose asChild>
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                    </DialogClose>

                        {mode === 'single' && assets.length > 0 && (
                            <Button
                                onClick={saveSingleReassignments}
                                disabled={Object.values(rowSelections).every((v) => v == null)}
                                className="cursor-pointer"
                            >
                                Save Changes
                            </Button>
                        )}

                        {mode === 'bulk' && (
                            <Button
                                onClick={bulkReassign}
                                disabled={!fromPersonnel || !toPersonnel}
                                className="cursor-pointer"
                            >
                                Reassign All
                            </Button>
                        )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
