import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/types/custom-index';

type DonationSummary = {
    record_id: number;
    document_date: string;
    description: string | null;
    turnover_category: string | null;
    issuing_office: string | null;
    quantity: number;
    remarks: string | null;
    total_cost: number;
};

type Props = {
    donationSummary: DonationSummary[];
};

export default function DonationSummaryTable({ donationSummary }: Props) {
    if (!donationSummary || donationSummary.length === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-gray-500">
                <p className="text-lg font-semibold">No Donation Records Found</p>
                <p className="text-sm">No records were marked as donation within the selected filters.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col rounded-md border">
            <div className="flex-1 overflow-y-auto">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[100px] text-center">Record No.</TableHead>
                            <TableHead className="w-[150px] text-center">Date of Donation</TableHead>
                            <TableHead className="w-[200px] text-center">Issuing Office (Source)</TableHead>
                            <TableHead className="w-[150px] text-center">Description of Items</TableHead>
                            <TableHead className="w-[120px] text-center">Quantity</TableHead>
                            <TableHead className="w-[120px] text-center">Total Cost</TableHead>
                            <TableHead className="w-[200px] text-center">Remarks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {donationSummary.map((r) => (
                            <TableRow key={r.record_id} className="text-center">
                                <TableCell>{r.record_id}</TableCell>
                                <TableCell>{formatDate(r.document_date)}</TableCell>
                                <TableCell>{r.issuing_office || '—'}</TableCell>
                                <TableCell className="whitespace-normal break-words text-center">
                                    <div className="flex flex-col items-center">
                                        {r.turnover_category && (
                                            <span className="font-medium">
                                                {r.turnover_category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500">{r.description ?? '—'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{r.quantity}</TableCell>
                                <TableCell>
                                    ₱{" "}
                                    {Number(r.total_cost)
                                        .toLocaleString("en-PH", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                        useGrouping: true,
                                        })
                                        .replace(/,/g, ", ")}
                                </TableCell>
                                <TableCell className="whitespace-normal break-words text-center text-gray-700">
                                    {r.remarks ?? '—'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
