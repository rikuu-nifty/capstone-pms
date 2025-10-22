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
use PhpOffice\PhpSpreadsheet\Style\Color;
use Carbon\Carbon;

class InventoryListReportExport implements FromCollection, WithHeadings, WithStyles, WithEvents, WithColumnWidths
{
    protected $filters;
    protected $generatedAt;
    protected $rowCount = 0;
    protected $totalCost = 0;
    protected $assets;

    public function __construct($filters = [])
    {
        $this->filters     = $filters;
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

        // store results
        $this->assets = $query->get();

        $counter = 1;

        return $this->assets->map(function ($asset) use (&$counter) {
            $this->rowCount++;
            $this->totalCost += $asset->unit_cost ?? 0;

            return [
                '#'               => $counter++,
                'MR No.'          => $asset->memorandum_no ?? '',
                'Asset Name'      => $asset->asset_name,
                'Brand / Model'   => ($asset->assetModel->brand ?? '') . ' / ' . ($asset->assetModel->model ?? ''),
                'Asset Type'      => $asset->asset_type === 'fixed' ? 'Fixed' : ($asset->asset_type === 'not_fixed' ? 'Not Fixed' : $asset->asset_type),
                'Status'          => ucfirst($asset->status ?? '-'),
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
        // Ensure dataset is loaded before building header
        if ($this->assets === null) {
            $this->collection();
        }

        return [
            ['ANGELES UNIVERSITY FOUNDATION'],
            ['Angeles City'],
            ['Property Management Office'],
            ['Generated: ' . $this->generatedAt],
            ['Asset Inventory List Report ' . $this->getHeaderDateRange($this->assets)],
            [], // spacer row
            [
                '#', 
                'MR No.', 
                'Asset Name', 
                'Brand / Model', 
                'Asset Type',
                'Status',
                'Category', 
                'Unit / Department', 
                'Building / Room',
                'Supplier', 
                'Date Purchased'
            ]
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
        $sheet->mergeCells('A1:K1');
        $sheet->mergeCells('A2:K2');
        $sheet->mergeCells('A3:K3');
        $sheet->mergeCells('A4:K4');
        $sheet->mergeCells('A5:K5');

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
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // === Totals row ===
                $headerRow = 7;
                $sheet->insertNewRowBefore($headerRow, 1);
                $totalsRow = $headerRow;
                $newHeaderRow = $headerRow + 1;

                $sheet->mergeCells("A{$totalsRow}:E{$totalsRow}");
                $sheet->mergeCells("F{$totalsRow}:K{$totalsRow}");

                $formattedAmount = '₱' . number_format($this->totalCost, 2);
                $sheet->setCellValue("A{$totalsRow}", "Total Assets: {$this->rowCount}");
                $sheet->setCellValue("F{$totalsRow}", "Total Amount: {$formattedAmount}");

                $sheet->getStyle("A{$totalsRow}:K{$totalsRow}")->applyFromArray([
                    'font' => ['bold' => true],
                    'alignment' => ['horizontal' => 'center'],
                    'fill' => ['fillType' => 'solid', 'color' => ['rgb' => 'D9E1F2']],
                    'borders' => [
                        'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']],
                    ],
                ]);

                // Header styling
                $sheet->getStyle("A{$newHeaderRow}:K{$newHeaderRow}")->applyFromArray([
                    'font' => ['bold' => true],
                    'alignment' => ['horizontal' => 'center'],
                    'fill' => ['fillType' => 'solid', 'color' => ['rgb' => 'D9E1F2']],
                    'borders' => [
                        'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']],
                    ],
                ]);

                // === Apply borders + colors ===
                $startRow = $newHeaderRow + 1;
                $lastRow = $sheet->getHighestRow();

                for ($row = $startRow; $row <= $lastRow; $row++) {
                    $statusCell = strtoupper(trim($sheet->getCell("F{$row}")->getValue())); // STATUS column

                    // Color-code statuses
                    if ($statusCell === 'ACTIVE') {
                        $sheet->getStyle("F{$row}")->getFont()->getColor()->setARGB('FF15803D');
                        $sheet->getStyle("F{$row}")->getFont()->setBold(true);
                    } elseif ($statusCell === 'ARCHIVED') {
                        $sheet->getStyle("F{$row}")->getFont()->getColor()->setARGB('FFEA580C'); // orange
                        $sheet->getStyle("F{$row}")->getFont()->setBold(true);
                    } elseif ($statusCell === 'MISSING') {
                        $sheet->getStyle("F{$row}")->getFont()->getColor()->setARGB('FFDC2626'); // red
                        $sheet->getStyle("F{$row}")->getFont()->setBold(true);
                    } else {
                        $sheet->getStyle("F{$row}")->getFont()->getColor()->setARGB('FF555555'); // gray
                    }

                    // Borders and alignment for all rows
                    $sheet->getStyle("A{$row}:K{$row}")->applyFromArray([
                        'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => '000000'],
                            ],
                        ],
                    ]);
                }
            },
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,
            'B' => 16,
            'C' => 20,
            'D' => 40,
            'E' => 18,
            'F' => 16,
            'G' => 22,
            'H' => 25,
            'I' => 25,
            'J' => 25,
            'K' => 18,
        ];
    }
}
