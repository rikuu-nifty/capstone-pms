@extends('reports.layout')

@section('title', 'Off-Campus Report')

@section('content')
    @php
    use Carbon\Carbon;

    $from = $filters['from'] ?? null;
    $to   = $filters['to'] ?? null;

    $fromDate = $from ? Carbon::parse($from) : null;
    $toDate   = $to ? Carbon::parse($to) : null;

    if ($fromDate && $toDate) {
        // Case 1: both from + to provided
        $reportYear = $fromDate->year . '-' . $toDate->year;
    } elseif ($fromDate) {
        // Case 2: only 'from' provided → find latest available date in records
        $latestRecord = collect($records)
            ->pluck('date_issued')
            ->filter()
            ->map(fn($d) => Carbon::parse($d))
            ->max();

        $latestYear = $latestRecord ? $latestRecord->year : ($fromDate->year + 1);
        $reportYear = $fromDate->year . '-' . $latestYear;
    } elseif ($toDate) {
        // Case 3: only 'to' provided
        $reportYear = ($toDate->year - 1) . '-' . $toDate->year;
    } else {
        // Case 4: no filters → default current year span
        $year = now()->year;
        $reportYear = $year . '-' . ($year + 1);
    }
    @endphp

    {{-- Report Title --}}
    <div style="text-align:center; margin-bottom:20px;">
        <h3 style="margin-top:10px; margin-bottom:5px; font-weight:bold;">
            Off-Campus Report {{ $reportYear }}
        </h3>
    </div>

    <div style="border-top: 2px solid #000000; margin-top: 20px; margin-bottom: 15px;"></div>

    {{-- Filters summary --}}
    <div class="mb-6">
        <h3 style="color:#000;">Filters</h3>
        @php $f = $filters ?? []; @endphp

        @if (!empty($f) && collect($f)->filter()->isNotEmpty())
            @foreach ([
                'from' => 'From',
                'to' => 'To',
                'department_id' => 'Department',
                'status' => 'Status',
                'requester_name' => 'Requester',
            ] as $key => $label)
                @if (!empty($f[$key]))
                    @php
                        $display = $f[$key];

                        if (in_array($key, ['from', 'to'])) {
                            $display = Carbon::parse($f[$key])->format('M d, Y');
                        } elseif ($key === 'status') {
                            $display = ucwords(str_replace('_', ' ', $f[$key]));
                        } elseif ($key === 'department_id') {
                            $display = \App\Models\UnitOrDepartment::find($f[$key])?->name ?? $f[$key];
                        }
                    @endphp

                    <span class="pill mr-2">{{ $label }}: {{ $display }}</span>
                @endif
            @endforeach
        @else
            <span class="muted">No Filters Applied – showing all available records.</span>
        @endif
    </div>

    {{-- Totals --}}
    <div class="mb-6 totals">
        <strong>Total Off-Campus:</strong> {{ number_format(count($records)) }}
    </div>

    {{-- Table --}}
    <table width="100%" cellspacing="0" cellpadding="5">
        <thead>
            <tr class="spacer-row">
                <td colspan="11" style="height:20px; border:none; background:#fff;"></td>
            </tr>
            <tr>
                <th>#</th>
                <th>Requester Name</th>
                <th>Department</th>
                <th>Purpose</th>
                <th>Date Issued</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Quantity</th>
                <th>Units</th>
                <th>Remarks</th>
                <th>Approved By</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($records as $i => $r)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $r['requester_name'] ?? '—' }}</td>
                    <td>{{ $r['department'] ?? '—' }}</td>
                    <td>{{ $r['purpose'] ?? '—' }}</td>
                    <td>{{ !empty($r['date_issued']) ? Carbon::parse($r['date_issued'])->format('M d, Y') : '—' }}</td>
                    <td>{{ !empty($r['return_date']) ? Carbon::parse($r['return_date'])->format('M d, Y') : '—' }}</td>
                    <td>{{ ucwords(str_replace('_', ' ', $r['status'] ?? '—')) }}</td>
                    <td>{{ $r['quantity'] ?? 0 }}</td>
                    <td>{{ $r['units'] ?? '—' }}</td>
                    <td>{{ ucwords(str_replace('_', ' ', $r['remarks'] ?? '—')) }}</td>
                    <td>{{ $r['approved_by'] ?? '—' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
