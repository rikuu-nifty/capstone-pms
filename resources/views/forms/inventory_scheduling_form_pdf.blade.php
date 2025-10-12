@extends('forms.layout')

@section('hide-footer-text')
@endsection

@section('title', 'Inventory Scheduling Form')

@push('styles')
<style>
    body {
        font-size: 11px !important;
        color: #111;
    }

    table {
        border-collapse: collapse;
        width: 100%;
        font-size: 11px !important;
        table-layout: fixed;
        word-wrap: break-word;
    }

    th,
    td {
        border: 1px solid #000;
        padding: 4px 6px;
        text-align: center;
        vertical-align: middle;
        word-break: break-word;
        /* breaks long words */
        white-space: normal;
        /* allows multi-line wrapping */
        overflow-wrap: anywhere;
    }

    th {
        background: #f3f3f3;
        font-weight: 600;
    }

    .header {
        text-align: center;
        margin-top: 20px;
        margin-bottom: 40px;
    }

    .header h3 {
        font-size: 15px;
        font-weight: 700;
        text-decoration: underline;
    }

    /* === GROUPED ROWS === */
    .group-unit td {
        font-weight: bold;
        background: #f9f9f9;
        text-align: left !important;
        padding-left: 25px;
        vertical-align: middle;
        white-space: normal;
        word-wrap: break-word;
    }

    .group-building td {
        text-align: left !important;
        background: #fafafa;
        padding-left: 70px;
        vertical-align: middle;
        white-space: normal;
        word-wrap: break-word;
        font-weight: 600;
    }

    .room-row td {
        text-align: center;
        vertical-align: middle;
        white-space: normal;
        word-wrap: break-word;
    }

    /* Slight offset so grouped text looks centered vertically under column */
    .group-unit td:first-child,
    .group-building td:first-child {
        padding-top: 6px;
        padding-bottom: 6px;
    }

    /* === SIGNATORIES === */
    .signature-block {
        margin-top: 50px;
        width: 100%;
        text-align: center;
        page-break-inside: avoid;
    }

    .signature-block td {
        border: none !important;
        /* padding: 8px; */
        padding: 20px 8px;
        vertical-align: top;
        text-align: center;
    }

    .signature-line {
        width: 180px;
        border-top: 1px solid #000;
        margin: 40px auto 4px;
    }

    /* Tighten spacing between signatory name and role/title */
    .signature-block p {
        margin: 2px 0;
        /* line-height: 1.1; */
    }

    .signature-block p[style*="font-weight:bold"] {
        margin-bottom: 3px;
    }
</style>
@endpush

@section('content')
@php use Carbon\Carbon; @endphp

<div class="header">
    <h3>Inventory Scheduling Form</h3>
</div>

<table>
    <thead>
        <tr>
            <th style="width:21%;">UNIT / DEPT / LABORATORIES</th>
            <th style="width:10%;">Inventory<br>Schedule</th>
            <th style="width:11%;">Actual Date<br>of Inventory</th>
            <th style="width:13%;">Checked By<br>(PMO)</th>
            <th style="width:13%;">Verified By<br>(IA)</th>
            <th style="width:13%;">Inventory Copy<br>Received By</th>
            <th style="width:11%;">Date</th>
            <th style="width:8%;">Status</th>
        </tr>
    </thead>

    <tbody>
        @if($schedule->scope_type === 'unit' && count($rows))
        {{-- UNIT SCOPE --}}
        @foreach($rows as $unit => $buildings)
        <tr class="group-unit">
            <td colspan="8">{{ strtoupper($unit) }}</td>
        </tr>

        @foreach($buildings as $building => $roomRows)
        <tr class="group-building">
            <td colspan="8">{{ strtoupper($building) }}</td>
        </tr>

        @foreach($roomRows as $room)
        <tr class="room-row">
            <td>
                {{ $room['room'] }}
                @if(!empty($room['asset_count']) && $room['asset_count'] > 0)
                ({{ $room['asset_count'] }})
                @endif
            </td>
            <td>{{ Carbon::parse($schedule->inventory_schedule . '-01')->format('F') }}</td>
            <td>
                {{ $schedule->actual_date_of_inventory
                ? Carbon::parse($schedule->actual_date_of_inventory)->format('F d, Y')
                : '—' }}
            </td>
            <td>{{ $schedule->checked_by ?? '' }}</td>
            <td>{{ $schedule->verified_by ?? '' }}</td>
            <td>{{ $schedule->received_by ?? '' }}</td>
            <td></td>
            <td>{{ ucfirst($room['status']) }}</td>
        </tr>
        @endforeach
        @endforeach
        @endforeach

        @else
        {{-- BUILDING SCOPE --}}
        @foreach($rows as $building => $roomRows)
        <tr class="group-unit">
            <td colspan="8">{{ strtoupper($building) }}</td>
        </tr>

        @foreach($roomRows as $room)
        <tr class="room-row">
            <td>
                {{ $room['room'] }}
                @if(!empty($room['asset_count']) && $room['asset_count'] > 0)
                ({{ $room['asset_count'] }})
                @endif
            </td>
            <td>{{ Carbon::parse($schedule->inventory_schedule . '-01')->format('F') }}</td>
            <td>
                {{ $schedule->actual_date_of_inventory
                ? Carbon::parse($schedule->actual_date_of_inventory)->format('F d, Y')
                : '—' }}
            </td>
            <td>{{ $schedule->checked_by ?? '' }}</td>
            <td>{{ $schedule->verified_by ?? '' }}</td>
            <td>{{ $schedule->received_by ?? '' }}</td>
            <td></td>
            <td>{{ ucfirst($room['status']) }}</td>
        </tr>
        @endforeach
        @endforeach
        @endif
    </tbody>

</table>

{{-- === SIGNATORIES === --}}
<table class="signature-block">
    <tr>
        {{-- Prepared By --}}
        <td style="font-size:12px; width: 50%;">
            <p>Prepared By:</p>
            <div class="signature-line"></div>
            <p style="font-weight:bold;">{{ strtoupper($schedule->preparedBy->name ?? '—') }}</p>
            <p style="font-size:11px;">{{ $schedule->preparedBy->role->name ?? 'Property Clerk' }}</p>
        </td>

        {{-- Approved By --}}
        <td style="font-size:12px; width: 50%;">
            <p>Approved By:</p>
            <div class="signature-line"></div>
            @php $approved = $signatories['approved_by'] ?? null; @endphp
            <p style="font-weight:bold;">{{ strtoupper($approved->name ?? '—') }}</p>
            <p style="font-size:11px;">{{ $approved->title ?? 'VP for Administration' }}</p>
        </td>
    </tr>
    <tr>
        {{-- Received By --}}
        <td style="font-size:12px; width: 50%;">
            <p>Received By:</p>
            <div class="signature-line"></div>
            @php $received = $signatories['received_by'] ?? null; @endphp
            <p style="font-weight:bold;">{{ strtoupper($received->name ?? '—') }}</p>
            <p style="font-size:11px;">{{ $received->title ?? 'Internal Auditor' }}</p>
        </td>

        {{-- Noted By --}}
        <td style="font-size:12px; width: 50%;">
            <p>Noted By:</p>
            <div class="signature-line"></div>
            @php $noted = $signatories['noted_by'] ?? null; @endphp
            <p style="font-weight:bold;">{{ strtoupper($noted->name ?? '—') }}</p>
            <p style="font-size:11px;">{{ $noted->title ?? 'Head, Property Management' }}</p>
        </td>
    </tr>
</table>
@endsection