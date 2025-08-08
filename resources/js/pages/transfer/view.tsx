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

            <div className="min-h-screen bg-blue-100 pt-5 pb-5 px-5 flex justify-center items-start">
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
                    <div className="h-4" />

                    {/* Remarks + Total Assets Header Line */}
                    <div className="flex justify-between items-start mb-1 px-1">
                        <h4 className="text-sm font-semibold text-gray-800">Remarks:</h4>
                        <p className="text-sm font-medium text-gray-800">
                            <strong>Total Assets:</strong> {assets.length}
                        </p>
                    </div>

                    {/* Remarks Value */}
                    {transfer.remarks && (
                        <p className="text-sm italic text-blue-700 ml-20">{transfer.remarks}</p>
                    )}

                    {/* <hr className="w-1/2 border-t border-gray-300 my-4 mx-auto" /> */}

                    <div className="grid grid-cols-2 gap-x-6 gap-y-18 mt-8 text-sm">
                        {/* Assigned By Section */}
                        {transfer.assignedBy && (
                            <div className="text-center">
                                <p className="font-semibold mb-8">Prepared By:</p>
                                <div className="border-t border-black w-48 mx-auto mb-1"></div>
                                <p className="font-bold text-gray-700">{transfer.assignedBy.name}</p>
                                <p className="text-xs text-gray-500 italic">[Role Here]</p>
                            </div>
                        )}

                        {/* Designated Section */}
                        {transfer.designatedEmployee?.name && (
                            <div className="text-center">
                                <p className="font-semibold mb-8">Designated To:</p>
                                <div className="border-t border-black w-48 mx-auto mb-1"></div>
                                <p className="font-bold text-gray-800">{transfer.designatedEmployee?.name}</p>
                                <p className="text-xs text-gray-500 italic">[Role Here]</p>
                            </div>
                        )}

                        {/* Received By Section */}
                        {transfer.received_by && (
                            <div className="text-center">
                                <p className="font-semibold mb-8">Received By:</p>
                                <div className="border-t border-black w-48 mx-auto mb-1"></div>
                                <p className="font-bold text-gray-800">{transfer.received_by}</p>
                                <p className="text-xs text-gray-500 italic">[Role Here]</p>
                            </div>
                        )}

                        {/* Approved By Section */}
                        {transfer.received_by && (
                            <div className="text-center">
                                <p className="font-semibold mb-8">Approved By:</p>
                                <div className="border-t border-black w-48 mx-auto mb-1"></div>
                                <p className="font-bold text-gray-800 italic">(PMO Head name)</p> {/* Placeholder until roles have been implemented */}
                                <p className="text-xs text-gray-500 italic">[Role Here]</p>
                            </div>
                        )}

                        {/* Fallback space if received_by is null to maintain layout */}
                        {!transfer.received_by && <div></div>}
                    </div>

                    {/* Schedule Info */}
                    <div className="mt-13 mb-2 text-sm font-medium">
                        <div className="flex justify-between">
                            <p>
                                <strong>Date of Transfer:</strong> {formatDate(transfer.scheduled_date)}
                            </p>

                            {transfer.actual_transfer_date && (
                                <p className="text-right">
                                    <strong>Actual Date:</strong> {formatDate(transfer.actual_transfer_date)}
                                </p>
                            )}
                        </div>
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
