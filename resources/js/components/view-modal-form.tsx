import type { Asset } from '@/pages/inventory-list/index';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Package,
  Info,
  CreditCard,
  Home,
  ShieldCheck,

} from 'lucide-react';

// -------------------- HELPERS --------------------
const humanize = (value?: string | number | null): string =>
  !value || value === ''
    ? 'Not Available'
    : typeof value === 'number'
    ? value.toLocaleString()
    : value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const currencyFormat = (amount?: string | number | null): string => {
  if (!amount) return 'Not Available';
  const num = Number(amount);
  return isNaN(num)
    ? 'Not Available'
    : `₱ ${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
};

const dateFormat = (dateStr?: string | null): string =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not Available';

const StatusBadge = ({ status }: { status?: string | null }) => {
  let color = 'bg-gray-200 text-gray-700';
  if (status?.toLowerCase() === 'active') color = 'bg-green-100 text-green-700';
  if (status?.toLowerCase() === 'inactive') color = 'bg-red-100 text-red-700';
  if (status?.toLowerCase().includes('pending'))
    color = 'bg-yellow-100 text-yellow-700';
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {humanize(status)}
    </span>
  );
};

// -------------------- COMPONENT --------------------
export const ViewAssetModal = ({ asset, onClose }: { asset: Asset; onClose: () => void }) => {
  const totalCost =
    asset.unit_cost && asset.quantity
      ? Number(asset.unit_cost) * Number(asset.quantity)
      : null;

  const InfoCard = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col rounded-xl bg-white border border-gray-200 shadow-sm p-4 hover:shadow-md transition">
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="animate-in fade-in-50 zoom-in-95 w-full sm:max-w-[1100px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0 bg-gray-50">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#1e3999] to-[#162b73] text-white p-10 rounded-t-2xl text-center">
          {asset.image_path ? (
            <img
              src={`/storage/${asset.image_path}`}
              alt={asset.asset_name}
              className="max-h-48 sm:max-h-64 w-auto rounded-lg object-contain shadow-lg mx-auto"
            />
          ) : (
            <div className="max-h-48 sm:max-h-64 w-48 flex items-center justify-center rounded-lg bg-white/20 shadow-lg mx-auto">
              <Package size={48} className="text-white" />
            </div>
          )}

          <h2 className="mt-4 text-2xl font-bold">{humanize(asset.asset_name)}</h2>
          <p className="text-gray-200">
            {humanize(asset.asset_model?.brand)} {humanize(asset.asset_model?.model)}
          </p>
          <div className="mt-2">
            <StatusBadge status={asset.status} />
          </div>
        </div>

        {/* Body */}
        <div className="p-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* General Info */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1e3999] border-b pb-2 mb-4">
                <Info size={18} /> General Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard label="Type" value={humanize(asset.asset_type)} />
                <InfoCard label="Category" value={humanize(asset.asset_model?.category?.name ?? asset.category?.name)} />
                <InfoCard label="Brand" value={humanize(asset.asset_model?.brand)} />
                <InfoCard label="Model" value={humanize(asset.asset_model?.model)} />
                <InfoCard label="Serial Number" value={humanize(asset.serial_no)} />
                <InfoCard label="Description" value={humanize(asset.description)} />
              </div>
            </div>

            {/* Financial */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-green-700 border-b pb-2 mb-4">
                <CreditCard size={18} /> Financial
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard label="Quantity" value={humanize(asset.quantity)} />
                <InfoCard label="Unit Cost" value={currencyFormat(asset.unit_cost)} />
                <InfoCard label="Total Cost" value={currencyFormat(totalCost) || '—'} />
                <InfoCard label="Supplier" value={humanize(asset.supplier)} />
                <InfoCard label="Memorandum No." value={humanize(asset.memorandum_no)} />
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-purple-700 border-b pb-2 mb-4">
                <Home size={18} /> Location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard label="Building" value={humanize(asset.building?.name)} />
                <InfoCard label="Room" value={humanize(asset.building_room?.room)} />
                <InfoCard label="Unit / Department" value={humanize(asset.unit_or_department?.name)} />
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-orange-600 border-b pb-2 mb-4">
                <ShieldCheck size={18} /> Status
              </h3>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <InfoCard label="Transfer Status" value={humanize(asset.transfer_status)} />
  <InfoCard label="Status" value={asset.status === 'active' ? 'Active' : 'Archived'} />
  <InfoCard label="Date Purchased" value={dateFormat(asset.date_purchased)} />
</div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-gray-100 px-10 py-6 rounded-b-2xl flex flex-wrap gap-3 justify-between">
          <DialogClose asChild>
            <Button className="bg-[#1e3999] text-white hover:bg-[#162b73] shadow-md">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
