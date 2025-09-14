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
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Events\BeforeSheet;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Carbon\Carbon;

class InventoryListReportExport implements FromCollection, WithHeadings, WithStyles, WithEvents, WithColumnWidths
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
        $query = InventoryList::with(['assetModel', 'category', 'unitOrDepartment', 'building', 'buildingRoom'])
            ->when($this->filters['from'] ?? null, fn($q, $from) => $q->whereDate('date_purchased', '>=', $from))
            ->when($this->filters['to'] ?? null, fn($q, $to) => $q->whereDate('date_purchased', '<=', $to))
            ->when($this->filters['department_id'] ?? null, fn($q, $id) => $q->where('unit_or_department_id', $id))
            ->when($this->filters['category_id'] ?? null, fn($q, $id) => $q->where('category_id', $id))
            ->when($this->filters['asset_type'] ?? null, fn($q, $type) => $q->where('asset_type', $type))
            ->when($this->filters['building_id'] ?? null, fn($q, $id) => $q->where('building_id', $id))
            ->when($this->filters['supplier'] ?? null, fn($q, $supplier) => $q->where('supplier', $supplier))
            ->when($this->filters['brand'] ?? null, function ($q, $brand) {
                $q->whereHas('assetModel', fn($m) => $m->where('brand', $brand));
            });

        $assets = $query->get();

        $counter = 1;

        return $assets->map(function ($asset) use (&$counter) {
            $this->rowCount++;
            $this->totalCost += $asset->unit_cost ?? 0;

            return [
                '#'               => $counter++,
                'MR No.'          => $asset->memorandum_no ?? '',
                'Asset Name'      => $asset->asset_name,
                'Brand / Model'   => ($asset->assetModel->brand ?? '') . ' / ' . ($asset->assetModel->model ?? ''),
                'Asset Type'      => $asset->asset_type === 'fixed' ? 'Fixed' : ($asset->asset_type === 'not_fixed' ? 'Not Fixed' : $asset->asset_type),
                'Category'        => $asset->category->name ?? '',
                'Unit/Department' => $asset->unitOrDepartment->name ?? '',
                'Building/Room'   => trim(($asset->building->name ?? '') . ' / ' . ($asset->buildingRoom->room ?? '')),
                'Supplier'        => $asset->supplier,
                'Date Purchased'  => $asset->date_purchased
                    ? Carbon::parse($asset->date_purchased)->format('M d, Y')
                    : '',
            ];
        });
    }

   public function headings(): array
{
    return [
        ['ANGELES UNIVERSITY FOUNDATION'],
        ['Angeles City'],
        ['Property Management Office'],
        ['Generated: ' . $this->generatedAt],
        ['Asset Inventory List Report ' . $this->getHeaderDateRange()],
        [], // spacer row
        ['#', 'MR No.', 'Asset Name', 'Brand / Model', 'Asset Type',
         'Category', 'Unit / Department', 'Building / Room',
         'Supplier', 'Date Purchased']
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
        $sheet->mergeCells('A1:J1');
        $sheet->mergeCells('A2:J2');
        $sheet->mergeCells('A3:J3');
        $sheet->mergeCells('A4:J4');
        $sheet->mergeCells('A5:J5');

        return [
            1 => ['font' => ['bold' => true, 'size' => 14], 'alignment' => ['horizontal' => 'center']],
            2 => ['alignment' => ['horizontal' => 'center']],
            3 => ['font' => ['italic' => true], 'alignment' => ['horizontal' => 'center']],
            4 => ['font' => ['size' => 10], 'alignment' => ['horizontal' => 'center']],
            5 => ['font' => ['bold' => true, 'size' => 12], 'alignment' => ['horizontal' => 'center']],
        ];
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
                            } elseif ($key === 'asset_type') {
                                $display = $val === 'fixed' ? 'Fixed' : ($val === 'not_fixed' ? 'Not Fixed' : $val);
                            } elseif ($key === 'report_type') {
                                $display = $val === 'inventory_list'
                                    ? 'Asset Inventory List'
                                    : ($val === 'new_purchases' ? 'Summary of Newly Purchased Equipment' : $val);
                            }

                            $event->sheet->setCellValue("{$col}{$row}", "{$label}: {$display}");
                            $col++;
                        }
                    }
                }
            },

      AfterSheet::class => function (AfterSheet $event) {
    // Where the headers are right now (# MR No. ...)
    $headerRow = 7;

    // Insert totals row above them
    $event->sheet->insertNewRowBefore($headerRow, 1);

    $totalsRow = $headerRow;        // Totals will go here
    $newHeaderRow = $headerRow + 1; // Headers are pushed down

    // --- Totals row ---
    $event->sheet->mergeCells("A{$totalsRow}:E{$totalsRow}");
    $event->sheet->mergeCells("F{$totalsRow}:J{$totalsRow}");

    $formattedAmount = '₱' . number_format($this->totalCost, 2);

    $event->sheet->setCellValue("A{$totalsRow}", "Total Assets: {$this->rowCount}");
    $event->sheet->setCellValue("F{$totalsRow}", "Total Amount: {$formattedAmount}");

    // --- Style totals row ---
    $event->sheet->getStyle("A{$totalsRow}:J{$totalsRow}")->applyFromArray([
        'font' => ['bold' => true],
        'alignment' => ['horizontal' => 'center'],
        'fill' => [
            'fillType' => 'solid',
            'color' => ['rgb' => 'D9E1F2'],
        ],
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => '000000'],
            ],
        ],
    ]);


    // --- Style headers row (now row 8) ---
    $event->sheet->getStyle("A{$newHeaderRow}:J{$newHeaderRow}")->applyFromArray([
        'font' => ['bold' => true],
        'alignment' => ['horizontal' => 'center'],
        'fill' => [
            'fillType' => 'solid',
            'color' => ['rgb' => 'D9E1F2'],
        ],
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => '000000'],
            ],
        ],
    ]);

    // --- Apply table borders and center values ---
$lastRow = $event->sheet->getHighestRow(); // finds the last row with data
$event->sheet->getStyle("A{$newHeaderRow}:J{$lastRow}")->applyFromArray([
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

    public function columnWidths(): array
    {
        return [
            'A' => 15,   // #
            'B' => 12,   // MR No.
            'C' => 20,   // Asset Name
            'D' => 40,   // Brand / Model
            'E' => 15,   // Asset Type
            'F' => 25,   // Category
            'G' => 25,   // Unit / Department
            'H' => 25,   // Building / Room
            'I' => 40,   // Supplier
            'J' => 18,   // Date Purchased
        ];
    }
}
