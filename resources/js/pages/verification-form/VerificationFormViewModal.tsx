import { useEffect } from "react";
import ViewModal from "@/components/modals/ViewModal";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer } from "lucide-react";
import { formatStatusLabel } from "@/types/custom-index";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type AssetRecord = {
    id: number;
    asset_name: string;
    serial_no?: string;
    supplier?: string;
    unit_cost?: number;
    description?: string;
    quantity?: number;
    condition?: string;
    asset_model?: { brand?: string; model?: string; category?: { name: string } };
};

interface VerificationFormViewModalProps {
    open: boolean;
    onClose: () => void;
    turnover: {
        id: number;
        document_date: string;
        type: string;
        status: string;
        issuing_office?: { name: string; code: string };
        receiving_office?: { name: string; code: string };
        remarks?: string;
        personnel?: { name: string };
        turnover_disposal_assets: {
            id: number;
            remarks?: string;
            assets: AssetRecord;
        }[];
        form_approval?: {
            steps: {
                id: number;
                label: string;
                status: string;
                actor?: { name: string };
                external_name?: string;
                external_title?: string;
            }[];
        };
    };
}

const formatDateLong = (dateString?: string) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

export default function VerificationFormViewModal({ open, onClose, turnover }: VerificationFormViewModalProps) {
    const assets = turnover.turnover_disposal_assets ?? [];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
        if (!open) return;
        // Prevent browser print shortcut from triggering accidentally
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
        contentClassName="relative max-h-[85vh] overflow-y-auto print:overflow-x-hidden"
        >
        <VisuallyHidden>
            <DialogTitle>Verification Form #{turnover.id}</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-xl font-bold">Verification Form</h1>
            <p className="text-sm text-muted-foreground">
                Cross-check of turnover record #{turnover.id}
            </p>
            </div>

            <Button
            onClick={() => window.print()}
            className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white"
            >
            <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
        </div>

        {/* Summary Info */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-lg bg-white mt-4">
            <div>
            <p className="text-xs text-gray-500">Record ID</p>
            <p className="font-semibold">{turnover.id}</p>
            </div>
            <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="font-semibold">{formatDateLong(turnover.document_date)}</p>
            </div>
            <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="font-semibold capitalize">{formatStatusLabel(turnover.status ?? "—")}</p>
            </div>
            <div>
            <p className="text-xs text-gray-500">Issuing Office</p>
            <p className="font-semibold">{turnover.issuing_office?.name ?? "—"}</p>
            </div>
            <div>
            <p className="text-xs text-gray-500">Receiving Office</p>
            <p className="font-semibold">{turnover.receiving_office?.name ?? "—"}</p>
            </div>
            <div>
            <p className="text-xs text-gray-500">Personnel in Charge</p>
            <p className="font-semibold">{turnover.personnel?.name ?? "—"}</p>
            </div>
        </div>

        {/* Assets Table */}
        <div className="rounded-lg border overflow-x-auto mt-4">
            <Table>
            <TableHeader>
                <TableRow className="bg-muted text-foreground">
                <TableHead className="text-center">#</TableHead>
                <TableHead className="text-center">Item Description</TableHead>
                <TableHead className="text-center">Model / Brand</TableHead>
                <TableHead className="text-center">Serial No.</TableHead>
                <TableHead className="text-center">Supplier</TableHead>
                <TableHead className="text-center">Unit Cost</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-center">Condition</TableHead>
                <TableHead className="text-center">Remarks</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="text-center">
                {assets.length > 0 ? (
                assets.map((a, i) => {
                    const asset = a.assets;
                    return (
                    <TableRow key={a.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{asset.asset_name}</TableCell>
                        <TableCell>
                        {asset.asset_model
                            ? `${asset.asset_model.brand ?? ""} ${asset.asset_model.model ?? ""}`
                            : "—"}
                        </TableCell>
                        <TableCell>{asset.serial_no ?? "—"}</TableCell>
                        <TableCell>{asset.supplier ?? "—"}</TableCell>
                        <TableCell>{asset.unit_cost ? `₱${asset.unit_cost.toLocaleString()}` : "—"}</TableCell>
                        <TableCell>{asset.quantity ?? 1}</TableCell>
                        <TableCell>{asset.condition ?? "Good"}</TableCell>
                        <TableCell>{a.remarks ?? "—"}</TableCell>
                    </TableRow>
                    );
                })
                ) : (
                <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No assets found in this turnover.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>

        {/* Remarks */}
        <div className="border rounded-lg p-4 bg-white mt-4">
            <h3 className="text-sm font-semibold mb-2">Remarks</h3>
            <p className="text-sm text-gray-700 italic">
            {turnover.remarks || "No remarks provided."}
            </p>
        </div>

        {/* Signatories */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t pt-6 mt-4">
            {turnover.form_approval?.steps?.map((s) => (
            <div key={s.id} className="text-center">
                <p className="font-semibold underline underline-offset-4">
                {s.external_name ?? s.actor?.name ?? "__________________________"}
                </p>
                <p className="text-xs text-gray-500">{s.external_title ?? s.label}</p>
                <p className="text-xs italic text-gray-400 mt-1">({formatStatusLabel(s.status)})</p>
            </div>
            ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-center gap-3 print:hidden">
            <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
            >
            Close
            </Button>
            <Button
            onClick={() => window.print()}
            className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white"
            >
            🖨️ Print Verification Form
            </Button>
        </div>
        </ViewModal>
    );
}
