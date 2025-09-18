import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AssetRow } from './InventorySheetReport';
import { formatDate, formatEnums, formatCurrency } from '@/types/custom-index';

type Props = {
    assets: (AssetRow & {
        memorandum_no?: string | null;
        supplier?: string | null;
        date_purchased?: string | null;
        unit_cost?: number | null;
        inventoried_at?: string | null; // from inventory_scheduling_assets
    })[];
};

export default function InventorySheetTable({ assets }: Props) {
    if (!assets || assets.length === 0) {
        return (
        <div className="flex h-full w-full flex-col items-center justify-center text-gray-500">
            <p className="text-lg font-semibold">No Data Available</p>
            <p className="text-sm">Try adjusting your filters to see results.</p>
        </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto rounded-md border">
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead className="w-[100px] text-center">Code No.</TableHead>
                        <TableHead className="w-[180px] text-center">Asset Name</TableHead>
                        <TableHead className="w-[120px] text-center">Price</TableHead>
                        <TableHead className="w-[150px] text-center">Supplier</TableHead>
                        <TableHead className="w-[150px] text-center">Date Purchased</TableHead>
                        <TableHead className="w-[90px] text-center">Per Record</TableHead>
                        <TableHead className="w-[90px] text-center">Actual</TableHead>
                        <TableHead className="w-[150px] text-center">Inventory Status</TableHead>
                        <TableHead className="w-[150px] text-center">Date of Count</TableHead>
                        <TableHead className="w-[180px] text-center">Remarks</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assets.map((asset) => (
                        <TableRow 
                            key={asset.id}
                            className='text-center'
                        >
                            <TableCell>{asset.memorandum_no || '—'}</TableCell>
                            <TableCell>
                                <div>
                                    <p className="font-medium">{asset.asset_name}</p>
                                    <p className="text-xs text-gray-500">{asset.asset_type}</p>
                                    {asset.serial_no && (
                                        <p className="text-xs text-blue-600 font-medium">SN: {asset.serial_no}</p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{asset.unit_cost ? formatCurrency(asset.unit_cost) : '—'}</TableCell>
                            <TableCell>{asset.supplier || '—'}</TableCell>
                            <TableCell>
                                {asset.date_purchased ? formatDate(asset.date_purchased) : '—'}
                            </TableCell>
                            <TableCell className="text-center">1</TableCell>
                            <TableCell className="text-center">{asset.quantity}</TableCell>
                            <TableCell>
                                <span
                                    className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                                        asset.inventory_status === 'inventoried'
                                        ? 'bg-green-100 text-green-700'
                                        : asset.inventory_status === 'scheduled'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                                    >
                                    {formatEnums(asset.inventory_status)}
                                </span>
                            </TableCell>
                            <TableCell>
                                {asset.inventoried_at ? formatDate(asset.inventoried_at) : '—'}
                            </TableCell>
                            <TableCell className="whitespace-normal break-words text-center">
                                {asset.status}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
