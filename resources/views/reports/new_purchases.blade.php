@extends('reports.layout')

@section('title', 'Summary of Newly Purchased Equipment')

@section('content')
    @php
        use Carbon\Carbon;

        $from = $filters['from'] ?? null;
        $to = $filters['to'] ?? null;

        $fromDate = $from ? Carbon::parse($from) : null;
        $toDate = $to ? Carbon::parse($to) : null;

        if ($fromDate && $toDate) {
            // Case 1: Both from & to → fromYear-toYear
            $schoolYear = $fromDate->year . '-' . $toDate->year;
        } elseif ($fromDate) {
            // Case 2: Only from → fromYear–latestYear (based on assets)
            $latestYear = $assets->max(function ($a) {
                return $a->date_purchased ? Carbon::parse($a->date_purchased)->year : now()->year;
            });
            $schoolYear = $fromDate->year . '-' . $latestYear;
        } elseif ($toDate) {
            // Case 3: Only to → (toYear-1)-toYear
            $schoolYear = $toDate->year - 1 . '-' . $toDate->year;
        } else {
            // Case 4: No filters → current year-current year+1
            $year = now()->year;
            $schoolYear = $year . '-' . ($year + 1);
        }

        // ✅ Group assets into bulk purchases
        $groupedAssets = $assets
            ->groupBy(function ($a) {
                return implode('|', [
                    $a->date_purchased,
                    $a->memorandum_no,
                    $a->supplier,
                    $a->asset_name,
                    $a->unitOrDepartment?->name,
                    $a->unit_cost,
                ]);
            })
            ->map(function ($group) {
                $first = $group->first();
                return (object) [
                    'date_purchased' => $first->date_purchased,
                    'memorandum_no' => $first->memorandum_no,
                    'supplier' => $first->supplier,
                    'asset_name' => $first->asset_name,
                    'unitOrDepartment' => $first->unitOrDepartment,
                    'unit_cost' => $first->unit_cost,
                    'qty' => $group->count(), // ✅ total quantity
                    'amount' => $group->sum('unit_cost'), // ✅ total cost
                ];
            });
    @endphp

    {{-- Dynamic report header --}}
    <div style="text-align:center; margin-bottom:20px;">
        <h3 style="margin-top:10px; margin-bottom:5px;">
            Summary of Newly Purchased Equipment {{ $schoolYear }}
        </h3>

        <div>
            @if ($fromDate && $toDate)
                @if ($fromDate->isSameMonth($toDate) && $fromDate->isSameYear($toDate))
                    For the month of {{ $fromDate->format('F Y') }}
                @else
                    For the period of {{ $fromDate->format('M j, Y') }}
                    to {{ $toDate->format('M j, Y') }}
                @endif
            @elseif ($fromDate)
                From {{ $fromDate->format('M j, Y') }}
            @elseif ($toDate)
                Up to {{ $toDate->format('M j, Y') }}
            @else
                For the month of {{ now()->format('F Y') }}
            @endif
        </div>
    </div>

    <div style="border-top: 2px solid #000000; margin-top: 30px; margin-bottom: 6px;"></div>

    {{-- Filters summary --}}
    <div class="mb-6">
        <h3 style="color:#000;">Filters</h3>
        @php $f = $filters ?? []; @endphp
        @if (collect($f)->filter()->isEmpty())
            <span class="muted">No filters applied</span>
        @else
            @foreach ([
            'from' => 'From',
            'to' => 'To',
            'department_id' => 'Department',
            'category_id' => 'Category',
            'asset_type' => 'Asset Type',
            'brand' => 'Brand',
            'supplier' => 'Supplier',
            'building_id' => 'Building',
            'condition' => 'Condition',
            'cost_min' => 'Min Cost',
            'cost_max' => 'Max Cost',
        ] as $key => $label)
                @if (!empty($f[$key]))
                    @if (in_array($key, ['from', 'to']))
                        <span class="pill mr-2">{{ $label }}:
                            {{ \Carbon\Carbon::parse($f[$key])->format('M j, Y') }}</span>
                    @elseif (in_array($key, ['cost_min', 'cost_max']))
                        <span class="pill mr-2">{{ $label }}: ₱{{ number_format($f[$key], 2) }}</span>
                    @else
                        <span class="pill mr-2">{{ $label }}: {{ $f[$key] }}</span>
                    @endif
                @endif
            @endforeach
        @endif
    </div>

    <div class="mb-6 totals">
        <strong>Total Assets:</strong> {{ number_format($totals['count'] ?? 0) }}
        @if (isset($totals['total_cost']))
            &nbsp; | &nbsp; <strong>Total Cost:</strong> ₱{{ number_format($totals['total_cost'], 2) }}
        @endif
    </div>

    {{-- Table --}}
    <table width="100%" cellspacing="0" cellpadding="5">
        <thead>
            {{-- Spacer row to create consistent top spacing on every new page (borderless) --}}
            <tr class="spacer-row">
                <td colspan="8"
                    style="height:20px;
                           border:none;
                           background:#fff;">
                </td>
            </tr>

            <tr>
                <th style="width:80px;">DATE</th>
                <th style="width:80px;">MR No.</th>
                <th style="width:120px;">SUPPLIER</th>
                <th>ITEM / DESCRIPTION</th>
                <th style="width:120px;">UNIT / DEPT</th>
                <th style="width:50px;">QTY</th>
                <th style="width:100px;">UNIT COST</th>
                <th style="width:100px;">AMOUNT</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($groupedAssets as $g)
                <tr>
                    <td>
                        {{ $g->date_purchased ? \Carbon\Carbon::parse($g->date_purchased)->format('M j, Y') : '-' }}
                    </td>
                    <td>{{ $g->memorandum_no ?? '-' }}</td>
                    <td>{{ $g->supplier ?? '-' }}</td>
                    <td>{{ $g->asset_name ?? '-' }}</td>
                    <td>{{ $g->unitOrDepartment?->name ?? '-' }}</td>
                    <td>{{ $g->qty }}</td>
                    <td>{{ $g->unit_cost ? '₱' . number_format($g->unit_cost, 2) : '-' }}</td>
                    <td>{{ $g->amount ? '₱' . number_format($g->amount, 2) : '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
