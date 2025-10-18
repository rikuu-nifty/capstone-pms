<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TurnoverDisposalDonationsExport implements FromView, WithColumnWidths, WithStyles
{
    protected $donationSummary;
    protected $filters;

    public function __construct($donationSummary, $filters)
    {
        $this->donationSummary = $donationSummary;
        $this->filters = $filters;
    }

    public function view(): View
    {
        return view('reports.turnover_disposal_donations_excel', [
            'donationSummary' => $this->donationSummary,
            'filters' => $this->filters,
        ]);
    }

    public function columnWidths(): array
    {
        return [
            'A' => 18, // Record No.
            'B' => 20, // Date of Donation
            'C' => 30, // Issuing Office
            'D' => 30, // Recipient
            'E' => 35, // Description of Items
            'F' => 15, // Quantity
            'G' => 18, // Total Cost
            'H' => 25, // Remarks ✅ new column
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        // === HEADER ===
        $sheet->mergeCells('A1:H1');
        $sheet->getStyle('A1:H1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A6:H6')->getFont()->setBold(true);
        $sheet->getStyle('A6:H6')->getAlignment()->setHorizontal('center');

        // Report details (rows 2–4)
        $sheet->getStyle('A2:A4')->getFont()->setBold(true);
        $sheet->getStyle('E2:E4')->getFont()->setBold(true);
        $sheet->getStyle('A2:H4')->getAlignment()->setHorizontal('left');

        // === TABLE HEADER ===
        $sheet->getStyle('A6:H6')->getFont()->setBold(true);
        $sheet->getStyle('A6:H6')->getAlignment()->setHorizontal('center');
        $sheet->getStyle('A6:H6')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFBFBFBF');

        // === BODY ===
        for ($row = 7; $row <= $highestRow; $row++) {
            $value = trim((string) $sheet->getCell("A{$row}")->getValue());

            if ($value && (
                stripos($value, 'Total Items Donated:') === 0 ||
                stripos($value, 'Grand Total Cost:') === 0
            )) {
                $sheet->getStyle("A{$row}:H{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:H{$row}")->getAlignment()->setHorizontal('right');
                $sheet->getStyle("A{$row}:H{$row}")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFDDEBF7');
                $sheet->getStyle("A{$row}:H{$row}")->getBorders()->getTop()
                    ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
                $sheet->getStyle("A{$row}:H{$row}")->getBorders()->getBottom()
                    ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
            } else {
                $sheet->getStyle("A{$row}:H{$row}")
                    ->getAlignment()->setHorizontal('center');
            }
            
            // Enforce minimum row height for each row
            $sheet->getRowDimension($row)->setRowHeight(25);
        }

        // === GENERAL ===
        $sheet->getDefaultRowDimension()->setRowHeight(22);
        $sheet->getStyle("A1:H{$highestRow}")
            ->getAlignment()
            ->setWrapText(true)
            ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

        return [];
    }
}
