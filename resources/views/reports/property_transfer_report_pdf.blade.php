@extends('reports.layout')

@section('title', 'Property Transfer Report')

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
        // Case 2: only 'from' provided → get latest date from transfers
        $latestRecord = collect($transfers)
            ->pluck('scheduled_date') // 👈 or 'created_at' if scheduled_date is null
            ->filter()
            ->map(fn($d) => Carbon::parse($d))
            ->max();

        $latestYear = $latestRecord ? $latestRecord->year : ($fromDate->year + 1);
        $reportYear = $fromDate->year . '-' . $latestYear;
    } elseif ($toDate) {
        // Case 3: only 'to' provided → assume one year before
        $reportYear = ($toDate->year - 1) . '-' . $toDate->year;
    } else {
        // Case 4: no filters → default current year span
        $year = now()->year;
        $reportYear = $year . '-' . ($year + 1);
    }
@endphp


    <div style="text-align:center; margin-bottom:20px;">
        <h3 style="margin-top:10px; margin-bottom:5px; font-weight:bold;">
            Property Transfer Report {{ $reportYear }}
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
            'building_id' => 'Building',
            'room_id' => 'Room',
            'status' => 'Status',
        ] as $key => $label)
            @if (!empty($f[$key]))
                @if (in_array($key, ['from', 'to']))
                    <span class="pill mr-2">
                        {{ $label }}: {{ Carbon::parse($f[$key])->format('M d, Y') }}
                    </span>
                @elseif ($key === 'status')
                    <span class="pill mr-2">
                        {{ $label }}: {{ ucwords(str_replace('_', ' ', $f[$key])) }}
                    </span>
                @else
                    <span class="pill mr-2">{{ $label }}: {{ $f[$key] }}</span>
                @endif
            @endif
        @endforeach
    @else
        <span class="muted">No Filters Applied – showing all available records.</span>
    @endif
</div>



    {{-- Totals --}}
    <div class="mb-6 totals">
        <strong>Total Transfers:</strong> {{ number_format(count($transfers)) }}
    </div>

    {{-- Table --}}
    <table width="100%" cellspacing="0" cellpadding="5">
        <thead>
            <tr class="spacer-row">
                <td colspan="9" style="height:20px; border:none; background:#fff;"></td>
            </tr>
            <tr>
                <th style="width:36px;">#</th>
                <th>CURRENT DEPARTMENT</th>
                <th>CURRENT BUILDING</th>
                <th>CURRENT ROOM</th>
                <th>RECEIVING DEPARTMENT</th>
                <th>RECEIVING BUILDING</th>
                <th>RECEIVING ROOM</th>
                <th>STATUS</th>
                <th>SCHEDULED DATE</th>
                <th>ASSETS</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($transfers as $i => $t)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $t->currentOrganization->name ?? '—' }}</td>
                    <td>{{ optional($t->currentBuildingRoom->building)->name ?? '—' }}</td>
                    <td>{{ optional($t->currentBuildingRoom)->room ?? '—' }}</td>
                    <td>{{ $t->receivingOrganization->name ?? '—' }}</td>
                    <td>{{ optional($t->receivingBuildingRoom->building)->name ?? '—' }}</td>
                    <td>{{ optional($t->receivingBuildingRoom)->room ?? '—' }}</td>
                    <td>{{ ucwords(str_replace('_', ' ', $t->status)) }}</td>
                    <td>
                        {{ $t->scheduled_date ? Carbon::parse($t->scheduled_date)->format('M d, Y') : '—' }}
                    </td>
                    <td>{{ $t->transferAssets->count() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
