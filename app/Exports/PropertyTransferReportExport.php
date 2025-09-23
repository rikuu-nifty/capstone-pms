<?php

namespace App\Exports;

use App\Models\Transfer;
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

class PropertyTransferReportExport implements FromCollection, WithHeadings, WithStyles, WithEvents, WithColumnWidths
{
    protected $filters;
    protected $generatedAt;
    protected $rowCount = 0;

    public function __construct($filters = [])
    {
        $this->filters     = $filters;
        $this->generatedAt = Carbon::now()->format('F d, Y h:i A');
    }

    public function collection()
    {
        $query = Transfer::with([
            'currentBuildingRoom.building',
            'receivingBuildingRoom.building',
            'currentOrganization',
            'receivingOrganization',
            'assignedBy',
            'transferAssets'
        ])
            ->when($this->filters['from'] ?? null, fn($q, $from) => $q->whereDate('scheduled_date', '>=', $from))
            ->when($this->filters['to'] ?? null, fn($q, $to) => $q->whereDate('scheduled_date', '<=', $to))
            ->when($this->filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->when($this->filters['department_id'] ?? null, fn($q, $id) =>
                $q->where('current_organization', $id)->orWhere('receiving_organization', $id)
            )
            ->when($this->filters['building_id'] ?? null, function ($q, $id) {
                $q->whereHas('currentBuildingRoom', fn($q2) => $q2->where('building_id', $id))
                  ->orWhereHas('receivingBuildingRoom', fn($q2) => $q2->where('building_id', $id));
            })
            ->when($this->filters['room_id'] ?? null, fn($q, $id) =>
                $q->where('current_building_room', $id)->orWhere('receiving_building_room', $id)
            );

        $transfers = $query->get();
        $counter = 1;

        return $transfers->map(function ($t) use (&$counter) {
            $this->rowCount++;

            return [
                '#'                 => $counter++,
                'Current Building'  => $t->currentBuildingRoom->building->name ?? '—',
                'Current Room'      => $t->currentBuildingRoom->room ?? '—',
                'Receiving Building'=> $t->receivingBuildingRoom->building->name ?? '—',
                'Receiving Room'    => $t->receivingBuildingRoom->room ?? '—',
                'Current Dept'      => $t->currentOrganization->name ?? '—',
                'Receiving Dept'    => $t->receivingOrganization->name ?? '—',
                'Assigned By'       => $t->assignedBy->name ?? '—',
                'Status'            => ucfirst(str_replace('_', ' ', $t->status)),
                'Assets'            => $t->transferAssets->count(),
                'Scheduled Date'    => $t->scheduled_date ? Carbon::parse($t->scheduled_date)->format('M d, Y') : '—',
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
            ['Property Transfer Report ' . $this->getHeaderDateRange()],
            [], // spacer row
            ['#','Current Building','Current Room','Receiving Building','Receiving Room',
             'Current Dept','Receiving Dept','Assigned By','Status','Assets','Scheduled Date']
        ];
    }

    protected function getHeaderDateRange(): string
    {
        $from = $this->filters['from'] ?? null;
        $to   = $this->filters['to'] ?? null;

        if ($from && $to) {
            return Carbon::parse($from)->year . '-' . Carbon::parse($to)->year;
        } elseif ($from) {
            $year = Carbon::parse($from)->year;
            return $year . '-' . ($year + 1);
        } elseif ($to) {
            $year = Carbon::parse($to)->year;
            return ($year - 1) . '-' . $year;
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
            BeforeSheet::class => function (BeforeSheet $event) {
                $row = 6;

                $labels = [
                    'from' => 'From',
                    'to' => 'To',
                    'department_id' => 'Unit / Department',
                    'building_id' => 'Building',
                    'room_id' => 'Room',
                    'status' => 'Status',
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

                // Totals row
                $event->sheet->insertNewRowBefore($headerRow, 1);
                $totalsRow = $headerRow;
                $event->sheet->mergeCells("A{$totalsRow}:K{$totalsRow}");
                $event->sheet->setCellValue("A{$totalsRow}", "Total Transfers: {$this->rowCount}");

                // Style totals row
                $event->sheet->getStyle("A{$totalsRow}:K{$totalsRow}")->applyFromArray([
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

                // Style headers row
                $event->sheet->getStyle("A{$newHeaderRow}:K{$newHeaderRow}")->applyFromArray([
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

                // Style data rows
                $lastRow = $event->sheet->getHighestRow();
                $event->sheet->getStyle("A" . ($newHeaderRow+1) . ":K{$lastRow}")->applyFromArray([
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
            'A' => 16,  // #
            'B' => 25, // Current Building
            'C' => 20, // Current Room
            'D' => 25, // Receiving Building
            'E' => 20, // Receiving Room
            'F' => 25, // Current Dept
            'G' => 25, // Receiving Dept
            'H' => 20, // Assigned By
            'I' => 15, // Status
            'J' => 10, // Assets
            'K' => 18, // Scheduled Date
        ];
    }
}
