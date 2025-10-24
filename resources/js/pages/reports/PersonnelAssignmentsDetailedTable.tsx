import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatDate, formatEnums, ucwords } from '@/types/custom-index'
import Pagination, { PageInfo } from '@/components/Pagination'

type AssetRecordRow = {
    assignment_item_id: number;
    asset_name: string;
    category: string | null;
    equipment_code: string | null;
    serial_no: string | null;
    asset_unit_or_department: string | null;
    asset_status: string | null;
    personnel_name: string;
    previous_personnel_name: string | null;
    date_assigned: string | null;
    current_transfer_status: string | null;
    current_turnover_disposal_status: string | null;
    current_off_campus_status: string | null;
    current_inventory_status: string | null;
}

type Props = {
    records: AssetRecordRow[];
    page: number;
    total: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    hasActiveFilters: boolean;
}

export default function PersonnelAssignmentsDetailedTable({
    records,
    page,
    total,
    pageSize,
    onPageChange,
    hasActiveFilters,
}: Props) {
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
                            <TableHead className="w-[100px] text-center">Equipment Code</TableHead>
                            <TableHead className="w-[200px] text-center">Asset Name</TableHead>
                            <TableHead className="w-[180px] text-center">Unit / Department</TableHead>
                            <TableHead className="w-[160px] text-center">Previously Assigned To</TableHead>
                            <TableHead className="w-[160px] text-center">Personnel in Charge</TableHead>
                            <TableHead className="w-[120px] text-center">Date Assigned</TableHead>
                            <TableHead className="w-[220px] text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {records.map((r) => (
                            <TableRow key={r.assignment_item_id} className="text-center">
                                <TableCell>{r.equipment_code || '—'}</TableCell>
                                <TableCell className="whitespace-normal break-words text-center">
                                    <div>
                                        <p className="font-medium">{r.asset_name}</p>
                                        <p className="text-xs text-gray-500">{r.category || '—'}</p>
                                        {r.serial_no && (
                                            <p className="text-xs text-blue-600 font-medium">
                                                SN: {r.serial_no}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{r.asset_unit_or_department || '—'}</TableCell>
                                <TableCell className="text-red-600">
                                    {r.previous_personnel_name || '—'}
                                </TableCell>
                                <TableCell className="font-bold">{r.personnel_name}</TableCell>
                                <TableCell>{r.date_assigned ? formatDate(r.date_assigned) : '—'}</TableCell>
                                <TableCell className="whitespace-normal break-words text-center text-sm">
                                    {r.asset_status && (
                                        <p
                                            className={`font-semibold ${
                                                r.asset_status === 'active'
                                                    ? 'text-green-600'
                                                    : r.asset_status === 'archived'
                                                    ? 'text-orange-600'
                                                    : r.asset_status === 'missing'
                                                    ? 'text-red-600'
                                                    : 'text-gray-800'
                                            }`}
                                        >
                                            {ucwords(formatEnums(r.asset_status))}
                                        </p>
                                    )}
                                    {r.current_inventory_status && (
                                        <p className="text-green-700 font-semibold">
                                            Inventory: {ucwords(formatEnums(r.current_inventory_status))}
                                        </p>
                                    )}
                                    {r.current_transfer_status && (
                                        <p className="text-purple-700 font-semibold">
                                            Transfer: {ucwords(formatEnums(r.current_transfer_status))}
                                        </p>
                                    )}
                                    {r.current_turnover_disposal_status && (
                                        <p className="text-orange-600 font-semibold">
                                            Turnover/Disposal: {ucwords(formatEnums(r.current_turnover_disposal_status))}
                                        </p>
                                    )}
                                    {r.current_off_campus_status && (
                                        <p className="text-blue-600 font-semibold">
                                            Off Campus: {ucwords(formatEnums(r.current_off_campus_status))}
                                        </p>
                                    )}
                                    {
                                        !r.current_transfer_status &&
                                        !r.current_turnover_disposal_status &&
                                        !r.current_off_campus_status &&
                                        !r.current_inventory_status && (
                                        <p className="text-gray-500">No recent activity</p>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between border-t p-3">
                <PageInfo 
                    page={page} 
                    total={total} 
                    pageSize={pageSize} 
                    label="records" 
                />
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
