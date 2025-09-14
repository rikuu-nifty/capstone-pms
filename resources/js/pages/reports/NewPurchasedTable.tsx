import { useMemo, useState } from 'react';
import type { Asset } from './InventoryListReport'; // ✅ reuse same type

type GroupedAsset = Asset & {
    qty: number;
    amount: number;
};

interface Props {
    assets: Asset[];
}

export default function NewPurchasesTable({ assets }: Props) {
    const grouped: GroupedAsset[] = useMemo(() => {
        const map: Record<string, GroupedAsset> = {};

        assets.forEach((a) => {
            const key = [a.date_purchased, a.memorandum_no, a.supplier, a.asset_name, a.unit_cost, a.department].join('|');

            if (!map[key]) {
                map[key] = {
                    ...a,
                    qty: 0,
                    amount: 0,
                };
            }
            map[key].qty += 1;
            map[key].amount += Number(a.unit_cost ?? 0); // ✅ force numeric
        });

        return Object.values(map);
    }, [assets]);

    // ✅ Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    const totalPages = Math.ceil(grouped.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = grouped.slice(startIndex, startIndex + rowsPerPage);

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
                            <th className="px-4 py-3 font-semibold">Date</th>
                            <th className="px-4 py-3 font-semibold">MR No.</th>
                            <th className="px-4 py-3 font-semibold">Supplier</th>
                            <th className="px-4 py-3 font-semibold">Item / Description</th>
                            <th className="px-4 py-3 font-semibold">Unit / Dept</th>
                            <th className="px-4 py-3 font-semibold">Qty</th>
                            <th className="px-4 py-3 font-semibold">Unit Cost</th>
                            <th className="px-4 py-3 font-semibold">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((g, idx) => (
                            <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t transition hover:bg-gray-100`}>
                                <td className="px-4 py-3">
                                    {g.date_purchased
                                        ? new Date(g.date_purchased).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: '2-digit',
                                          })
                                        : '-'}
                                </td>
                                <td className="px-4 py-3">{g.memorandum_no ?? '-'}</td>
                                <td className="px-4 py-3">{g.supplier ?? '-'}</td>
                                <td className="px-4 py-3">{g.asset_name ?? '-'}</td>
                                <td className="px-4 py-3">{g.department ?? '-'}</td>
                                <td className="px-4 py-3">{g.qty}</td>
                                <td className="px-4 py-3">
                                    {g.unit_cost !== null
                                        ? `₱${Number(g.unit_cost).toLocaleString('en-US', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                          })}`
                                        : '-'}
                                </td>
                                <td className="px-4 py-3">
                                    {g.amount
                                        ? `₱${Number(g.amount).toLocaleString('en-US', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                          })}`
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
