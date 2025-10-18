<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PersonnelAssignmentsDetailedExport implements FromView, WithColumnWidths, WithStyles
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
        return view('reports.personnel_assignments_detailed_excel', [
            'records' => $this->records,
            'filters' => $this->filters,
        ]);
    }

    public function columnWidths(): array
    {
        return [
            'A' => 26, // Code No.
            'B' => 36, // Asset Name
            'C' => 26, // Unit / Department
            'D' => 26, // Previously Assigned
            'E' => 26, // Personnel-in-Charge
            'F' => 20, // Date Assigned
            'G' => 34, // Status
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        // === HEADER ===
        $sheet->mergeCells('A1:G1');
        $sheet->getStyle('A1:G1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1:G1')->getAlignment()->setHorizontal('center');

        // Report details
        $sheet->getStyle('A2:A4')->getFont()->setBold(true);
        $sheet->getStyle('E2:E4')->getFont()->setBold(true);
        $sheet->getStyle('A2:G4')->getAlignment()->setHorizontal('left');

        // === Find table header dynamically ===
        $headerRow = null;
        for ($r = 1; $r <= $highestRow; $r++) {
            $value = strtoupper(trim((string) $sheet->getCell("A{$r}")->getValue()));
            if ($value === 'CODE NO.' || $value === 'CODE NO') {
                $headerRow = $r;
                break;
            }
        }
        if (!$headerRow) $headerRow = 8;

        // === Table header style ===
        $sheet->getStyle("A{$headerRow}:G{$headerRow}")
            ->getFont()->setBold(true);
        $sheet->getStyle("A{$headerRow}:G{$headerRow}")
            ->getAlignment()
            ->setHorizontal('center')
            ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER)
            ->setWrapText(true);
        $sheet->getStyle("A{$headerRow}:G{$headerRow}")
            ->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFF2F2F2');

        // === Row-based styling ===
        for ($row = $headerRow + 1; $row <= $highestRow; $row++) {
            $firstCell = trim((string) $sheet->getCell("A{$row}")->getValue());
            $statusCell = strtoupper((string) $sheet->getCell("G{$row}")->getValue());
            $previousAssigned = trim((string) $sheet->getCell("D{$row}")->getValue());

            // Group row
            if ($firstCell && stripos($firstCell, 'UNIT / DEPARTMENT:') === 0) {
                $sheet->getStyle("A{$row}:G{$row}")
                    ->getFont()->setBold(true)->getColor()->setARGB('FF053EB9');
                $sheet->getStyle("A{$row}:G{$row}")
                    ->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFDFDEDE');
                $sheet->getStyle("A{$row}:G{$row}")
                    ->getAlignment()->setHorizontal('left')->setIndent(3);
                continue;
            }

            // Regular rows
            $sheet->getStyle("A{$row}:G{$row}")
                ->getAlignment()
                ->setHorizontal('center')
                ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER)
                ->setWrapText(true);

            // Red for “Previously Assigned To” names
            if (!empty($previousAssigned) && $previousAssigned !== '—' && $previousAssigned !== '-') {
                $sheet->getStyle("D{$row}")
                    ->getFont()->getColor()->setARGB('FFDC2626'); // red
            }

            // === Status color mapping (Column G) ===
            if (str_contains($statusCell, 'INVENTORY')) {
                $sheet->getStyle("G{$row}")->getFont()->getColor()->setARGB('FF16A34A'); // green
                $sheet->getStyle("G{$row}")->getFont()->setBold(true);
            } elseif (str_contains($statusCell, 'TRANSFER')) {
                $sheet->getStyle("G{$row}")->getFont()->getColor()->setARGB('FF7E22CE'); // purple
                $sheet->getStyle("G{$row}")->getFont()->setBold(true);
            } elseif (str_contains($statusCell, 'TURNOVER/DISPOSAL')) {
                $sheet->getStyle("G{$row}")->getFont()->getColor()->setARGB('FFEA580C'); // orange
                $sheet->getStyle("G{$row}")->getFont()->setBold(true);
            } elseif (str_contains($statusCell, 'OFF-CAMPUS')) {
                $sheet->getStyle("G{$row}")->getFont()->getColor()->setARGB('FF2563EB'); // blue
                $sheet->getStyle("G{$row}")->getFont()->setBold(true);
            } elseif (str_contains($statusCell, 'NO RECENT ACTIVITY')) {
                $sheet->getStyle("G{$row}")->getFont()->getColor()->setARGB('FF555555'); // gray
            }

            $sheet->getRowDimension($row)->setRowHeight(-1);
        }

        // === Global wrapping ===
        $sheet->getDefaultRowDimension()->setRowHeight(-1);

        for ($row = $headerRow + 1; $row <= $highestRow; $row++) {
            $firstCell = trim((string) $sheet->getCell("A{$row}")->getValue());

            // Skip group department rows (e.g. "Unit / Department:")
            if ($firstCell && stripos($firstCell, 'UNIT / DEPARTMENT:') === 0) {
                continue;
            }

            // Apply wrap and vertical centering only to table data rows
            $sheet->getStyle("A{$row}:G{$row}")
                ->getAlignment()
                ->setWrapText(true)
                ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER)
                ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        }

        // Keep column widths fixed (prevent overflow)
        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(false);
        }

        return [];
    }
}
