import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import type { Asset } from '@/pages/inventory-list/index';
import { ucwords } from '@/types/custom-index';
import { CreditCard, Home, Info, Package, ShieldCheck } from 'lucide-react';

// -------------------- HELPERS --------------------
const humanize = (value?: string | number | null): string =>
    !value || value === ''
        ? '-'
        : typeof value === 'number'
          ? value.toLocaleString()
          : value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const currencyFormat = (amount?: string | number | null): string => {
    if (!amount) return '-';
    const num = Number(amount);
    return isNaN(num) ? '-' : `₱ ${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
};

const dateFormat = (dateStr?: string | null): string =>
    dateStr
        ? new Date(dateStr).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '-';

const StatusBadge = ({ status }: { status?: string | null }) => {
    let color = 'bg-gray-200 text-gray-700';
    if (status?.toLowerCase() === 'active') color = 'bg-green-100 text-green-700';
    if (status?.toLowerCase() === 'inactive') color = 'bg-red-100 text-red-700';
    if (status?.toLowerCase().includes('pending')) color = 'bg-yellow-100 text-yellow-700';

    return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>{humanize(status)}</span>;
};

// -------------------- COMPONENT --------------------
export const ViewAssetModal = ({ asset, onClose }: { asset: Asset; onClose: () => void }) => {
    const totalCost = asset.unit_cost && asset.quantity ? Number(asset.unit_cost) * Number(asset.quantity) : null;

    const InfoCard = ({ label, value }: { label: string; value: string }) => (
        <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">{label}</p>
            <p className="text-base font-semibold text-gray-900">{value}</p>
        </div>
    );

    return (
        // <Dialog open onOpenChange={(open) => !open && onClose()}>
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                    history.back(); // go back when modal closes
                }
            }}
        >
            <DialogContent
                aria-describedby={undefined}
                className="max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-gray-50 p-0 shadow-2xl animate-in fade-in-50 zoom-in-95 sm:max-w-[1100px]"
            >
                <DialogTitle className="sr-only">View Asset Details</DialogTitle>
                
                {/* Hero Section */}
                <div className="relative rounded-t-2xl bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] p-10 text-white">
                    {/* AUF Mascot Logo (left side) */}
                    <div className="absolute top-6 left-6">
                        <img
                            src="https://www.auf.edu.ph/home/images/mascot/GEN.png"
                            alt="AUF Mascot"
                            className="h-20 w-auto opacity-95 drop-shadow-lg sm:h-30"
                        />
                    </div>

                    {/* Asset Image */}
                    {asset.image_path ? (
                        <div className="mx-auto mb-6 max-w-[280px]">
                            <img
                                src={`/storage/${asset.image_path}`}
                                alt={asset.asset_name}
                                className="mx-auto max-h-64 w-auto rounded-xl object-cover shadow-lg sm:max-h-72"
                            />
                        </div>
                    ) : (
                        <div className="mx-auto mb-6 flex h-48 w-48 items-center justify-center rounded-lg bg-white/20 shadow-lg">
                            <Package size={56} className="text-white" />
                        </div>
                    )}

                    {/* Asset Name + Subtitle */}
                    <h2 className="text-center text-3xl font-bold">{humanize(asset.asset_name)}</h2>
                    <p className="mt-1 text-center text-sm text-gray-200">
                        {humanize(asset.asset_model?.brand)} {humanize(asset.asset_model?.model)}
                    </p>
                    <div className="mt-3 flex justify-center">
                        <StatusBadge status={asset.status} />
                    </div>
                </div>

                {/* Body */}
                <div className="space-y-10 p-10">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* General Info */}
                        <div>
                            <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-semibold text-blue-700">
                                <Info size={18} /> General Information
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* <InfoCard label="Type" value={humanize(asset.asset_type)} /> */}
                                <InfoCard
                                    label="Equipment Code"
                                    value={
                                        asset.asset_model?.equipment_code
                                        ? `${ucwords(asset.asset_model.equipment_code.description ?? '')} [${asset.asset_model.equipment_code.code}]`
                                        : humanize(asset.asset_type)
                                    }
                                />

                                <InfoCard label="Category" value={humanize(asset.asset_model?.category?.name ?? asset.category?.name)} />
                                <InfoCard label="Brand" value={humanize(asset.asset_model?.brand)} />
                                <InfoCard label="Model" value={humanize(asset.asset_model?.model)} />
                                <InfoCard label="Serial Number" value={humanize(asset.serial_no)} />
                                <InfoCard label="Description" value={humanize(asset.description)} />
                            </div>
                        </div>

                        {/* Financial */}
                        <div>
                            <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-semibold text-green-700">
                                <CreditCard size={18} /> Financial
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <InfoCard label="Quantity" value={humanize(asset.quantity)} />
                                <InfoCard label="Unit Cost" value={currencyFormat(asset.unit_cost)} />
                                <InfoCard label="Depreciation Value (per year)" value={currencyFormat(asset.depreciation_value)} /> {/* ✅ new */}
                                <InfoCard label="Total Cost" value={currencyFormat(totalCost) || '—'} />
                                <InfoCard label="Supplier" value={humanize(asset.supplier)} />
                                <InfoCard label="Memorandum No." value={humanize(asset.memorandum_no).replace(/,/g, '')} />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-semibold text-purple-700">
                                <Home size={18} /> Location
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <InfoCard label="Building" value={humanize(asset.building?.name)} />
                                {/* <InfoCard label="Room" value={humanize(asset.building_room?.room) } /> */}
                                <InfoCard
                                    label="Room"
                                    value={
                                        asset.building_room?.room
                                        ? `${humanize(asset.building_room?.room)}${
                                            asset.sub_area?.name ? ` (${humanize(asset.sub_area?.name)})` : ''
                                            }`
                                        : humanize(asset.sub_area?.name)
                                    }
                                />
                                <InfoCard label="Unit / Department" value={humanize(asset.unit_or_department?.name)} />
                                <InfoCard label="Personnel-in-Charge" value={asset.assigned_to_name ?? '—'} />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-semibold text-orange-600">
                                <ShieldCheck size={18} /> Status
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* ✅ Now pulling transfer.status via relation */}
                                {/* <InfoCard label="Transfer Status" value={humanize(asset.transfer?.status)} /> */}
                                <InfoCard label="Transfer Status" value={humanize(asset.current_transfer_status)} />
                                <InfoCard label="Inventory Status" value={humanize(asset.current_inventory_status)} />
                                <InfoCard
                                    label="Turnover/Disposal Status"
                                    value={humanize(asset.current_turnover_disposal_status) || '—'}
                                />
                                <InfoCard
                                    label="Off Campus Status"
                                    value={humanize(asset.current_off_campus_status) || '—'}
                                />
                                <InfoCard label="Status" value={asset.status === 'active' ? 'Active' : 'Archived'} />
                                <InfoCard label="Date Purchased" value={dateFormat(asset.date_purchased)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="flex justify-center rounded-b-2xl bg-gray-100 px-10 py-6">
                    <DialogClose asChild>
                        <Button className="cursor-pointer rounded-full bg-blue-600 px-6 py-2 text-white shadow-md hover:bg-blue-700">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
