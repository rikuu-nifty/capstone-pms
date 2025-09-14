<?php

namespace App\Exports;

use App\Models\InventoryList;
use App\Models\UnitOrDepartment;
use App\Models\Category;
use App\Models\Building;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Events\BeforeSheet;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Carbon\Carbon;

class NewPurchasesSummaryExport implements FromCollection, WithHeadings, WithStyles, WithEvents, WithColumnFormatting, WithColumnWidths
{
    protected $filters;
    protected $generatedAt;
    protected $rowCount = 0;
    protected $totalCost = 0;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
        $this->generatedAt = Carbon::now()->format('F d, Y h:i A');
    }

    public function collection()
    {
        $query = InventoryList::with(['assetModel', 'unitOrDepartment'])
            ->when($this->filters['from'] ?? null, fn($q, $from) => $q->whereDate('date_purchased', '>=', $from))
            ->when($this->filters['to'] ?? null, fn($q, $to) => $q->whereDate('date_purchased', '<=', $to))
            ->when($this->filters['department_id'] ?? null, fn($q, $id) => $q->where('unit_or_department_id', $id))
            ->when($this->filters['category_id'] ?? null, fn($q, $id) => $q->where('category_id', $id))
            ->when($this->filters['supplier'] ?? null, fn($q, $supplier) => $q->where('supplier', $supplier));

        $assets = $query->get();

        $grouped = $assets->groupBy(function ($asset) {
            return implode('|', [
                $asset->date_purchased,
                $asset->memorandum_no,
                $asset->supplier,
                $asset->asset_name,
                $asset->assetModel->brand ?? '',
                $asset->assetModel->model ?? '',
                $asset->unitOrDepartment->name ?? '',
                $asset->unit_cost ?? 0,
            ]);
        });

      $mapped = $grouped->map(function ($group) {
    $first = $group->first();
    $qty = $group->count();
    $amount = $qty * ($first->unit_cost ?? 0);

    // ✅ Track totals correctly
    $this->rowCount += $qty; // count ALL assets, not just rows
    $this->totalCost += $amount;

    return [
        'Date'        => $first->date_purchased
            ? Carbon::parse($first->date_purchased)->format('M d, Y')
            : '',
        'MR No.'      => $first->memorandum_no ?? '',
        'Supplier'    => $first->supplier,
        'Item / Desc' => $first->asset_name
            . ' (' . ($first->assetModel->brand ?? '') . ' / ' . ($first->assetModel->model ?? '') . ')'
            . ($first->description ? ' - ' . $first->description : ''),
        'Unit / Dept' => $first->unitOrDepartment->name ?? '',
        'Qty'         => $qty,
        'Unit Cost'   => $first->unit_cost ?? 0,
        'Amount'      => $amount,
    ];
})->values();


        return $mapped;
    }

    public function headings(): array
    {
        return [
            ['ANGELES UNIVERSITY FOUNDATION'],
            ['Angeles City'],
            ['Property Management Office'],
            ['Generated: ' . $this->generatedAt],
            ['Summary of Newly Purchased Equipment ' . $this->getHeaderDateRange()],
            [], // spacer row
            [
                'Date',
                'MR No.',
                'Supplier',
                'Item / Description',
                'Unit / Department',
                'Qty',
                'Unit Cost',
                'Amount',
            ],
        ];
    }

    protected function getHeaderDateRange(): string
    {
        $from = $this->filters['from'] ?? null;
        $to   = $this->filters['to'] ?? null;

        if ($from && $to) {
            $fromYear = Carbon::parse($from)->year;
            $toYear   = Carbon::parse($to)->year;

            if ($fromYear === $toYear) {
                return $fromYear . '-' . ($fromYear + 1);
            }

            return $fromYear . '-' . $toYear;
        }

        if ($from) {
            $fromYear = Carbon::parse($from)->year;
            return $fromYear . '-' . ($fromYear + 1);
        }

        if ($to) {
            $toYear = Carbon::parse($to)->year;
            return ($toYear - 1) . '-' . $toYear;
        }

        $baseYear = now()->year;
        return $baseYear . '-' . ($baseYear + 1);
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->mergeCells('A1:H1');
        $sheet->mergeCells('A2:H2');
        $sheet->mergeCells('A3:H3');
        $sheet->mergeCells('A4:H4');
        $sheet->mergeCells('A5:H5');

        $styles = [
            1 => ['font' => ['bold' => true, 'size' => 14], 'alignment' => ['horizontal' => 'center']],
            2 => ['alignment' => ['horizontal' => 'center']],
            3 => ['font' => ['italic' => true], 'alignment' => ['horizontal' => 'center']],
            4 => ['font' => ['size' => 10], 'alignment' => ['horizontal' => 'center']],
            5 => ['font' => ['bold' => true, 'size' => 12], 'alignment' => ['horizontal' => 'center']],
            7 => [
                'font' => ['bold' => true],
                'alignment' => ['horizontal' => 'center'],
                'fill' => [
                    'fillType' => 'solid',
                    'color' => ['rgb' => 'FCE4D6'], // light orange header background
                ],
            ],
        ];

        $lastRow = $sheet->getHighestRow();
        $lastCol = $sheet->getHighestColumn();

        $sheet->getStyle("A7:{$lastCol}{$lastRow}")
            ->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        $sheet->getStyle("A8:{$lastCol}{$lastRow}")
            ->getAlignment()->setHorizontal('center')->setVertical('center');

        return $styles;
    }

    public function registerEvents(): array
    {
        return [
            BeforeSheet::class => function (BeforeSheet $event) {
                $row = 6;

                $labels = [
                    'from' => 'From',
                    'to' => 'To',
                    'department_id' => 'Unit / Department',
                    'category_id' => 'Category',
                    'asset_type' => 'Asset Type',
                    'building_id' => 'Building',
                    'supplier' => 'Supplier',
                    'brand' => 'Brand',
                    'report_type' => 'Report Type',
                ];

                if (!empty(array_filter($this->filters))) {
                    $event->sheet->setCellValue("A{$row}", 'Filters Applied:');
                    $col = 'B';

                    foreach ($this->filters as $key => $val) {
                        if (!empty($val) && isset($labels[$key])) {
                            $label = $labels[$key];
                            $display = $val;

                            if (in_array($key, ['from', 'to'])) {
                                $display = Carbon::parse($val)->format('M d, Y');
                            }

                            if ($key === 'department_id') {
                                $display = UnitOrDepartment::find($val)?->name ?? $val;
                            } elseif ($key === 'category_id') {
                                $display = Category::find($val)?->name ?? $val;
                            } elseif ($key === 'building_id') {
                                $display = Building::find($val)?->name ?? $val;
                            } elseif ($key === 'report_type') {
                                $display = $val === 'new_purchases'
                                    ? 'Summary of Newly Purchased Equipment'
                                    : ($val === 'inventory_list' ? 'Asset Inventory List' : $val);
                            }

                            $event->sheet->setCellValue("{$col}{$row}", "{$label}: {$display}");
                            $col++;
                        }
                    }
                }
            },

        AfterSheet::class => function (AfterSheet $event) {
    $sheet = $event->sheet->getDelegate();

    // Row where headers are currently written (row 7: Date | MR No. ...)
    $headerRow = 7;

    // Insert a new row BEFORE headers for totals
    $sheet->insertNewRowBefore($headerRow, 1);

    $totalsRow = $headerRow;        // Totals row goes here
    $newHeaderRow = $headerRow + 1; // Headers are pushed down

    // Merge totals row cells
    $sheet->mergeCells("A{$totalsRow}:D{$totalsRow}");
    $sheet->mergeCells("E{$totalsRow}:H{$totalsRow}");

    // Format peso sign
    $formattedAmount = '₱' . number_format($this->totalCost, 2);

    // Set totals text
    $sheet->setCellValue("A{$totalsRow}", "Total Assets: {$this->rowCount}");
    $sheet->setCellValue("E{$totalsRow}", "Total Amount: {$formattedAmount}");

    // --- Style totals row ---
    $sheet->getStyle("A{$totalsRow}:H{$totalsRow}")->applyFromArray([
        'font' => ['bold' => true],
        'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
        'fill' => [
            'fillType' => 'solid',
            'color' => ['rgb' => 'FCE4D6'], // light yellow background
        ],
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => '000000'],
            ],
        ],
    ]);

    // --- Rewrite header row (now row 8) ---
    $headers = [
        'Date', 'MR No.', 'Supplier', 'Item / Description',
        'Unit / Department', 'Qty', 'Unit Cost', 'Amount'
    ];
    $sheet->fromArray([$headers], null, "A{$newHeaderRow}");

    // Style headers row
    $sheet->getStyle("A{$newHeaderRow}:H{$newHeaderRow}")->applyFromArray([
        'font' => ['bold' => true],
        'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
        'fill' => [
            'fillType' => 'solid',
            'color' => ['rgb' => 'FCE4D6'], // light orange header
        ],
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => '000000'],
            ],
        ],
    ]);

    // --- Apply borders + center alignment to data ---
    $lastRow = $sheet->getHighestRow();
    $sheet->getStyle("A{$newHeaderRow}:H{$lastRow}")->applyFromArray([
        'alignment' => [
            'horizontal' => 'center',
            'vertical'   => 'center',
        ],
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => '000000'],
            ],
        ],
    ]);
}
        ];
    }

    public function columnFormats(): array
    {
        return [
            'F' => NumberFormat::FORMAT_NUMBER,
            'G' => '"₱"#,##0.00_-',
            'H' => '"₱"#,##0.00_-',
        ];
    }

     public function columnWidths(): array
{
    return [
        'A' => 16, // Date
        'B' => 18, // MR No.
        'C' => 18, // Supplier
        'D' => 120, // Item / Description (widest)
        'E' => 25, // Unit / Department
        'F' => 25,  // Qty
        'G' => 25, // Unit Cost
        'H' => 25, // Amount
    ];
}
}
