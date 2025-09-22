import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Pagination, { PageInfo } from '@/components/Pagination';
import axios from 'axios';

type AssetItem = {
  id: number;
  asset_name: string;
  serial_no: string;
  assignment_item_id: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  personnelId: number;
  personnels: { id: number; full_name: string }[];
};

export default function ReassignAssetsModal({ open, onClose, personnelId, personnels }: Props) {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [bulkTarget, setBulkTarget] = useState<number | ''>('');
  const pageSize = 10;

  const fetchAssets = useCallback(async (p: number) => {
    const res = await axios.get(route('assignments.personnelAssets', { personnel: personnelId }), {
      params: { page: p, per_page: pageSize },
    });
    setAssets(res.data.data);
    setTotal(res.data.total);
  }, [personnelId]);

  useEffect(() => {
    if (open) fetchAssets(page);
  }, [open, page, fetchAssets]);

  const reassignItem = async (itemId: number, targetPersonnel: number) => {
    await axios.put(route('assignments.reassignItem', { item: itemId }), {
      new_personnel_id: targetPersonnel,
    });
    fetchAssets(page); // refresh
  };

  const bulkReassign = async () => {
    if (!bulkTarget) return;
    await axios.put(route('assignments.bulkReassign', { personnel: personnelId }), {
      new_personnel_id: bulkTarget,
    });
    onClose(); // close + refresh index
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[min(900px,95vw)] max-w-none">
        <DialogHeader>
          <DialogTitle>Reassign Assets</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 mb-4">
          <select
            value={bulkTarget}
            onChange={(e) => setBulkTarget(Number(e.target.value))}
            className="border rounded p-2 text-sm"
          >
            <option value="">Select personnel...</option>
            {personnels.filter(p => p.id !== personnelId).map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
          <Button onClick={bulkReassign} disabled={!bulkTarget}>Reassign All</Button>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Asset</th>
              <th className="px-3 py-2">Serial</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a, idx) => (
              <tr key={a.id} className="border-t">
                <td className="px-3 py-2">{(page - 1) * pageSize + idx + 1}</td>
                <td className="px-3 py-2">{a.asset_name}</td>
                <td className="px-3 py-2">{a.serial_no}</td>
                <td className="px-3 py-2">
                  <select
                    className="border rounded p-1 text-sm"
                    onChange={(e) => {
                      const newId = Number(e.target.value);
                      if (newId) reassignItem(a.assignment_item_id, newId);
                    }}
                  >
                    <option value="">Reassign to...</option>
                    {personnels.filter(p => p.id !== personnelId).map(p => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between p-3">
          <PageInfo page={page} total={total} pageSize={pageSize} label="assets" />
          <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
