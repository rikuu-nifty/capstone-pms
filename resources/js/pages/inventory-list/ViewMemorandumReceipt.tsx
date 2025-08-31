import { Button } from '@/components/ui/button';
import ViewModal from '@/components/modals/ViewModal';

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
  assets: AssetForReceipt[];   // ✅ array of assets
  memo_no: string | number;    // ✅ shared memo number
};

const peso = (v: number | string | undefined) => {
  const n = Number(v || 0);
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);
  } catch {
    return `₱ ${n.toFixed(2)}`;
  }
};

export function ViewMemorandumReceiptModal({ open, onClose, assets, memo_no }: Props) {
  if (!assets || assets.length === 0) return null;

  // Aggregate totals
  const totalQty = assets.reduce((sum, a) => sum + Number(a.quantity || 0), 0);
  const totalCost = assets.reduce((sum, a) => sum + Number(a.quantity || 0) * Number(a.unit_cost || 0), 0);

  // Use requester/location/date from first asset
  const first = assets[0];
  const reqLocation =
    first.building_room?.room
      ? `Room ${first.building_room.room}${first.building?.name ? ` – ${first.building.name}` : ''}`
      : first.building?.name || '—';

  const memoNo = String(memo_no ?? '').trim() || '—';

  const formattedDate = first.date_purchased
    ? new Date(first.date_purchased).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
    : '—';

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
        {first.unit_or_department
          ? `${first.unit_or_department.name}${first.unit_or_department.code ? ` (${first.unit_or_department.code})` : ''}`
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
            {assets.map((a, i) => {
              const itemTotal = Number(a.quantity || 0) * Number(a.unit_cost || 0);
              return (
                <tr key={a.id} className="divide-x divide-black align-top">
                  {/* Description & Brand */}
                  <td className="px-3 py-3">
                    <div className="font-medium">{a.asset_name || '—'}</div>
                    <div className="text-xs text-gray-700">
                      {a.asset_model?.brand ?? '—'} {a.asset_model?.model ? `• ${a.asset_model.model}` : ''}
                    </div>
                  </td>

                  {/* QTY */}
                  <td className="px-3 py-3 text-center">{a.quantity || '—'}</td>

                  {/* Total Cost */}
                  <td className="px-3 py-3 text-right font-semibold">{peso(itemTotal)}</td>

                 
               {/* Remarks block */}
{/* Remarks block */}
{/* Remarks block */}
<td className="px-0 py-0 align-top">
  <table className="w-full text-sm border-collapse">
    <tbody>
      <tr className="border-b border-black">
        <td className="w-[7rem] bg-gray-100 px-3 py-2">Supplier</td>
        <td className="px-3 py-2">{a.supplier || '—'}</td>
      </tr>
      <tr className="border-b border-black">
        <td className="bg-gray-100 px-3 py-2">Serial no./s</td>
        <td className="px-3 py-2">{a.serial_no || '—'}</td>
      </tr>
      <tr className={i !== assets.length - 1 ? "border-b border-black" : ""}>
        <td className="bg-gray-100 px-3 py-2">Model</td>
        <td className="px-3 py-2">{a.asset_model?.model || '—'}</td>
      </tr>
    </tbody>
  </table>
</td>








                </tr>
              );
            })}

            {/* Date + Totals row */}
            <tr className="border-t border-black">
              <td colSpan={4} className="px-3 py-2">
                <span className="font-semibold">Date purchased:</span>{' '}
                <span className="font-medium">{formattedDate}</span>
                <span className="float-right font-semibold">
                  Total Qty: {totalQty} &nbsp; | &nbsp; Grand Total: {peso(totalCost)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

  <div className="mt-2 text-xs">
  ({totalQty}) Received {totalQty > 1 ? 'above items' : 'the above item'} from Property Management Office in good order.
</div>

<div className="mt-5 grid grid-cols-2 gap-12 text-sm">
  {/* Prepared By */}
  <div className="flex items-start gap-6">
    <div>
      <div className="h-[1.25rem] w-[160px] border-b border-black" />
      <div className="mt-1 text-xs">Prepared by:</div>
      <div className="text-sm font-medium">Property Clerk</div>
    </div>
    <div>
      <div className="h-[1.25rem] w-[100px] border-b border-black" />
      <div className="mt-1 text-xs">Date</div>
    </div>
  </div>

  {/* Noted By */}
  <div className="flex items-start gap-6">
    <div>
      <div className="h-[1.25rem] w-[160px] border-b border-black" />
      <div className="mt-1 text-xs">Noted by:</div>
      <div className="text-sm font-medium">PMO Head</div>
    </div>
    <div>
      <div className="h-[1.25rem] w-[100px] border-b border-black" />
      <div className="mt-1 text-xs">Date</div>
    </div>
  </div>
</div>

{/* Signature Section */}
<div className="mt-6 grid grid-cols-2 gap-12 text-sm">
  <div className="flex items-start gap-6">
    <div>
      <div className="h-[1.25rem] w-[180px] border-b border-black" />
      <div className="mt-1 text-xs">Signature over Printed name</div>
    </div>
    <div>
      <div className="h-[1.25rem] w-[100px] border-b border-black" />
      <div className="mt-1 text-xs">Date</div>
    </div>
  </div>
</div>


      <div className="mt-8 text-center print:hidden">
        <a
          onClick={onClose}
          className="cursor-pointer inline-block rounded bg-black px-4 py-2 font-semibold text-white mr-2"
        >
          ← Back to Inventory List
        </a>
        <Button onClick={() => window.print()} className="cursor-pointer">
          🖨️ Print Form
        </Button>
      </div>

      <div className="mt-6 text-[10px] text-gray-600 print:text-[10px]">
        AUF-FORM-AS/PMO-41 • Oct.01, 2014 • Rev.0
      </div>
    </ViewModal>
  );
}
