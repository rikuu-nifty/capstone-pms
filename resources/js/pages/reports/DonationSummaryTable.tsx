import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatDate, formatEnums } from '@/types/custom-index'
import Pagination, { PageInfo } from '@/components/Pagination'

type DonationAsset = {
    asset_id: number | null
    record_id: number
    document_date: string
    issuing_office: string | null
    receiving_office: string | null
    external_recipient: string | null
    asset_name: string | null
    serial_no: string | null
    category: string | null
    turnover_category: string | null
    unit_cost: number | null
    asset_status: string | null
    asset_remarks: string | null
}

type Props = {
    donationSummary: DonationAsset[]
    page: number
    total: number
    pageSize: number
    onPageChange: (page: number) => void
    hasActiveFilters: boolean
}

export default function DonationSummaryTable({
    donationSummary,
    page,
    total,
    pageSize,
    onPageChange,
    hasActiveFilters,
}: Props) {
    const sorted = [...donationSummary].sort(
        (a, b) =>
        new Date(b.document_date).getTime() - new Date(a.document_date).getTime()
    )

    if (hasActiveFilters && sorted.length === 0) {
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
                            <TableHead className="w-[150px] text-center">Asset Name</TableHead>
                            <TableHead className="w-[150px] text-center">Turnover Category</TableHead>
                            <TableHead className="w-[120px] text-center">Unit Cost</TableHead>
                            <TableHead className="w-[150px] text-center">Issuing Office</TableHead>
                            <TableHead className="w-[150px] text-center">Recipient</TableHead>
                            <TableHead className="w-[120px] text-center">Date</TableHead>
                            <TableHead className="w-[200px] text-center">Remarks</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {sorted.map((r) => (
                        <TableRow key={`${r.record_id}-${r.asset_id ?? 'x'}`} className="text-center">
                            <TableCell>{r.record_id}</TableCell>
                            <TableCell className="whitespace-normal break-words text-center">
                                <div>
                                    <p className="font-medium">{r.asset_name ?? '—'}</p>
                                    {r.category && (
                                        <p className="text-xs text-gray-500">{r.category}</p>
                                    )}
                                    {r.serial_no && (
                                        <p className="text-xs text-blue-600 font-medium">
                                            SN: {r.serial_no}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {r.turnover_category
                                    ? formatEnums(r.turnover_category)
                                    : '—'}
                            </TableCell>
                            <TableCell>
                                {(() => {
                                    const amount = Number(r.unit_cost)
                                    const formatted = Number.isFinite(amount)
                                    ? new Intl.NumberFormat('en-PH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                            useGrouping: true,
                                        })
                                        .format(amount)
                                        .replace(/,/g, ', ')
                                    : '0.00'
                                    return <>₱ {formatted}</>
                                })()}
                            </TableCell>
                            <TableCell>{r.issuing_office ?? '—'}</TableCell>
                            <TableCell>
                                {r.receiving_office ?? r.external_recipient ?? '—'}
                            </TableCell>
                            <TableCell>{formatDate(r.document_date)}</TableCell>
                            <TableCell className="whitespace-normal break-words text-center">
                                {r.asset_remarks ?? '—'}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between border-t p-3">
                <PageInfo page={page} total={total} pageSize={pageSize} label="records" />
                <Pagination
                    page={page}
                    total={total}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    )
}
