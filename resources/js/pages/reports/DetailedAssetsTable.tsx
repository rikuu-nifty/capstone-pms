import { useState } from 'react';
import type { Asset } from './InventoryListReport'; // ✅ reuse same type

interface DetailedAssetsTableProps {
    assets: Asset[];
}

export default function DetailedAssetsTable({ assets }: DetailedAssetsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    const totalPages = Math.ceil(assets.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = assets.slice(startIndex, startIndex + rowsPerPage);

    // ✅ Empty state (same style as chart)
    if (currentRows.length === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                <p className="text-lg font-medium">No Data Available</p>
                <p className="text-sm">Try adjusting your filters.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
            {/* Table */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-800">
                            <th className="px-4 py-3 font-semibold">MR No.</th> {/* ✅ new */}
                            <th className="px-4 py-3 font-semibold">Asset Name</th>
                            <th className="px-4 py-3 font-semibold">Brand</th>
                            <th className="px-4 py-3 font-semibold">Model</th>
                            <th className="px-4 py-3 font-semibold">Asset Type</th> {/* ✅ new */}
                            <th className="px-4 py-3 font-semibold">Category</th>
                            <th className="px-4 py-3 font-semibold">Unit / Department</th>
                            <th className="px-4 py-3 font-semibold">Building / Room</th>
                            <th className="px-4 py-3 font-semibold">Supplier</th>
                            <th className="px-4 py-3 font-semibold">Date Purchased</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((asset, idx) => (
                            <tr key={asset.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t transition hover:bg-gray-100`}>
                                 <td className="px-4 py-3">{asset.memorandum_no ?? '—'}</td> {/* ✅ MR No. */}
                                <td className="px-4 py-3">{asset.asset_name}</td>
                                <td className="px-4 py-3">{asset.brand}</td>
                                <td className="px-4 py-3">{asset.model}</td>
                                <td className="px-4 py-3">
                                    {asset.asset_type === 'fixed' ? 'Fixed' : asset.asset_type === 'not_fixed' ? 'Not Fixed' : asset.asset_type}
                                </td>
                                <td className="px-4 py-3">{asset.category}</td>
                                <td className="px-4 py-3">{asset.department}</td>
                                <td className="px-4 py-3">
                                    {asset.building} / {asset.room}
                                </td>
                                <td className="px-4 py-3">{asset.supplier}</td>
                                <td className="px-4 py-3">
                                    {asset.date_purchased
                                        ? new Date(asset.date_purchased).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: '2-digit',
                                          })
                                        : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-3 flex items-center justify-between border-t bg-gray-50 px-4 py-3 text-sm">
                <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                            currentPage === 1 ? 'cursor-not-allowed bg-gray-200 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        Previous
                    </button>

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                            currentPage === totalPages ? 'cursor-not-allowed bg-gray-200 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
