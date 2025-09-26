<?php

namespace App\Exports;

use App\Models\OffCampus;
use App\Models\UnitOrDepartment;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Events\BeforeSheet;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;

class OffCampusReportExport implements FromCollection, WithHeadings, WithStyles, WithEvents, WithColumnWidths
{
    protected $filters;
    protected $generatedAt;
    protected $rowCount = 0;
    protected $records;

    public function __construct($filters = [])
    {
        $this->filters     = $filters;
        $this->generatedAt = Carbon::now()->format('F d, Y h:i A');
    }

    public function collection()
    {
        $query = OffCampus::with('collegeOrUnit')
            ->when($this->filters['from'] ?? null, fn($q, $from) => $q->whereDate('date_issued', '>=', $from))
            ->when($this->filters['to'] ?? null, fn($q, $to) => $q->whereDate('date_issued', '<=', $to))
            ->when($this->filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->when($this->filters['department_id'] ?? null, fn($q, $departmentId) => $q->where('college_or_unit_id', $departmentId))
            ->when($this->filters['requester_name'] ?? null, fn($q, $requester) => $q->where('requester_name', 'like', "%{$requester}%"));

        // ✅ store dataset
        $this->records = $query->get();

        $counter = 1;

        return $this->records->map(function ($r) use (&$counter) {
            $this->rowCount++;

            // ✅ Normalize status & remarks (convert snake_case → Title Case)
            $status = $r->status ? ucwords(str_replace('_', ' ', $r->status)) : '—';
            $remarks = $r->remarks ? ucwords(str_replace('_', ' ', $r->remarks)) : '—';

            return [
                '#'             => $counter++,
                'Requester Name'=> $r->requester_name,
                'Department'    => $r->collegeOrUnit->name ?? '—',
                'Purpose'       => $r->purpose,
                'Date Issued'   => $r->date_issued ? Carbon::parse($r->date_issued)->format('M d, Y') : '—',
                'Return Date'   => $r->return_date ? Carbon::parse($r->return_date)->format('M d, Y') : '—',
                'Status'        => $status,
                'Quantity'      => $r->quantity,
                'Units'         => $r->units,
                'Remarks'       => $remarks,
                'Approved By'   => $r->approved_by ?? '—',
            ];
        });
    }

    public function headings(): array
    {
        if ($this->records === null) {
            $this->collection();
        }

        return [
            ['ANGELES UNIVERSITY FOUNDATION'],
            ['Angeles City'],
            ['Property Management Office'],
            ['Generated: ' . $this->generatedAt],
            ['Off-Campus Report ' . $this->getHeaderDateRange($this->records)],
            [], // spacer row
            ['#','Requester Name','Department','Purpose','Date Issued',
             'Return Date','Status','Quantity','Units','Remarks','Approved By']
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
                    ->map(fn($r) => $r->date_issued ?? $r->created_at)
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
            BeforeSheet::class => function (BeforeSheet $event) {
                $row = 6;
                $labels = [
                    'from' => 'From',
                    'to'   => 'To',
                    'department_id' => 'Department',
                    'status' => 'Status',
                    'requester_name' => 'Requester',
                ];

                if (!empty(array_filter($this->filters))) {
                    $event->sheet->setCellValue("A{$row}", 'Filters Applied:');
                    $col = 'B';

                    foreach ($this->filters as $key => $val) {
                        if (!empty($val) && isset($labels[$key])) {
                            $label = $labels[$key];
                            $display = $val;

                           // ✅ Format values properly
                if (in_array($key, ['from', 'to'])) {
                    $display = Carbon::parse($val)->format('M d, Y');
                }

                if ($key === 'department_id') {
                    $display = UnitOrDepartment::find($val)?->name ?? $val;
                }

                if ($key === 'status') {
                    // convert snake_case → Title Case
                    $display = ucwords(str_replace('_', ' ', $val));
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
                $event->sheet->setCellValue("A{$totalsRow}", "Total Requests: {$this->rowCount}");

                $event->sheet->getStyle("A{$totalsRow}:K{$totalsRow}")->applyFromArray([
                    'font' => ['bold' => true],
                    'alignment' => ['horizontal' => 'center'],
                    'fill' => ['fillType' => 'solid','color' => ['rgb' => 'D9E1F2']],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN,'color' => ['rgb' => '000000']]],
                ]);

                $event->sheet->getStyle("A{$newHeaderRow}:K{$newHeaderRow}")->applyFromArray([
                    'font' => ['bold' => true],
                    'alignment' => ['horizontal' => 'center'],
                    'fill' => ['fillType' => 'solid','color' => ['rgb' => 'D9E1F2']],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN,'color' => ['rgb' => '000000']]],
                ]);

                $lastRow = $event->sheet->getHighestRow();
                $event->sheet->getStyle("A" . ($newHeaderRow+1) . ":K{$lastRow}")->applyFromArray([
                    'alignment' => ['horizontal' => 'center','vertical' => 'center'],
                    'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN,'color' => ['rgb' => '000000']]],
                ]);
            }
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 16,
            'B' => 25,
            'C' => 25,
            'D' => 35,
            'E' => 30,
            'F' => 18,
            'G' => 20,
            'H' => 10,
            'I' => 12,
            'J' => 25,
            'K' => 25,
        ];
    }
}
