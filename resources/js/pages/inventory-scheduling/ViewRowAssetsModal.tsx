import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Pagination, { PageInfo } from '@/components/Pagination';
import { ucwords } from '@/types/custom-index';
import axios, { AxiosError }  from 'axios';
import { Button } from '@/components/ui/button';

type AssetWithStatus = {
    id: number;
    asset_name: string;
    serial_no: string;
    inventory_status: string;
    unit_or_department_id?: number | null;
    unit_or_department_name?: string | null;
    building_id?: number | null;
    building_name?: string | null;
    room_id?: number | null;
    room_name?: string | null;
    sub_area_id?: number | null;
    sub_area_name?: string | null;
    asset_model?: {
        category?: { name?: string };
    };
};

type RowAssetsModalProps = {
    open: boolean;
    onClose: () => void;
    scheduleId: number;
    rowId: number;
    type: 'building_room' | 'sub_area';
    title: string;
    unitId?: number | null;
};

type UiError = {
  message: string;
  status?: number;
  url?: string;
  method?: string;
  data?: unknown;
};


function ViewRowAssetModal({ 
    open, 
    onClose, 
    scheduleId, 
    rowId, 
    type, 
    title,
    unitId,
}: RowAssetsModalProps) {
    const [assets, setAssets] = useState<AssetWithStatus[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;



// 2) Narrow unknown → UiError
function toUiError(e: unknown): UiError {
  if (axios.isAxiosError(e)) {
    const ax = e as AxiosError<{ message?: string }>;
    return {
      message: ax.response?.data?.message ?? ax.message,
      status: ax.response?.status,
      url: ax.config?.url,
      method: ax.config?.method,
      data: ax.response?.data,
    };
  }
  if (e instanceof Error) return { message: e.message };
  return { message: String(e) };
}

const [lastError, setLastError] = useState<UiError | null>(null);

const fetchAssets = useCallback(async (p: number) => {
  try {
    const res = await axios.get(
      route('schedules.rowAssets', { schedule: scheduleId, row: rowId }),
      { params: { page: p, per_page: pageSize, type, unit_id: unitId } }
    );
    setAssets(res.data.data);
    setTotal(res.data.total);
    setLastError(null);
  } catch (e: unknown) {
    console.error('Failed to load assets', e);
    setLastError(toUiError(e));
  }
}, [scheduleId, rowId, type, pageSize, unitId]);

const updateStatus = async (assetId: number, newStatus: string) => {
  try {
    await axios.put(
      route('schedules.updateAssetStatus', { schedule: scheduleId, asset: assetId }),
      { inventory_status: newStatus }
    );
    fetchAssets(page);
    setLastError(null);
  } catch (e: unknown) {
    console.error('Failed to update asset status', e);
    setLastError(toUiError(e));
  }
};

const bulkUpdateStatus = async (newStatus: string) => {
  try {
    await axios.put(
      route('schedules.bulkUpdateAssetStatus', { schedule: scheduleId, row: rowId }),
      { inventory_status: newStatus, type, unit_id: unitId }
    );
    fetchAssets(page);
    setLastError(null);
  } catch (e: unknown) {
    console.error('Failed to bulk update assets', e);
    setLastError(toUiError(e));
  }
};

    // const fetchAssets = useCallback(
    //     async (p: number) => {
    //         const res = await axios.get(
    //             route('schedules.rowAssets', { schedule: scheduleId, row: rowId }),
    //             { params: { page: p, per_page: pageSize, type, unit_id: unitId } }
    //         );
    //         setAssets(res.data.data);
    //         setTotal(res.data.total);
    //     },
    //     [scheduleId, rowId, type, pageSize, unitId]
    // );


    useEffect(() => {
        if (open) fetchAssets(page);
    }, [open, page, fetchAssets]);

    // const updateStatus = async (assetId: number, newStatus: string) => {
    //     try {
    //         await axios.put(
    //             route('schedules.updateAssetStatus', { schedule: scheduleId, asset: assetId }),
    //             { inventory_status: newStatus }
    //         );
    //         // refresh after update
    //         fetchAssets(page);
    //     } catch (err) {
    //         console.error('Failed to update asset status', err);
    //     }
    // };

    // const bulkUpdateStatus = async (newStatus: string) => {
    //     try {
    //         await axios.put(
    //             route('schedules.bulkUpdateAssetStatus', { schedule: scheduleId, row: rowId }),
    //             { inventory_status: newStatus, type, unit_id: unitId }
    //         );
    //         fetchAssets(page);
    //     } catch (err) {
    //         console.error('Failed to bulk update assets', err);
    //     }
    // };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent 
                // className="w-[min(900px,95vw)] max-w-none max-h-[90vh] overflow-y-auto p-0 sm:max-w-[1100px]"
                className="w-[350px] max-w-[95vw] h-[85vh] sm:h-auto sm:w-[min(900px,95vw)] sm:max-w-[1100px] overflow-y-auto p-0"
            >
                <div 
                    className="w-[320px] sm:w-full print-force-light bg-white p-4 sm:p-6 text-gray-900 dark:bg-neutral-950 dark:text-gray-100"
                >
                    <DialogHeader>
                        <DialogTitle className="w-[300px] sm:w-full text-sm sm:text-xl font-bold tracking-wide text-center text-left">
                        {title}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            View Assets
                        </DialogDescription>
                    </DialogHeader>

                    {/* Bulk buttons */}
                    <div 
                        // className="w-[320px] sm:w-full flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 mt-4 mb-4"
                        className="
                            w-[320px] sm:w-full
                            flex flex-col sm:flex-row sm:flex-wrap
                            justify-center
                            gap-2 sm:gap-3 mt-4 mb-4
                        "
                    >
                        <Button
                            className="cursor-pointer w-full sm:w-[160px] sm:w-auto"
                            size="sm"
                            variant="primary"
                            onClick={() => bulkUpdateStatus('scheduled')}
                        >
                            Set all as Scheduled
                        </Button>

                        <Button
                            className="cursor-pointer w-full sm:w-[160px] sm:w-auto"
                            size="sm"
                            onClick={() => bulkUpdateStatus('inventoried')}
                        >
                            Set all as Inventoried
                        </Button>

                        <Button
                            className="cursor-pointer w-full sm:w-[180px] sm:w-auto"
                            size="sm"
                            variant="destructive"
                            onClick={() => bulkUpdateStatus('not_inventoried')}
                        >
                            Set all as Not Inventoried
                        </Button>

                        <Button
                            className="cursor-pointer w-full sm:w-[160px] sm:w-auto bg-amber-600 text-white hover:bg-amber-500 hover:text-white"
                            size="sm"
                            variant="outline"
                            onClick={() => bulkUpdateStatus('missing')}
                        >
                            Set all as Missing
                        </Button>
                    </div>

                    {lastError && (
  <div className="mb-3 rounded border border-red-300 bg-red-50 p-3 text-xs text-red-900 dark:border-red-800 dark:bg-red-900/20">
    <strong className="block mb-1">Request Error</strong>
    <pre className="overflow-auto max-h-48 whitespace-pre-wrap">
      {JSON.stringify(lastError, null, 2)}
    </pre>
  </div>
)}


                    {/* Table wrapper */}
                    <div className="w-[320px] sm:w-full mt-4 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                        <div className="overflow-x-auto">
                            {assets.length > 0 ? (
                            <>
                                <table className="min-w-[600px] sm:w-full border-collapse">
                                    <thead className="bg-gray-100 dark:bg-neutral-900 text-gray-700 dark:text-gray-300 text-sm">
                                        <tr>
                                            <th className="border px-2 sm:px-3 py-2 text-center">#</th>
                                            <th className="border px-2 sm:px-3 py-2 text-center">Asset Name</th>
                                            <th className="border px-2 sm:px-3 py-2 text-center">Serial No</th>
                                            <th className="border px-2 sm:px-3 py-2 text-center">Category</th>
                                            <th className="border px-2 sm:px-3 py-2 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs sm:text-sm">
                                        {assets.map((a, idx) => (
                                        <tr
                                            key={a.id}
                                            className="odd:bg-white even:bg-gray-50 dark:odd:bg-neutral-950 dark:even:bg-neutral-900"
                                        >
                                            <td className="border px-2 sm:px-3 py-2 text-center">
                                                {(page - 1) * pageSize + idx + 1}
                                            </td>
                                            <td className="border px-2 sm:px-3 py-2 text-center whitespace-normal break-words">
                                                {ucwords(a.asset_name ?? '—')}
                                            </td>
                                            <td className="border px-2 sm:px-3 py-2 text-center break-all">
                                                {a.serial_no ?? '—'}
                                            </td>
                                            <td className="border px-2 sm:px-3 py-2 text-center whitespace-normal break-words">
                                                {ucwords(a.asset_model?.category?.name ?? '—')}
                                            </td>
                                            <td className="border px-2 sm:px-3 py-2 text-center">
                                                <select
                                                    value={a.inventory_status}
                                                    onChange={(e) => updateStatus(a.id, e.target.value)}
                                                    className="rounded border px-1 sm:px-2 py-1 text-xs cursor-pointer w-full sm:w-auto"
                                                >
                                                    <option value="not_inventoried">Not Inventoried</option>
                                                    <option value="scheduled">Scheduled</option>
                                                    <option value="inventoried">Inventoried</option>
                                                    <option value="missing">Missing</option>
                                                </select>
                                            </td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                            </>
                                ) : (
                                    <p className="p-4 text-[11px] sm:text-sm text-center text-muted-foreground">
                                        No assets for this scope.
                                    </p>
                                )}
                        </div>
                    </div>
                    {/* Pagination */}
                            <div className="w-[320px] sm:w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 p-3 text-xs sm:text-sm">
                                <PageInfo page={page} total={total} pageSize={pageSize} label="assets" />
                                <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
                            </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ViewRowAssetModal;
