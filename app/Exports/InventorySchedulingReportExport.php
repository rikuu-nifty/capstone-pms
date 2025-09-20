<?php

namespace App\Exports;

use App\Models\InventoryScheduling;
use App\Models\UnitOrDepartment;
use App\Models\Building;
use App\Models\BuildingRoom;
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

class InventorySchedulingReportExport implements FromCollection, WithHeadings, WithStyles, WithEvents, WithColumnWidths
{
    protected $filters;
    protected $generatedAt;
    protected $rowCount = 0;
    protected $schedules; // ✅ add this

    public function __construct($filters = [], $schedules = [])
    {
        $this->filters   = $filters;
        $this->schedules = $schedules;
        $this->generatedAt = Carbon::now()->format('F d, Y h:i A'); // 👈 add this
    }

    public function collection()
    {
        $query = InventoryScheduling::with([
            'unitOrDepartment', 'building', 'buildingRoom',
            'rooms', 'subAreas', 'preparedBy', 'designatedEmployee', 'assignedBy', 'assets'
        ])
            ->when($this->filters['from'] ?? null, fn($q, $from) => $q->whereDate('actual_date_of_inventory', '>=', $from))
            ->when($this->filters['to'] ?? null, fn($q, $to) => $q->whereDate('actual_date_of_inventory', '<=', $to))
            ->when($this->filters['department_id'] ?? null, fn($q, $id) => $q->where('unit_or_department_id', $id))
            ->when($this->filters['building_id'] ?? null, fn($q, $id) => $q->where('building_id', $id))
            ->when($this->filters['room_id'] ?? null, fn($q, $id) => $q->where('building_room_id', $id))
            ->when($this->filters['scheduling_status'] ?? null, fn($q, $status) => $q->where('scheduling_status', $status));

        $schedules = $query->get();

        $counter = 1;

        return $schedules->map(function ($s) use (&$counter) {
            $this->rowCount++;

              // ✅ Normalize status
                $status = $s->scheduling_status;
                if ($status === 'pending_review' || $status === 'Pending_Review') {
                    $status = 'Pending Review';
                }

            return [
                '#'          => $counter++,
                'Unit/Dept'  => $s->unitOrDepartment->name ?? '—',
                'Building'   => $s->building->name ?? ($s->buildings->pluck('name')->implode(', ') ?: '—'),
                'Room'       => $s->rooms->pluck('room')->implode(', ') ?: ($s->buildingRoom->room ?? '—'),
                'Sub-Areas'  => $s->subAreas->pluck('name')->implode(', ') ?: '—',
                'Prepared By' => $s->preparedBy->name ?? '—',
                'Designated Employee' => $s->designatedEmployee->name ?? '—',
                'Assigned By' => $s->assignedBy->name ?? '—',
                'Inventory Month' => $s->inventory_schedule ?? '—',
                'Actual Date' => $s->actual_date_of_inventory
                    ? Carbon::parse($s->actual_date_of_inventory)->format('M d, Y')
                    : '—',
                // ✅ Fix status label
                'Status'     => $status, // ✅ fixed
                'Assets'     => $s->assets->count(),
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
            ['Inventory Scheduling Report ' . $this->getHeaderDateRange()],
            [], // spacer row
            ['#', 'Unit/Dept', 'Building', 'Room', 'Sub-Areas', 'Prepared By',
             'Designated Employee', 'Assigned By', 'Inventory Month',
             'Actual Date', 'Status', 'Assets']
        ];
    }

    protected function getHeaderDateRange(): string
    {
        $from = $this->filters['from'] ?? null;
        $to   = $this->filters['to'] ?? null;

        if ($from && $to) {
            $fromYear = Carbon::parse($from)->year;
            $toYear   = Carbon::parse($to)->year;
            return $fromYear . '-' . $toYear;
        }

        if ($from) {
            $fromYear = Carbon::parse($from)->year;
            $latestYear = InventoryScheduling::max('actual_date_of_inventory')
                ? Carbon::parse(InventoryScheduling::max('actual_date_of_inventory'))->year
                : $fromYear + 1;
            return $fromYear . '-' . $latestYear;
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
        $sheet->mergeCells('A1:L1');
        $sheet->mergeCells('A2:L2');
        $sheet->mergeCells('A3:L3');
        $sheet->mergeCells('A4:L4');
        $sheet->mergeCells('A5:L5');

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
                    'building_id' => 'Building',
                    'room_id' => 'Room',
                    'scheduling_status' => 'Status',
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
                            } elseif ($key === 'building_id') {
                                $display = Building::find($val)?->name ?? $val;
                            } elseif ($key === 'room_id') {
                                $display = BuildingRoom::find($val)?->room ?? $val;
                            }

                            $event->sheet->setCellValue("{$col}{$row}", "{$label}: {$display}");
                            $col++;
                        }
                    }
                }
            },

           AfterSheet::class => function (AfterSheet $event) {
    $headerRow = 7;
    $newHeaderRow = $headerRow + 1;

    // Insert totals row
    $event->sheet->insertNewRowBefore($headerRow, 1);
    $totalsRow = $headerRow;

    // Merge across the full width (A → L)
    $event->sheet->mergeCells("A{$totalsRow}:L{$totalsRow}");

    // ✅ Only total schedules
    $event->sheet->setCellValue("A{$totalsRow}", "Total Schedules: {$this->rowCount}");

    // Style totals row
    $event->sheet->getStyle("A{$totalsRow}:L{$totalsRow}")->applyFromArray([
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

    // ✅ Style headers (row 8 now)
    $event->sheet->getStyle("A{$newHeaderRow}:L{$newHeaderRow}")->applyFromArray([
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

    // ✅ Center align values under B → L + apply borders to ALL values
    $lastRow = $event->sheet->getHighestRow();
    $event->sheet->getStyle("A" . ($newHeaderRow+1) . ":L{$lastRow}")->applyFromArray([
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
            'A' => 6,  // #
            'B' => 20, // Unit/Dept
            'C' => 20, // Building
            'D' => 45, // Room
            'E' => 55, // Sub-Areas
            'F' => 20, // Prepared By
            'G' => 20, // Designated Employee
            'H' => 20, // Assigned By
            'I' => 18, // Inventory Month
            'J' => 18, // Actual Date
            'K' => 18, // Status
            'L' => 10, // Assets
        ];
    }
}
