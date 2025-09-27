import { Button } from '@/components/ui/button';
import ViewModal from '@/components/modals/ViewModal';
import type { AssetModelWithCounts } from '@/types/asset-model';

type InventoryListForModel = {
    id: number;
    asset_name?: string | null;
    serial_no?: string | null;
    supplier?: string | null;
};

interface ViewAssetModelProps {
    open: boolean;
    onClose: () => void;
    model: AssetModelWithCounts & { 
        assets?: InventoryListForModel[] 
    };
    assets?: InventoryListForModel[];
};

const StatusPill = ({ status }: { status?: string | null }) => {
    const s = (status ?? '').toLowerCase().replace(/_/g, ' ');
    const formatted = s
        ? s.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')
        : '—';

    const cls =
        s === 'active'
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        : 'bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300';

    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
        {formatted}
        </span>
    );
};

export default function ViewAssetModelModal({ 
    open, 
    onClose, 
    model, 
    assets 
}: ViewAssetModelProps) {
    const recordNo = String(model.id).padStart(2, '0');

    const rows: InventoryListForModel[] = assets ?? (model.assets ?? []);

    return (
        <ViewModal
            open={open}
            onClose={onClose}
            size="xl"
            contentClassName="relative max-h-[80vh] overflow-y-auto print:overflow-x-hidden"
        >
            <div className="relative flex items-center justify-between">
                <div className="flex items-center">
                <img
                    src="https://www.auf.edu.ph/home/images/mascot/GEN.png"
                    alt="Logo"
                    className="h-25 opacity-90"
                />
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 text-center">
                <h2 className="text-2xl font-bold tracking-wide uppercase print:text-lg">
                    Property Management Office
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">pmo@auf.edu.ph</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">+63 973 234 3456</p>
                </div>

                <div className="text-right text-sm leading-snug">
                <p>
                    <span className="text-gray-600 dark:text-gray-400">Record #:</span>{' '}
                    <span className="font-semibold">{recordNo}</span>
                </p>
                <p className="mt-1 flex items-center justify-end gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <StatusPill status={model.status} />
                </p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-12 print:grid-cols-2">
                {/* LEFT: Model Details */}
                <section>
                    <h3 className="mb-2 text-base font-semibold">Model Details</h3>
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                        <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <td className="w-1/3 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">ID</td>
                                <td className="px-3 py-2 font-medium">{model.id}</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">Category</td>
                                <td className="px-3 py-2 font-medium">{model.category?.name ?? '—'}</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                    Equipment Code
                                </td>
                                <td className="px-3 py-2 font-medium">
                                    {model.equipment_code
                                    ? `${model.equipment_code.code}${
                                        model.equipment_code.description
                                            ? ` - ${model.equipment_code.description}`
                                            : ''
                                        }`
                                    : '—'}
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">Brand</td>
                                <td className="px-3 py-2 font-medium">{model.brand ?? '—'}</td>
                            </tr>
                            <tr>
                                <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                    Model / Specification
                                </td>
                                <td className="px-3 py-2 font-medium">{model.model ?? '—'}</td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                </section>

                {/* RIGHT: Utilization */}
                <section className="md:text-right print:justify-self-end print:text-right">
                    <h3 className="mb-2 text-base font-semibold">Utilization</h3>
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 md:ml-auto md:w-[360px]">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="w-2/3 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Active Assets
                                    </td>
                                    <td className="px-3 py-2 font-semibold text-right md:text-right">
                                        {model.active_assets_count ?? 0}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">Total Assets</td>
                                    <td className="px-3 py-2 font-semibold text-right md:text-right">
                                        {model.assets_count ?? 0}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Assets Table */}
            <div className="mt-6 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm text-center">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-3 py-2 text-center font-medium">Serial No.</th>
                            <th className="px-3 py-2 text-center font-medium">Asset Name</th>
                            <th className="px-3 py-2 text-center font-medium">Supplier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((a) => (
                            <tr key={a.id} className="border-t">
                                <td className="px-3 py-2">{a.serial_no ?? '—'}</td>
                                <td className="px-3 py-2">{a.asset_name ?? '—'}</td>
                                
                                <td className="px-3 py-2">{a.supplier ?? '—'}</td>
                            </tr>
                        ))}
                            {!rows.length && (
                        <tr>
                            <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                                No assets for this model.
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Actions */}
            <div className="text-center print:hidden mt-6">
                <a
                    onClick={onClose}
                    className="cursor-pointer inline-block bg-black text-white px-4 py-2 mr-2 rounded shadow text-sm font-semibold hover:bg-black/70"
                >
                ← Back to Models
                </a>
                <Button
                    onClick={() => window.print()}
                    className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded shadow text-sm font-semibold hover:bg-blue-500 focus-visible:ring focus-visible:ring-blue-500/50"
                >
                    🖨️ Print Form
                </Button>
            </div>
        </ViewModal>
    );
}