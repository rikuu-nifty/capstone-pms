import { Button } from '@/components/ui/button';
import ViewModal from '@/components/modals/ViewModal';
// import { formatCurrency } from '@/lib/currency'; // if you don’t have this, see inline fallback below

type Nullable<T> = T | null | undefined;

type AssetForReceipt = {
    id: number;
    memorandum_no: number | string;
    asset_name: string;

    asset_model: Nullable<{ brand?: string; model?: string }>;

    quantity: number | string;
    unit_cost: number | string;

    supplier?: string | null;
    serial_no?: string | null;
    date_purchased?: string | null;

    created_at?: string | null;

    building?: Nullable<{ code?: string | number; name?: string }>;
    building_room?: Nullable<{ room?: string | number; building?: { code?: string | number; name?: string } }>;
    unit_or_department?: Nullable<{ name?: string; code?: string | number }>;
};

type Props = {
    open: boolean;
    onClose: () => void;
    asset: AssetForReceipt;
};

const peso = (v: number | string | undefined) => {
    const n = Number(v || 0);
    try {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);
    } catch {
        return `₱ ${n.toFixed(2)}`;
    }
};

export default function ViewMemorandumReceiptModal({ open, onClose, asset }: Props) {
    const qty = Number(asset.quantity || 0);
    const cost = Number(asset.unit_cost || 0);
    const total = qty * cost;

    const campusHeaderLeft = (
        <div className="flex items-center gap-3">
        <img
            src="https://www.auf.edu.ph/images/auf-logo.png"
            alt="AUF"
            className="h-14 w-14 object-contain"
        />
        <div className="leading-tight">
            <div className="font-semibold">ANGELES UNIVERSITY FOUNDATION</div>
            <div className="text-sm">Angeles City</div>
            <div className="text-sm">PROPERTY MANAGEMENT OFFICE</div>
        </div>
        </div>
    );

    const reqLocation =
        asset.building_room?.room
        ? `Room ${asset.building_room.room}${asset.building?.name ? ` – ${asset.building.name}` : ''}`
        : asset.building?.name || '—';

    const memoNo = String(asset.memorandum_no ?? '').trim() || '—';

    const formattedDate =
        asset.date_purchased
        ? new Date(asset.date_purchased).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
        : '—';

    return (
        <ViewModal
            open={open}
            onClose={onClose}
            size="xl"
            contentClassName="relative max-h-[85vh] overflow-y-auto print:overflow-visible"
        >
        <div className="grid grid-cols-[1fr_auto] items-start gap-4">
            {campusHeaderLeft}

            <div className="justify-self-end text-right">
                <div className="text-sm tracking-wide">M. R. No.</div>
                <div className="mt-1 inline-block min-w-[140px] rounded border border-black px-3 py-1 text-base font-semibold tracking-widest">
                    {memoNo}
                </div>
            </div>
        </div>

        <h1 className="mt-3 text-center text-xl font-bold underline">MEMORANDUM RECEIPT</h1>

        <div className="mt-4 text-sm">
            <span className="font-semibold">Requester:</span>{' '}
            {asset.unit_or_department
            ? `${asset.unit_or_department.name}${asset.unit_or_department.code ? ` (${asset.unit_or_department.code})` : ''}`
            : '—'}
            {reqLocation ? ` – ${reqLocation}` : ''}
        </div>

        <div className="mt-3 overflow-hidden rounded-md border border-black">
            <table className="w-full text-sm">
                <thead className="bg-gray-100">
                    <tr className="divide-x divide-black border-b border-black">
                    <th className="px-3 py-2 text-left w-[40%]">Description of item/s, Brand</th>
                    <th className="px-3 py-2 text-center w-[6rem]">QTY</th>
                    <th className="px-3 py-2 text-right w-[10rem]">Total cost</th>
                    <th className="px-3 py-2 text-left">REMARKS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="divide-x divide-black align-top">
                    {/* Description & Brand */}
                    <td className="px-3 py-3">
                        <div className="font-medium">{asset.asset_name || '—'}</div>
                        <div className="text-xs text-gray-700">
                        {asset.asset_model?.brand ? `${asset.asset_model.brand}` : '—'}
                        {asset.asset_model?.model ? ` • ${asset.asset_model.model}` : ''}
                        </div>
                    </td>

                    {/* QTY */}
                    <td className="px-3 py-3 text-center">{qty || '—'}</td>

                    {/* Total Cost */}
                    <td className="px-3 py-3 text-right font-semibold">
                        {peso(total)}
                    </td>

                    {/* Remarks block as a small nested table like the sample */}
                    <td className="px-0 py-0">
                        <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-black">
                            <td className="w-[7rem] bg-gray-100 px-3 py-2">Supplier</td>
                            <td className="px-3 py-2">{asset.supplier || '—'}</td>
                            </tr>
                            <tr className="border-b border-black">
                            <td className="bg-gray-100 px-3 py-2">Serial no./s</td>
                            <td className="px-3 py-2">{asset.serial_no || '—'}</td>
                            </tr>
                            <tr>
                            <td className="bg-gray-100 px-3 py-2">Model</td>
                            <td className="px-3 py-2">{asset.asset_model?.model || '—'}</td>
                            </tr>
                        </tbody>
                        </table>
                    </td>
                    </tr>

                    {/* Date Purchased row across table like the sample */}
                    <tr className="border-t border-black">
                    <td colSpan={4} className="px-3 py-2">
                        <span className="font-semibold">Date purchased:</span>{' '}
                        <span className="font-medium">{formattedDate}</span>
                        <span className="float-right font-semibold">
                        {peso(total)}
                        </span>
                    </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div className="mt-2 text-xs">
            (1) Received above items from Property Management Office in good order.
        </div>

        <div className="mt-5 grid grid-cols-2 gap-8 text-sm">
            <div>
                <div className="mb-6">
                    <div className="h-[1.75rem] border-b border-black w-[260px]" />
                    <div className="mt-1 text-xs">Prepared by:</div>
                    <div className="text-sm font-medium">Property Clerk</div>
                </div>
                <div className="text-xs">Date: ____________</div>
            </div>

            <div>
                <div className="mb-6">
                    <div className="h-[1.75rem] border-b border-black w-[260px]" />
                    <div className="mt-1 text-xs">Noted by:</div>
                    <div className="text-sm font-medium">PMO Head</div>
                </div>
                <div className="text-xs">Date: ____________</div>
            </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-8 text-sm">
            <div>
                <div className="h-[1.75rem] border-b border-black w-[260px]" />
                    <div className="mt-1 text-xs">Signature over Printed name</div>
                </div>
            <div className="text-xs self-end">Date: ____________</div>
        </div>

        <div className="mt-8 text-center print:hidden">
            <a onClick={onClose} className="cursor-pointer inline-block rounded bg-black px-4 py-2 font-semibold text-white mr-2">
                ← Back to Inventory List
            </a>
                <Button onClick={() => window.print()} className="cursor-pointer">
                🖨️ Print Form
            </Button>
        </div>

        <div className="mt-6 text-[10px] text-gray-600 print:text-[10px]">
            AUF-FORM-AS/PMO-41 •{' '}
        {asset.created_at
            ? new Date(asset.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
            : '—'} • Rev.0
        </div>
        </ViewModal>
    );
}