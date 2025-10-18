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
            'A' => 16, // Record #
            'B' => 20, // Date of Donation
            'C' => 28, // Issuing Office
            'D' => 28, // Recipient
            'E' => 34, // Asset Name + Category + Serial No
            'F' => 22, // Turnover Category
            'G' => 18, // Unit Cost
            'H' => 30, // Remarks
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        // === HEADER ===
        $sheet->mergeCells('A1:H1');
        $sheet->getStyle('A1:H1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1:H1')->getAlignment()->setHorizontal('center');

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

        // === BODY STYLING LOOP ===
        for ($row = 7; $row <= $highestRow; $row++) {
            $value = trim((string) $sheet->getCell("A{$row}")->getValue());

            // Month grouping
            if ($value && preg_match('/^[A-Za-z]+ \d{4}$/', $value)) {
                $sheet->getStyle("A{$row}:H{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:H{$row}")
                    ->getAlignment()->setHorizontal('left');
                $sheet->getStyle("A{$row}:H{$row}")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFEAEAEA');

                // Issuing Office header
            } elseif ($value && stripos($value, 'Issuing Office:') === 0) {
                $sheet->getStyle("A{$row}:H{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:H{$row}")
                    ->getAlignment()->setHorizontal('left')->setIndent(2);
                $sheet->getStyle("A{$row}:H{$row}")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFF5F5F5');

                // Subtotal rows
            } elseif ($value && (stripos($value, 'Total Donations') === 0 || stripos($value, 'Total Cost') === 0)) {
                $sheet->getStyle("A{$row}:H{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:H{$row}")
                    ->getAlignment()->setHorizontal('right');
                $sheet->getStyle("A{$row}:H{$row}")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFDDEBF7');
                $sheet->getStyle("A{$row}:H{$row}")->getBorders()->getTop()
                    ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
                $sheet->getStyle("A{$row}:H{$row}")->getBorders()->getBottom()
                    ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);

                // Summary rows
            } elseif ($value && (stripos($value, 'Total Donation Records:') === 0 || stripos($value, 'Grand Total Cost:') === 0)) {
                $sheet->getStyle("A{$row}:H{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:H{$row}")
                    ->getAlignment()->setHorizontal('right');
                $sheet->getStyle("A{$row}:H{$row}")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFE2E8F0');

                // Regular data rows
            } else {
                $sheet->getStyle("A{$row}:H{$row}")
                    ->getAlignment()->setHorizontal('center');

                // Asset Name (column E): center + wrap multiline
                $sheet->getStyle("E{$row}")
                    ->getAlignment()
                    ->setHorizontal('center')
                    ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER)
                    ->setWrapText(true);

                // Remarks (column H): center if “—” else left-align
                $remarks = trim((string) $sheet->getCell("H{$row}")->getValue());
                if ($remarks === '—' || $remarks === '-' || $remarks === '') {
                    $sheet->getStyle("H{$row}")->getAlignment()->setHorizontal('center');
                } else {
                    $sheet->getStyle("H{$row}")->getAlignment()->setHorizontal('left');
                }
            }

            // Auto height for wrapped text
            $sheet->getRowDimension($row)->setRowHeight(-1);
        }

        // === GLOBAL STYLING ===
        $sheet->getDefaultRowDimension()->setRowHeight(-1);
        $sheet->getStyle("A1:H{$highestRow}")
            ->getAlignment()
            ->setWrapText(true)
            ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

        return [];
    }
}
