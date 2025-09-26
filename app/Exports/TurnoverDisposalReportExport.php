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
            'A' => 6,   // #
            'B' => 12,  // Type
            'C' => 25,  // Issuing Office
            'D' => 25,  // Receiving Office
            'E' => 30,  // Asset Name
            'F' => 20,  // Category
            'G' => 25,  // Brand/Model
            'H' => 20,  // Serial No.
            'I' => 25,  // Building/Room
            'J' => 15,  // Status
            'K' => 30,  // Remarks
            'L' => 18,  // Document Date
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        // Title row (merged)
        $sheet->mergeCells('A1:L1');
        $sheet->getStyle('A1:L1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1:L1')->getAlignment()->setHorizontal('center');

        // Header row bold
        $sheet->getStyle('A3:L3')->getFont()->setBold(true);
        $sheet->getStyle('A3:L3')->getAlignment()->setHorizontal('center');

        // Borders for header
        $sheet->getStyle('A3:L3')->getBorders()->getBottom()
            ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);

        // Center align most columns
        $sheet->getStyle("A4:A{$highestRow}")->getAlignment()->setHorizontal('center');
        $sheet->getStyle("B4:B{$highestRow}")->getAlignment()->setHorizontal('center');
        $sheet->getStyle("J4:J{$highestRow}")->getAlignment()->setHorizontal('center');
        $sheet->getStyle("L4:L{$highestRow}")->getAlignment()->setHorizontal('center');

        // Wrap text for Remarks
        $sheet->getStyle("K4:K{$highestRow}")->getAlignment()->setWrapText(true);

        return [];
    }
}
