import { TransferViewPageProps } from '@/types/page-props';
import { Head } from '@inertiajs/react';
import { badgeVariants } from "@/components/ui/badge";

export default function TransferView({ 
    transfer, 
    assets, 
}: TransferViewPageProps) {

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <>
            <Head title={`Transfer View – #${transfer.id}`} />

            <div className="min-h-screen bg-blue-100 pt-20 pb-10 px-4 flex justify-center items-start">
                <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl w-full border border-gray-300">
                    
                    <div className="flex justify-between items-start mb-2">
                        <img src="/logo.png" alt="Logo" className="h-12" />

                        <div className="text-right">
                            <p className="text-sm font-semibold">
                                Transfer Record #: <span className="text-base">{transfer.id.toString().padStart(2, '0')}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Status:</strong> {transfer.status}
                            </p>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-wide">Property Management Office</h2>
                        <p className="text-sm">pmo@auf.edu.ph</p>
                        <p className="text-sm">+63 973 234 3456</p>
                    </div>

                    <div className="flex justify-between gap-6 mb-8">
                        {/* Current Location - Left aligned */}
                        <div className="text-left w-1/2">
                            <h3 className="text-lg font-bold text-gray-600 mb-2">Current Location</h3>
                            <p className="text-sm text-gray-700 font-medium">
                                <strong>Building:</strong> {transfer.currentBuildingRoom?.building?.code}
                            </p>
                            <p className="text-sm text-gray-700 font-medium">
                                <strong>Room:</strong> {transfer.currentBuildingRoom?.room}
                            </p>
                            <p className="text-sm text-gray-700 font-medium">
                                <strong>Unit/Dept/Lab:</strong> {transfer.currentOrganization?.code}
                            </p>
                        </div>

                        {/* Receiving Location - Right aligned */}
                        <div className="text-right w-1/2">
                            <h3 className="text-lg font-bold text-gray-600 mb-2">Receiving Location</h3>
                            <p className="text-sm text-gray-700 font-medium">
                                <strong>Building:</strong> {transfer.receivingBuildingRoom?.building?.code}
                            </p>
                            <p className="text-sm text-gray-700 font-medium">
                                <strong>Room:</strong> {transfer.receivingBuildingRoom?.room}
                            </p>
                            <p className="text-sm text-gray-700 font-medium">
                                <strong>Unit/Dept/Lab:</strong> {transfer.receivingOrganization?.code}
                            </p>
                        </div>
                    </div>

                    {/* Assets Table */}
                    <table className="w-full border mt-2 text-sm text-center">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="border px-2 py-1">Brand</th>
                                <th className="border px-2 py-1">Category</th>
                                <th className="border px-2 py-1">Asset Name</th>
                                <th className="border px-2 py-1">Serial No.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map((asset) => (
                                <tr key={asset.id}>
                                    <td className="border px-2 py-1">{asset.assetModel?.brand}</td>
                                    <td className="border px-2 py-1">{asset.assetModel?.category?.name ?? asset.category?.name}</td>
                                    <td className="border px-2 py-1">{asset.asset_name}</td>
                                    <td className="border px-2 py-1">{asset.serial_no}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* DO NOT DELETE, IT'S FOR SPACING */}
                    <div className="h-6" />

                    {/* Schedule Info */}
                    <div className="mb-4 text-sm font-medium">
                        <div className="flex justify-between">
                            <p>
                            <strong>Date of Transfer:</strong> {formatDate(transfer.scheduled_date)}
                            </p>

                            {transfer.actual_transfer_date ? (
                            <p className="text-right">
                                <strong>Actual Date:</strong> {formatDate(transfer.actual_transfer_date)}
                            </p>
                            ) : (
                            <p className="text-right">
                                <strong>Total Assets:</strong> {assets.length}
                            </p>
                            )}
                        </div>

                        {/* Show total assets below if actual date exists */}
                        {transfer.actual_transfer_date && (
                            <div className="text-right mt-1">
                            <strong>Total Assets:</strong> {assets.length}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-10 text-sm">
                        {/* Assigned By Section */}
                        {transfer.assignedBy && (
                            <div className="text-left">
                                <p className="font-semibold mb-7">Assigned By:</p>
                                <div className="border-t border-black w-48 mb-2"></div>
                                <p className="font-bold text-gray-800">{transfer.assignedBy.name}</p>
                                <p className="text-xs text-gray-500 italic">[Role Here]</p>
                            </div>
                        )}

                        {/* Received By Section */}
                        {transfer.received_by && (
                            <div className="text-right">
                                <p className="font-semibold mb-">Received By</p>
                                <div className="border-t border-black w-48 ml-auto mb-1"></div>
                                <p className="font-bold text-gray-800">{transfer.received_by}</p>
                                <p className="text-xs text-gray-500 italic">[Role Here]</p>
                            </div>
                        )}

                        {/* Fallback space if received_by is null to maintain layout */}
                        {!transfer.received_by && <div></div>}
                    </div>

                    <div className="mt-6 text-center print:hidden">
                        <a
                            href="/transfers"
                            className="cursor-pointer inline-block bg-black text-white px-4 py-2 mr-2 rounded shadow text-sm font-semibold hover:bg-black/70"

                        >
                            ← Back to Transfers
                        </a>
                        <button
                            onClick={() => window.print()}
                            className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded shadow text-sm font-semibold hover:bg-blue-500 focus-visible:ring focus-visible:ring-blue-500/50"
                        >
                            🖨️ Print Form
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
