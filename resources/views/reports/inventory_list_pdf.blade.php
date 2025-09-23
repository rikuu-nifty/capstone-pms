@extends('reports.layout')

@section('title', 'Asset Inventory List Report')

@section('content')
    @php
        use Carbon\Carbon;

        $from = $filters['from'] ?? null;
        $to = $filters['to'] ?? null;

        $fromDate = $from ? Carbon::parse($from) : null;
        $toDate = $to ? Carbon::parse($to) : null;

        if ($fromDate && $toDate) {
            // ✅ Both from & to → fromYear-toYear
            $reportYear = $fromDate->year . ' - ' . $toDate->year;
        } elseif ($fromDate) {
            // ✅ Only from → fromYear-latestYear
            $latestYear =
                $assets->max(function ($a) {
                    return $a->date_purchased ? Carbon::parse($a->date_purchased)->year : now()->year;
                }) ?? $fromDate->year;

            $reportYear = $fromDate->year . ' - ' . $latestYear;
        } elseif ($toDate) {
            // Case 3: only 'to' date provided → currentYear-toYear
             $reportYear = ($toDate->year - 1) . '-' . $toDate->year;
        } else {
            // ✅ Default → current year-current year+1
            $reportYear = now()->year . '-' . (now()->year + 1);
        }
    @endphp


    <div style="text-align:center; margin-bottom:20px;">
        <h3 style="margin-top:10px; margin-bottom:5px; font-weight:bold;">
            Asset Inventory List Report {{ $reportYear }}
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
                            {{ Carbon::parse($f[$key])->format('M d, Y') }}</span>
                    @elseif (in_array($key, ['cost_min', 'cost_max']))
                        <span class="pill mr-2">{{ $label }}: ₱{{ number_format($f[$key], 2) }}</span>
                    @else
                        <span class="pill mr-2">{{ $label }}: {{ $f[$key] }}</span>
                    @endif
                @endif
            @endforeach
        @endif
    </div>

    {{-- Totals --}}
    <div class="mb-6 totals">
        <strong>Total Assets:</strong> {{ number_format($totals['count'] ?? 0) }}
        @if (isset($totals['total_cost']))
            &nbsp; | &nbsp; <strong>Total Cost:</strong> ₱{{ number_format($totals['total_cost'], 2) }}
        @endif
    </div>

    {{-- Table --}}
    <table width="100%" cellspacing="0" cellpadding="5">
        <thead>
            <tr class="spacer-row">
                <td colspan="11" style="height:20px; border:none; background:#fff;"></td>
            </tr>
            <tr>
                <th style="width:36px;">#</th>
                <th>MR No.</th>
                <th>ASSET NAME</th>
                <th>BRAND</th>
                <th>MODEL</th>
                <th>ASSET TYPE</th>
                <th>CATEGORY</th>
                <th>UNIT / DEPARTMENT</th>
                <th>BUILDING / ROOM</th>
                <th>SUPPLIER</th>
                <th>DATE PURCHASED</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($assets as $i => $a)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $a->memorandum_no ?? '-' }}</td>
                    <td>{{ $a->asset_name }}</td>
                    <td>{{ $a->assetModel->brand ?? ($a->brand ?? '-') }}</td>
                    <td>{{ $a->assetModel->model ?? ($a->model ?? '-') }}</td>
                    <td>{{ $a->asset_type ?? '-' }}</td>
                    <td>{{ $a->category->name ?? '-' }}</td>
                    <td>{{ $a->unitOrDepartment->name ?? '-' }}</td>
                    <td>{{ $a->building->name ?? '-' }} / {{ $a->buildingRoom->room ?? '-' }}</td>
                    <td>{{ $a->supplier ?? '-' }}</td>
                    <td>{{ $a->date_purchased ? Carbon::parse($a->date_purchased)->format('M d, Y') : '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
