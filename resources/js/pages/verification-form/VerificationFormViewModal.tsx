import { useEffect } from "react";
import ViewModal from "@/components/modals/ViewModal";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ucwords } from "@/types/custom-index";

type AssetRecord = {
    id: number;
    asset_name: string;
    serial_no?: string;
    supplier?: string;
    unit_cost?: number;
    date_purchased?: string;
    description?: string;
    quantity?: number;
    condition?: string;
    asset_model?: { brand?: string; model?: string; category?: { name: string } };
};

type ViewingVerification = {
    id: number;
    unit_or_department?: { name?: string; code?: string } | null;
    requested_by_personnel?: { id: number; name: string; title?: string } | null;
    requested_by_snapshot?: { name?: string | null; title?: string | null; contact?: string | null } | null;
    status: string;
    notes?: string | null;
    remarks?: string | null;
    verified_at?: string | null;
    verified_by?: { id: number; name: string } | null;
    created_at?: string | null;
};

interface VerificationFormViewModalProps {
    open: boolean;
    onClose: () => void;
    viewing: ViewingVerification;
    pmoHead?: { id: number; name: string } | null;
}

const formatDate = (d?: string | null) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export default function VerificationFormViewModal({
    open,
    onClose,
    viewing,
    pmoHead,
}: VerificationFormViewModalProps) {
    const turnover = {
    id: viewing.id,
    document_date: viewing.created_at ?? "", // used only in a commented-out line
    type: "verification",
    status: viewing.status,
    issuing_office: viewing.unit_or_department ?? undefined,
    receiving_office: undefined,
    remarks: viewing.remarks ?? undefined,
    personnel: viewing.requested_by_personnel
      ? { name: viewing.requested_by_personnel.name }
      : undefined,
    turnover_disposal_assets: [] as { id: number; remarks?: string; assets: AssetRecord }[],
  };

  const verification = {
    id: viewing.id,
    status: viewing.status,
    notes: viewing.notes ?? undefined,
    remarks: viewing.remarks ?? undefined,
    verified_at: viewing.verified_at ?? undefined,
    verified_by: viewing.verified_by ?? undefined,
  };

  const pmo_head = pmoHead; // alias so JSX stays untouched

  const assets = turnover.turnover_disposal_assets ?? [];
  const recordNo = String(turnover.id).padStart(3, "0");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

    return (
        <ViewModal
            open={open}
            onClose={onClose}
            size="xl"
            contentClassName="relative min-h-[55vh] max-h-[65vh] overflow-y-auto print:overflow-x-hidden bg-white text-black"
        >
            <VisuallyHidden>
                <DialogTitle>Verification Form #{recordNo}</DialogTitle>
            </VisuallyHidden>

            <div className="flex items-start justify-between">
                <img
                    src="https://www.auf.edu.ph/home/images/mascot/GEN.png"
                    alt="AUF Logo"
                    className="h-20 w-auto"
                />

                <div className="text-center flex-1">
                    <h1 className="font-bold text-lg uppercase">
                        Angeles University Foundation
                    </h1>
                    <p className="text-sm leading-tight italic">Angeles City</p>
                    <p className="font-semibold text-sm uppercase">
                        Property Management Office
                    </p>
                    <h2 className="mt-2 text-lg font-bold uppercase mt-6">
                        Verification Form
                    </h2>
                </div>

                <div className="text-right text-sm leading-tight font-bold mr-2">
                    <p>VF No. A-014</p>
                </div>
            </div>

            <div className="mt-3 text-sm">
                <div className="flex justify-between">
                    <p>
                        <span className="font-semibold">AY: 2025–2026</span>
                    </p>
                    {/* <p>
                        <span className="font-semibold">Date:</span>{" "}
                        {formatDate(turnover.document_date)}
                    </p> */}
                </div>
                <p className="mt-1 font-bold">
                    <span className="mr-3">REQUESTER:</span>{" "}
                    {turnover.issuing_office?.name || "—"}
                </p>
            </div>

            <div className="mt-3 border border-black rounded-sm overflow-hidden">
                <table className="w-full text-xs border-collapse">
                    <thead className="bg-gray-100 border-b border-black">
                        <tr className="text-center font-semibold">
                            <th className="border-r border-black px-2 py-1 w-[15%]">
                                DATE ACQUIRED
                            </th>
                            <th className="border-r border-black px-2 py-1 w-[40%]">
                                DESCRIPTION OF ITEM/S
                            </th>
                            <th className="border-r border-black px-2 py-1 w-[10%]">PRICE</th>
                            <th className="border-r border-black px-2 py-1 w-[10%]">
                                SUPPLIER
                            </th>
                            <th className="border-r border-black px-2 py-1 w-[5%]">QTY</th>
                            <th className="px-2 py-1 w-[20%]">REMARKS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.length > 0 ? (
                            assets.map((a) => {
                                const asset = a.assets;
                                return (
                                <tr key={a.id} className="border-t border-black align-center">
                                    <td className="border-r border-black px-2 py-1 text-center">
                                        {formatDate(asset.date_purchased)}
                                    </td>
                                    <td className="border-r border-black px-2 py-1 text-left">
                                        <div className="font-semibold text-sm mb-3">
                                            {asset.asset_name}{" "}

                                            {asset.serial_no && (
                                                <span className="text-xs font-bold">
                                                    sn: {asset.serial_no}
                                                </span>
                                            )}
                                        </div>
                                        {asset.asset_model?.brand || asset.asset_model?.model ? (
                                            <div className="text-xs mb-3">
                                                {asset.asset_model?.brand} {asset.asset_model?.model}
                                            </div>
                                        ) : null}

                                        {verification?.notes && (
                                            <div className="text-xs italic text-gray-700">
                                                *{verification.notes}*
                                            </div>
                                        )}
                                    </td>
                                    <td className="border-r border-black px-2 py-1 text-center">
                                        {asset.unit_cost ? `₱${asset.unit_cost}` : "—"}
                                    </td>
                                    <td className="border-r border-black px-2 py-1 text-center">
                                        {asset.supplier || "—"}
                                    </td>
                                    <td className="border-r border-black px-2 py-1 text-center">
                                        {asset.quantity ?? 1}
                                    </td>
                                    <td className="px-2 py-1 text-center whitespace-pre-line">
                                        {ucwords(verification?.remarks || "—")}
                                    </td>
                                </tr>
                                );
                            })
                        ) : (
                        <tr>
                            <td
                            colSpan={6}
                            className="text-center py-6 text-gray-600 italic"
                            >
                            No items found for this verification form.
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
                {/* Left: Prepared By */}
                <div>
                    <p className="mb-8">Prepared by:</p>
                    <div className="border-t border-black w-56 mt-6" />

                    <p className="font-semibold mt-1">
                        {(pmo_head?.name)?.toUpperCase() || "—"}
                    </p>
                    <p className="text-xs italic">Head, PMO</p>
                </div>

                <div>
                    <p className="mb-8">Received copy by:</p>
                    <div className="border-t border-black w-56 mt-6" />
                    {/* <p className="text-xs italic mt-1">Signature / Name</p> */}
                </div>
            </div>

            <div className="sticky bottom-0 left-0 bg-white text-center mt-4 -mb-2print:hidden">
                <a
                    onClick={onClose}
                    className="mr-2 inline-block cursor-pointer rounded bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-black/70"
                >
                    ← Back to Verification List
                </a>
                <Button
                    onClick={() =>
                        window.open(route('verification-form.export-pdf', verification?.id), '_blank')
                    }
                    className="inline-block cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 focus-visible:ring focus-visible:ring-blue-500/50"
                >
                    🖨️ Print Verification Form
                </Button>
            </div>
        </ViewModal>
    );
}
