<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PersonnelAssignmentsSummaryExport implements FromView, WithColumnWidths, WithStyles
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
        return view('reports.personnel_assignments_excel', [
            'records' => $this->records,
            'filters' => $this->filters,
        ]);
    }

    public function columnWidths(): array
    {
        return [
            'A' => 18, // Assignment ID
            'B' => 35, // Personnel-in-Charge
            'C' => 22, // Status
            'D' => 18, // Past Assets
            'E' => 18, // Current Assets
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        // === REPORT HEADER ===
        $sheet->mergeCells('A1:E1');
        $sheet->getStyle('A1:E1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1:E1')->getAlignment()->setHorizontal('center');

        // === REPORT DETAILS (Rows 2–3): Equal width + alignment ===
        $sheet->getStyle('A2:A3')->getFont()->setBold(true);
        $sheet->getStyle('C2:C3')->getFont()->setBold(true);
        $sheet->getStyle('A2:E3')->getAlignment()->setHorizontal('left');
        $sheet->getRowDimension(2)->setRowHeight(20);
        $sheet->getRowDimension(3)->setRowHeight(20);

        // === TABLE HEADER ===
        $sheet->getStyle('A6:E6')->getFont()->setBold(true);
        $sheet->getStyle('A6:E6')->getAlignment()->setHorizontal('center');
        $sheet->getStyle('A6:E6')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFBFBFBF');

        // === BODY ROWS ===
        for ($row = 7; $row <= $highestRow; $row++) {
            $value = trim((string) $sheet->getCell("A{$row}")->getValue());

            // Department Header
            if ($value && stripos($value, 'Unit / Department:') === 0) {
                $sheet->getStyle("A{$row}:E{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:E{$row}")
                    ->getAlignment()->setHorizontal('left')->setIndent(1);
                $sheet->getStyle("A{$row}:E{$row}")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFEAEAEA');

                // Subtotal Rows (Total for Department)
            } elseif ($value && stripos($value, 'Total for') === 0) {
                $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:C{$row}")
                    ->getAlignment()->setHorizontal('right');
                $sheet->getStyle("D{$row}:E{$row}")
                    ->getAlignment()->setHorizontal('center');
                $sheet->getStyle("A{$row}:E{$row}")
                    ->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFF9F9F9');
                $sheet->getStyle("A{$row}:E{$row}")->getBorders()->getTop()
                    ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);

                // Regular Data Rows
            } else {
                $sheet->getStyle("A{$row}:E{$row}")
                    ->getAlignment()->setHorizontal('center');

                // Past Assets (Column D → blue)
                $sheet->getStyle("D{$row}")->getFont()->getColor()
                    ->setARGB('FF2563EB');

                // Current Assets (Column E → green)
                $sheet->getStyle("E{$row}")->getFont()->getColor()
                    ->setARGB('FF16A34A');

                // Bold numeric asset counts
                $sheet->getStyle("D{$row}:E{$row}")->getFont()->setBold(true);
            }

            $sheet->getRowDimension($row)->setRowHeight(25);
        }

        // === Global Adjustments ===
        $sheet->getStyle("A1:E{$highestRow}")
            ->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

        return [];
    }
}
