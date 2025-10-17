<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TurnoverDisposalReportExport implements FromView, WithColumnWidths, WithStyles
{
    protected $records;
    protected $filters;

    public function __construct($records, $filters)
    {
        $this->records = $records;
        $this->filters = $filters;
    }

    public function view(): View
    {
        return view('reports.turnover_disposal_excel', [
            'records' => $this->records,
            'filters' => $this->filters,
        ]);
    }

    public function columnWidths(): array
    {
        return [
            'A' => 25, // Record #
            'B' => 30, // Asset Name
            'C' => 18, // Serial No.
            'D' => 20, // Turnover Category
            'E' => 18, // For Donation
            'F' => 25, // Receiving Office
            'G' => 18, // Unit Cost
            'H' => 15, // Status
            'I' => 18, // Document Date
            'J' => 35, // Remarks
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        // === REPORT HEADER ===
        $sheet->mergeCells('A1:J1');
        $sheet->getStyle('A1:J1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1:J1')->getAlignment()->setHorizontal('center');

        // Report details block (rows 2–4): make labels bold, align left
        $sheet->getStyle('A2:A4')->getFont()->setBold(true);
        $sheet->getStyle('E2:E4')->getFont()->setBold(true);
        $sheet->getStyle('A2:J4')->getAlignment()->setHorizontal('left');

        // === TABLE HEADER ===
        $sheet->getStyle('A6:J6')->getFont()->setBold(true);
        $sheet->getStyle('A6:J6')->getAlignment()->setHorizontal('center');
        $sheet->getStyle('A6:J6')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFBFBFBF');

        // === BODY ROWS ===
        for ($row = 7; $row <= $highestRow; $row++) {
            $value = trim((string) $sheet->getCell("A{$row}")->getValue());

            // Month groups (e.g. "January 2025")
            if ($value && preg_match('/^[A-Za-z]+ \d{4}$/', $value)) {
                $sheet->getStyle("A{$row}:J{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:J{$row}")
                    ->getAlignment()->setHorizontal('left')->setIndent(0);
                $sheet->getStyle("A{$row}:J{$row}")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFEAEAEA');

                // Issuing Office rows
            } elseif ($value && stripos($value, 'Issuing Office:') === 0) {
                $sheet->getStyle("A{$row}:J{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:J{$row}")
                    ->getAlignment()->setHorizontal('left')->setIndent(2);
                $sheet->getStyle("A{$row}:J{$row}")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFF5F5F5');

                // Type rows (Turnover / Disposal)
            } elseif ($value && (stripos($value, 'Turnover') === 0 || stripos($value, 'Disposal') === 0)) {
                $sheet->getStyle("A{$row}:J{$row}")->getFont()->setBold(true)->setItalic(true);
                $sheet->getStyle("A{$row}:J{$row}")
                    ->getAlignment()->setHorizontal('left')->setIndent(4);
                $sheet->getStyle("A{$row}:J{$row}")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFF9F9F9');

                // Totals
            } elseif ($value && (stripos($value, 'Total Assets') === 0 || stripos($value, 'Total Cost') === 0)) {
                $sheet->getStyle("A{$row}:J{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:J{$row}")
                    ->getAlignment()->setHorizontal('right');
                $sheet->getStyle("A{$row}:J{$row}")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFDDEBF7');
                $sheet->getStyle("A{$row}:J{$row}")->getBorders()->getTop()
                    ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
                $sheet->getStyle("A{$row}:J{$row}")->getBorders()->getBottom()
                    ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);

                // Regular data rows
            } else {
                $sheet->getStyle("A{$row}:J{$row}")
                    ->getAlignment()->setHorizontal('center');
            }
        }

        $sheet->getDefaultRowDimension()->setRowHeight(-1);

        $sheet->getStyle("B1:B{$highestRow}")
            ->getAlignment()
            ->setWrapText(true)
            ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP);

        $sheet->getStyle("J1:J{$highestRow}")
            ->getAlignment()
            ->setWrapText(true)
            ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP);

        return [];
    }
}
