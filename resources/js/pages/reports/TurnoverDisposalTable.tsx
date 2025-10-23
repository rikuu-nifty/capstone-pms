import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatDate, formatEnums, ucwords } from '@/types/custom-index'
import Pagination, { PageInfo } from '@/components/Pagination'

import type { RecordRow } from './TurnoverDisposalReport';

type Props = {
    records: RecordRow[]
    page: number
    total: number
    pageSize: number
    onPageChange: (page: number) => void
    hasActiveFilters: boolean
}

export default function TurnoverDisposalTable({ records, page, total, pageSize, onPageChange, hasActiveFilters }: Props) {
    if (hasActiveFilters && records.length === 0) {
        return (
        <div className="flex h-full w-full flex-col items-center justify-center text-gray-500">
            <p className="text-lg font-semibold">No Data Available</p>
            <p className="text-sm">Try adjusting your filters to see results.</p>
        </div>
        )
    }

    return (
        <div className="flex h-full flex-col rounded-md border">
            <div className="flex-1 overflow-y-auto">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px] text-center">Record No.</TableHead>
                            <TableHead className="w-[180px] text-center">Asset Name</TableHead>
                            <TableHead className="w-[120px] text-center">Type</TableHead>
                            <TableHead className="w-[120px] text-center">Turnover Category</TableHead>
                            <TableHead className="w-[80px] text-center">For Donation</TableHead>
                            <TableHead className="w-[150px] text-center">Issuing Office</TableHead>
                            <TableHead className="w-[150px] text-center">Receiving Office</TableHead>
                            <TableHead className="w-[120px] text-center">Status</TableHead>
                            <TableHead className="w-[150px] text-center">Date</TableHead>
                            <TableHead className="w-[180px] text-center">Remarks</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {records.map((r) => (
                            <TableRow key={`${r.turnover_disposal_id}-${r.asset_id}`} className="text-center">
                                <TableCell>{r.turnover_disposal_id}</TableCell>
                                <TableCell className="whitespace-normal break-words text-center">
                                    <div>
                                        <p className="font-medium">{r.asset_name}</p>
                                        <p className="text-xs text-gray-500">{r.category}</p>
                                        {r.serial_no && (
                                            <p className="text-xs text-blue-600 font-medium">
                                                SN: {r.serial_no}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{ucwords(r.type)}</TableCell>
                                <TableCell className="whitespace-normal break-words text-center">
                                    {r.turnover_category ? formatEnums(r.turnover_category) : '—'}
                                </TableCell>
                                <TableCell>
                                    {r.is_donation
                                        ? <span className="text-green-600 font-medium">Yes</span>
                                        : <span className="text-red-600 font-medium">No</span>}
                                </TableCell>
                                <TableCell>{r.issuing_office}</TableCell>
                                <TableCell>{r.receiving_office || '—'}</TableCell>
                                <TableCell>{formatEnums(r.td_status)}</TableCell>
                                <TableCell>{formatDate(r.document_date)}</TableCell>
                                <TableCell className="whitespace-normal break-words text-center">
                                    {r.remarks || '—'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t p-3">
                <PageInfo page={page} total={total} pageSize={pageSize} label="records" />
                <Pagination page={page} total={total} pageSize={pageSize} onPageChange={onPageChange} />
            </div>
        </div>
    )
}
