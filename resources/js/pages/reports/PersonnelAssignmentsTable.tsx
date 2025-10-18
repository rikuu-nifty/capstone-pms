import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import Pagination, { PageInfo } from '@/components/Pagination';
import { formatEnums } from '@/types/custom-index';

type PersonnelRow = {
    id: number
    full_name: string
    department: string | null
    status: string
    current_assets_count: number
    past_assets_count: number
};

type Props = {
    records: PersonnelRow[]
    page: number
    total: number
    pageSize: number
    onPageChange: (page: number) => void
    hasActiveFilters: boolean
};

export default function PersonnelAssignmentsTable({
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
                            <TableHead className="text-center w-[150px]">Assignment ID</TableHead>
                            <TableHead className="text-center w-[300px]">Personnel</TableHead>
                            <TableHead className="text-center w-[300px]">Department</TableHead>
                            <TableHead className="text-center w-[200px]">Status</TableHead>
                            <TableHead className="text-center w-[200px]">Past Assets</TableHead>
                            <TableHead className="text-center w-[200px]">Current Assets</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.map((p) => (
                            <TableRow 
                                key={p.id} 
                                className="text-center"
                            >
                                <TableCell className="font-medium">{p.id}</TableCell>
                                <TableCell className="font-medium">{p.full_name}</TableCell>
                                <TableCell>{p.department || '—'}</TableCell>
                                <TableCell>{formatEnums(p.status)}</TableCell>
                                <TableCell className="text-blue-600 font-bold">
                                    {p.past_assets_count}
                                </TableCell>
                                <TableCell className="text-green-600 font-bold">
                                    {p.current_assets_count}
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
