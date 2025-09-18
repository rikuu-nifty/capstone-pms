import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AssetRow } from './InventorySheetReport';

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
            <TableHead className="w-[150px]">Date of Count</TableHead>
            <TableHead className="w-[120px]">Code No.</TableHead>
            <TableHead>Asset Name / Type</TableHead>
            <TableHead className="w-[120px]">Price</TableHead>
            <TableHead className="w-[150px]">Supplier</TableHead>
            <TableHead className="w-[150px]">Date Purchased</TableHead>
            <TableHead className="w-[100px] text-center">Per Record</TableHead>
            <TableHead className="w-[100px] text-center">Actual</TableHead>
            <TableHead className="w-[150px]">Inventory Status</TableHead>
            <TableHead className="w-[250px]">Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell>
                {asset.inventoried_at
                  ? new Date(asset.inventoried_at).toLocaleDateString()
                  : '—'}
              </TableCell>
              <TableCell>{asset.memorandum_no || '—'}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{asset.asset_name}</p>
                  <p className="text-xs text-gray-500">{asset.asset_type}</p>
                </div>
              </TableCell>
              <TableCell>
                {asset.unit_cost
                  ? `₱${asset.unit_cost.toLocaleString()}`
                  : '—'}
              </TableCell>
              <TableCell>{asset.supplier || '—'}</TableCell>
              <TableCell>
                {asset.date_purchased
                  ? new Date(asset.date_purchased).toLocaleDateString()
                  : '—'}
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
                  {asset.inventory_status}
                </span>
              </TableCell>
              <TableCell>{asset.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
