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
    quantity?: number;
};

type VerificationAsset = {
    id: number;
    remarks?: string;
    asset: AssetRecord;
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
    verification_assets?: VerificationAsset[];
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

const todayDate = new Date().toLocaleDateString("en-US");

export default function VerificationFormViewModal({
    open,
    onClose,
    viewing,
    pmoHead,
}: VerificationFormViewModalProps) {
    const recordNo = String(viewing.id).padStart(3, "0");
    const assets = viewing.verification_assets ?? [];

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

        {/* Header */}
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
            <p>VF No. A-{recordNo}</p>
            </div>
        </div>

        {/* Requester info */}
        <div className="mt-3 text-sm">
            <div className="flex justify-between">
            <p>
                <span className="font-semibold">AY: 2025–2026</span>
            </p>
            </div>
            <p className="mt-1 font-bold">
            <span className="mr-3">REQUESTER:</span>{" "}
            {/* {viewing.requested_by_personnel?.name ||
                viewing.requested_by_snapshot?.name ||
                viewing.unit_or_department?.name ||
                "—"} */}
                {viewing.unit_or_department?.name}
            </p>
        </div>

        {/* Table */}
        <div className="mt-3 border border-black rounded-sm overflow-hidden">
            <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-100 border-b border-black">
                    <tr className="text-center font-semibold">
                        <th className="border-r border-black px-2 py-1 w-[15%]">
                            DATE ACQUIRED
                        </th>
                        <th className="border-r border-black px-2 py-1 w-[30%]">
                            DESCRIPTION OF ITEM/S
                        </th>
                        <th className="border-r border-black px-2 py-1 w-[10%]">PRICE</th>
                        <th className="border-r border-black px-2 py-1 w-[10%]">
                            SUPPLIER
                        </th>
                        <th className="border-r border-black px-2 py-1 w-[5%]">QTY</th>
                        <th className="px-2 py-1 w-[25%]">REMARKS</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.length > 0 ? (assets.map((a) => {
                        const asset = a.asset;
                        return (
                            <tr key={a.id} className="border-t border-black align-center">
                                <td className="border-r border-black px-2 py-1 text-center">
                                    {formatDate(asset.date_purchased)}
                                </td>
                                <td className="border-r border-black px-2 py-1 text-left">
                                    <div className="font-bold text-sm mb-3">
                                        {asset.asset_name}{" "}
                                        {asset.serial_no && (
                                            <span className="text-xs font-semibold ml-2">
                                                sn: {asset.serial_no}
                                            </span>
                                        )}
                                    </div>

                                    {viewing.notes && (
                                        <div className="text-xs italic text-gray-700">
                                            *{viewing.notes}*
                                        </div>
                                    )}

                                    <div className="font-semibold italic mt-4">
                                        {todayDate}
                                    </div>
                                </td>
                                <td className="border-r border-black px-2 py-1 text-center">
                                    {asset.unit_cost ? `₱ ${asset.unit_cost}` : "—"}
                                </td>
                                <td className="border-r border-black px-2 py-1 text-center">
                                    {asset.supplier || "—"}
                                </td>
                                <td className="border-r border-black px-2 py-1 text-center">
                                    {asset.quantity ?? 1}
                                </td>
                                <td className="px-2 py-1 text-center whitespace-pre-line">
                                    {ucwords(a.remarks || viewing.remarks || "—")}
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

        {/* <pre>{JSON.stringify(assets, null, 2)}</pre> */}

        {/* Signatories */}
        <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
            <div>
                <p className="mb-8">Prepared by:</p>
                <div className="border-t border-black w-56 mt-6" />
                <p className="font-semibold mt-1">
                    {(pmoHead?.name ?? "—").toUpperCase()}
                </p>
                <p className="text-xs italic">Head, PMO</p>
            </div>

            <div>
                <p className="mb-8">Received copy by:</p>
                <div className="border-t border-black w-56 mt-6" />
            </div>
        </div>

        {/* Footer buttons */}
        <div className="sticky bottom-0 left-0 bg-white text-center mt-4 -mb-2 print:hidden p-4">
            <a
                onClick={onClose}
                className="mr-2 inline-block cursor-pointer rounded bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-black/70"
            >
                ← Back to Verification List
            </a>
            <Button
            onClick={() =>
                window.open(route("verification-form.export-pdf", viewing.id), "_blank")
            }
            className="inline-block cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 focus-visible:ring focus-visible:ring-blue-500/50"
            >
            🖨️ Print Verification Form
            </Button>
        </div>
        </ViewModal>
    );
}
