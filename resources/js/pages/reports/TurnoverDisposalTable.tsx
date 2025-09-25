import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/types/custom-index'
import Pagination, { PageInfo } from '@/components/Pagination'

import type { RecordRow } from './TurnoverDisposalReport';

type Props = {
    records: RecordRow[]
    page: number
    total: number
    pageSize: number
    onPageChange: (page: number) => void
}

export default function TurnoverDisposalTable({ records, page, total, pageSize, onPageChange }: Props) {
    if (!records || records.length === 0) {
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
                <TableHead className="w-[80px] text-center">ID</TableHead>
                <TableHead className="w-[120px] text-center">Type</TableHead>
                <TableHead className="w-[150px] text-center">Issuing Office</TableHead>
                <TableHead className="w-[150px] text-center">Receiving Office</TableHead>
                <TableHead className="w-[100px] text-center">Assets</TableHead>
                <TableHead className="w-[150px] text-center">Date</TableHead>
                <TableHead className="w-[120px] text-center">Status</TableHead>
                <TableHead className="w-[200px] text-center">Remarks</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {records.map((r) => (
                <TableRow key={r.id} className="text-center">
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.issuing_office}</TableCell>
                    <TableCell>{r.receiving_office || '—'}</TableCell>
                    <TableCell>{r.asset_count}</TableCell>
                    <TableCell>{formatDate(r.document_date)}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell className="whitespace-normal break-words">{r.remarks || '—'}</TableCell>
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
