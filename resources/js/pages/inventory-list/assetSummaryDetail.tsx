import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { Building2, Calendar, Package, Tag, Truck, type LucideIcon } from 'lucide-react';
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
                <div className="bg-gradient-to-r from-[#1e3999] to-[#162b73] p-10 text-center text-white">
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

                    {/* CTA Button */}
                    <div className="mt-10">
                        <Button
                            className="w-full rounded-lg bg-[#1e3999] py-3 text-base font-medium shadow-md hover:bg-[#162b73]"
                            onClick={() => {
                                // Redirect to login with intended asset view
                                window.location.href = route('login') + '?redirect=' + encodeURIComponent(route('inventory-list.view', asset.id));
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
