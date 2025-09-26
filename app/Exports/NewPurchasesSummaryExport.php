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
    protected $assets; // ✅ store dataset

    public function __construct($filters = [])
    {
        $this->filters     = $filters;
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

        // ✅ store dataset
        $this->assets = $query->get();

        $grouped = $this->assets->groupBy(function ($asset) {
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
            $qty   = $group->count();
            $amount = $qty * ($first->unit_cost ?? 0);

            // ✅ Track totals correctly
            $this->rowCount += $qty;
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
        // ✅ ensure dataset is loaded before building header
        if ($this->assets === null) {
            $this->collection();
        }

        return [
            ['ANGELES UNIVERSITY FOUNDATION'],
            ['Angeles City'],
            ['Property Management Office'],
            ['Generated: ' . $this->generatedAt],
            ['Summary of Newly Purchased Equipment ' . $this->getHeaderDateRange($this->assets)], // ✅ dynamic range
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

    protected function getHeaderDateRange($records = null): string
    {
        $from = $this->filters['from'] ?? null;
        $to   = $this->filters['to'] ?? null;

        if ($from && $to) {
            return Carbon::parse($from)->year . '-' . Carbon::parse($to)->year;
        } elseif ($from) {
            $fromYear = Carbon::parse($from)->year;

            if ($records && $records->count() > 0) {
                $latestDate = collect($records)
                    ->map(fn($r) => $r->date_purchased ?? $r->created_at)
                    ->filter()
                    ->max();

                if ($latestDate) {
                    return $fromYear . '-' . Carbon::parse($latestDate)->year;
                }
            }

            return $fromYear . '-' . ($fromYear + 1);
        } elseif ($to) {
            $toYear = Carbon::parse($to)->year;
            return ($toYear - 1) . '-' . $toYear;
        }

        $year = now()->year;
        return $year . '-' . ($year + 1);
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
                    'color' => ['rgb' => 'FCE4D6'],
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
                            $label   = $labels[$key];
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

                $headerRow = 7;
                $sheet->insertNewRowBefore($headerRow, 1);

                $totalsRow   = $headerRow;
                $newHeaderRow = $headerRow + 1;

                $sheet->mergeCells("A{$totalsRow}:D{$totalsRow}");
                $sheet->mergeCells("E{$totalsRow}:H{$totalsRow}");

                $formattedAmount = '₱' . number_format($this->totalCost, 2);

                $sheet->setCellValue("A{$totalsRow}", "Total Assets: {$this->rowCount}");
                $sheet->setCellValue("E{$totalsRow}", "Total Amount: {$formattedAmount}");

                $sheet->getStyle("A{$totalsRow}:H{$totalsRow}")->applyFromArray([
                    'font' => ['bold' => true],
                    'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
                    'fill' => ['fillType' => 'solid', 'color' => ['rgb' => 'FCE4D6']],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => '000000'],
                        ],
                    ],
                ]);

                $headers = [
                    'Date', 'MR No.', 'Supplier', 'Item / Description',
                    'Unit / Department', 'Qty', 'Unit Cost', 'Amount'
                ];
                $sheet->fromArray([$headers], null, "A{$newHeaderRow}");

                $sheet->getStyle("A{$newHeaderRow}:H{$newHeaderRow}")->applyFromArray([
                    'font' => ['bold' => true],
                    'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
                    'fill' => ['fillType' => 'solid', 'color' => ['rgb' => 'FCE4D6']],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => '000000'],
                        ],
                    ],
                ]);

                $lastRow = $sheet->getHighestRow();
                $sheet->getStyle("A" . ($newHeaderRow+1) . ":H{$lastRow}")->applyFromArray([
                    'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
                    'borders'   => [
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
            'A' => 16,
            'B' => 18,
            'C' => 20,
            'D' => 120,
            'E' => 25,
            'F' => 25,
            'G' => 25,
            'H' => 25,
        ];
    }
}
