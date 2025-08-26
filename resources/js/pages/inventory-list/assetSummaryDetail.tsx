import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { Building2, Calendar, Package, Tag, Truck, Hash, type LucideIcon } from 'lucide-react';
import type { Asset } from './index';

// -------------------- HELPERS --------------------
const humanize = (value?: string | number | null): string =>
    !value || value === ''
        ? 'Not Available'
        : typeof value === 'number'
        ? value.toLocaleString()
        : value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const dateFormat = (dateStr?: string | null): string =>
    dateStr
        ? new Date(dateStr).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : 'Not Available';

// -------------------- COMPONENT --------------------
export default function PublicAssetSummary({ asset }: { asset: Asset }) {
    const InfoCard = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="mb-2 flex items-center gap-2">
                <Icon size={18} className="text-gray-500" />
                <p className="text-sm font-medium text-gray-500">{label}</p>
            </div>
            <p className="text-base font-semibold text-gray-900">{value}</p>
        </div>
    );

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
            <Head title="Asset Summary" />

            <div className="w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] p-10 text-center text-white relative">
                    {/* AUF Logo */}
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                        <img
                            src="https://www.auf.edu.ph/home/images/mascot/GEN.png"
                            alt="AUF Mascot"
                            className="h-16 w-auto opacity-95 drop-shadow-lg sm:h-20 md:h-24"
                        />
                    </div>

                    {asset.image_path ? (
                        <img
                            src={`/storage/${asset.image_path}`}
                            alt={asset.asset_name}
                            className="mx-auto max-h-48 w-auto rounded-lg bg-white object-contain p-2 shadow-lg sm:max-h-64"
                        />
                    ) : (
                        <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg bg-white/20 shadow-lg">
                            <Package size={48} className="text-white" />
                        </div>
                    )}

                    <h2 className="mt-4 text-2xl font-bold">{humanize(asset.asset_name)}</h2>
                    <p className="text-gray-200">
                        {humanize(asset.asset_model?.brand)} {humanize(asset.asset_model?.model)}
                    </p>
                </div>

                {/* Body */}
                <div className="bg-gray-50 p-10">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <InfoCard icon={Building2} label="Department / Unit" value={humanize(asset.unit_or_department?.name)} />
                        <InfoCard
                            icon={Tag}
                            label="Model / Brand"
                            value={`${humanize(asset.asset_model?.model)} / ${humanize(asset.asset_model?.brand)}`}
                        />
                        <InfoCard icon={Calendar} label="Date Purchased" value={dateFormat(asset.date_purchased)} />
                        <InfoCard icon={Truck} label="Supplier" value={humanize(asset.supplier)} />
                    </div>

{/* 🔹 Serial Number Card (full width) */}
<div className="mt-8">
  <div className="flex w-full flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md text-center">
    <div className="mb-2 flex items-center gap-2">
      <Hash size={18} className="text-gray-500" />
      <span className="text-sm font-medium text-gray-500">Serial Number</span>
    </div>
    <p className="text-xl font-bold text-gray-900">{humanize(asset.serial_no)}</p>
  </div>
</div>

                    {/* CTA Button */}
                    <div className="mt-10 flex justify-center">
                        <Button
                            className="rounded-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] px-8 py-3 font-semibold text-white shadow-md transition hover:from-[#2563eb] hover:to-[#1e40af]"
                            onClick={() => {
                                // Redirect to login with intended asset view
                                window.location.href =
                                    route('login') +
                                    '?redirect=' +
                                    encodeURIComponent(route('inventory-list.view', asset.id));
                            }}
                        >
                            View Full Details
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
