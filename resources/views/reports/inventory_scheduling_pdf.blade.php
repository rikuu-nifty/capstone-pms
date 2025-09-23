@extends('reports.layout')

@section('title', 'Inventory Scheduling Report')

@section('content')
    @php
        use Carbon\Carbon;

        $from = $filters['from'] ?? null;
        $to = $filters['to'] ?? null;

        $fromDate = $from ? Carbon::parse($from) : null;
        $toDate = $to ? Carbon::parse($to) : null;

        if ($fromDate && $toDate) {
            // Case 1: both provided
            $reportYear = $fromDate->year . '-' . $toDate->year;
        } elseif ($fromDate) {
            // Case 2: only from → fromYear up to latest available year
            $latestYear = $schedules->max(function ($s) {
                return $s->inventory_schedule ? Carbon::parse($s->inventory_schedule)->year : now()->year;
            });

            // ✅ fallback: if latestYear == fromYear, add +1
            if (!$latestYear || $latestYear == $fromDate->year) {
                $latestYear = $fromDate->year + 1;
            }

            $reportYear = $fromDate->year . '-' . $latestYear;
        } elseif ($toDate) {
            // Case 3: only 'to' date provided → currentYear-toYear
           $reportYear = ($toDate->year - 1) . '-' . $toDate->year;
        } else {
            // Case 4: default
            $year = now()->year;
            $reportYear = $year . '-' . ($year + 1);
        }
    @endphp





    <div style="text-align:center; margin-bottom:20px;">
        <h3 style="margin-top:10px; margin-bottom:5px; font-weight:bold;">
            Inventory Scheduling Report {{ $reportYear }}
        </h3>
    </div>

    <div style="border-top: 2px solid #000000; margin-top: 20px; margin-bottom: 15px;"></div>

    {{-- Filters summary --}}
    <div class="mb-6">
        <h3 style="color:#000;">Filters</h3>
        @php $f = $filters ?? []; @endphp
        @if (collect($f)->filter()->isEmpty())
            <span class="muted">No Filters Applied – showing all available records.</span>
        @else
            @foreach ([
            'from' => 'From',
            'to' => 'To',
            'department_id' => 'Department',
            'building_id' => 'Building',
            'room_id' => 'Room',
            'scheduling_status' => 'Status',
        ] as $key => $label)
                @if (!empty($f[$key]))
                    @if (in_array($key, ['from', 'to']))
                        <span class="pill mr-2">
                            {{ $label }}: {{ Carbon::parse($f[$key])->format('M d, Y') }}
                        </span>
                    @elseif ($key === 'scheduling_status')
                        {{-- ✅ Replace underscores with spaces --}}
                        <span class="pill mr-2">
                            {{ $label }}: {{ str_replace('_', ' ', $f[$key]) }}
                        </span>
                    @else
                        <span class="pill mr-2">{{ $label }}: {{ $f[$key] }}</span>
                    @endif
                @endif
            @endforeach
        @endif
    </div>
    {{-- Totals --}}
    <div class="mb-6 totals">
        <strong>Total Schedules:</strong> {{ number_format(count($schedules)) }}
    </div>

    {{-- Table --}}
    <table width="100%" cellspacing="0" cellpadding="5">
        <thead>
            <tr class="spacer-row">
                <td colspan="12" style="height:20px; border:none; background:#fff;"></td>
            </tr>
            <tr>
                <th style="width:36px;">#</th>
                <th>UNIT / DEPT</th>
                <th>BUILDING</th>
                <th>ROOM</th>
                <th>SUB-AREAS</th>
                <th>PREPARED BY</th>
                <th>DESIGNATED EMPLOYEE</th>
                <th>ASSIGNED BY</th>
                <th>INVENTORY MONTH</th>
                <th>ACTUAL DATE</th>
                <th>STATUS</th>
                <th>ASSETS</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($schedules as $i => $s)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $s->unitOrDepartment->name ?? '—' }}</td>
                    <td>
                        {{ $s->building->name ?? ($s->buildings->pluck('name')->implode(', ') ?: '—') }}
                    </td>

                    {{-- ROOM --}}
                    <td style="word-wrap: break-word; white-space: normal; word-break: break-all; max-width: 280px;">
                        @if ($s->rooms && $s->rooms->count() > 0)
                            {{ $s->rooms->pluck('room')->implode(', ') }}
                        @else
                            {{ $s->buildingRoom->room ?? '—' }}
                        @endif
                    </td>

                    {{-- SUB-AREAS --}}
                    <td style="word-wrap: break-word; white-space: normal; word-break: break-all; max-width: 320px;">
                        {{ $s->subAreas->pluck('name')->implode(', ') ?: '—' }}
                    </td>
                    <td>{{ $s->preparedBy->name ?? '—' }}</td>
                    <td>{{ $s->designatedEmployee->name ?? '—' }}</td>
                    <td>{{ $s->assignedBy->name ?? '—' }}</td>
                    <td>{{ $s->inventory_schedule ?? '—' }}</td>
                    <td>
                        {{ $s->actual_date_of_inventory ? Carbon::parse($s->actual_date_of_inventory)->format('M d, Y') : '—' }}
                    </td>
                    <td>{{ str_replace('_', ' ', $s->scheduling_status) }}</td>
                    <td>{{ $s->assets()->count() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
