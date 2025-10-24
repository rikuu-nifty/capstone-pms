<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

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
            'A' => 22, // Assignment ID
            'B' => 50, // Personnel-in-Charge
            'C' => 22, // Status
            'D' => 18, // Past Assets
            'E' => 18, // Current Assets
            'F' => 18, // Missing Assets
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        $title = trim((string) $sheet->getCell('A1')->getValue());
        if ($title === '') {
            $sheet->setCellValue('A1', 'Office of the Administrative Services');
        }

        $sheet->mergeCells('A1:F1');
        $sheet->getStyle('A1:F1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1:F1')->getAlignment()->setHorizontal('center');

        $headerRow = null;
        for ($r = 1; $r <= $highestRow; $r++) {
            $a = strtoupper(trim((string) $sheet->getCell("A{$r}")->getValue()));
            if ($a === 'ASSIGNMENT ID') {
                $headerRow = $r;
                $sheet->getStyle("A{$r}:F{$r}")->getFont()->setBold(true);
                $sheet->getStyle("A{$r}:F{$r}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);
                $sheet->getStyle("A{$r}:F{$r}")
                    ->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFBFBFBF');
                $sheet->getStyle("A{$r}:F{$r}")
                    ->getBorders()
                    ->getBottom()
                    ->setBorderStyle(Border::BORDER_MEDIUM);
                break;
            }
        }

        for ($row = 1; $row <= $highestRow; $row++) {
            $value = trim((string) $sheet->getCell("A{$row}")->getValue());

            if ($headerRow && $row < $headerRow) {
                $sheet->getStyle("A{$row}:F{$row}")
                    ->getFill()->setFillType(Fill::FILL_NONE);
                $sheet->getRowDimension($row)->setRowHeight(22);
                continue;
            }

            if ($value && stripos($value, 'Unit / Department:') === 0) {
                $sheet->getStyle("A{$row}:F{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:F{$row}")
                    ->getAlignment()->setHorizontal('left')->setIndent(1);
                $sheet->getStyle("A{$row}:F{$row}")
                    ->getFill()->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFEAEAEA');
            } elseif ($value && stripos($value, 'Total for') === 0) {
                $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:C{$row}")
                    ->getAlignment()->setHorizontal('right');
                $sheet->getStyle("D{$row}:F{$row}")
                    ->getAlignment()->setHorizontal('center');
                $sheet->getStyle("A{$row}:F{$row}")
                    ->getFill()->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFF9F9F9');
                $sheet->getStyle("A{$row}:F{$row}")
                    ->getBorders()->getTop()
                    ->setBorderStyle(Border::BORDER_THIN);
            } elseif ($value && stripos($value, 'Grand Total:') === 0) {
                $sheet->getStyle("A{$row}:F{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:C{$row}")
                    ->getAlignment()->setHorizontal('right');
                $sheet->getStyle("D{$row}:F{$row}")
                    ->getAlignment()->setHorizontal('center');
                $sheet->getStyle("A{$row}:F{$row}")
                    ->getFill()->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFE0E7FF');
                $sheet->getStyle("A{$row}:F{$row}")
                    ->getBorders()->getTop()
                    ->setBorderStyle(Border::BORDER_THICK);
            } elseif (!$headerRow || $row > $headerRow) {
                $sheet->getStyle("A{$row}:F{$row}")
                    ->getAlignment()->setHorizontal('center');
                $sheet->getStyle("D{$row}")->getFont()->getColor()->setARGB('FF2563EB');
                $sheet->getStyle("E{$row}")->getFont()->getColor()->setARGB('FF16A34A');
                $sheet->getStyle("F{$row}")->getFont()->getColor()->setARGB('FFDC2626');
                $sheet->getStyle("D{$row}:F{$row}")->getFont()->setBold(true);
            }

            $sheet->getRowDimension($row)->setRowHeight(24);
        }

        $sheet->getStyle("A1:F{$highestRow}")
            ->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        return [];
    }
}
