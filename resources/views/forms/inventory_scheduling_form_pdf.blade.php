@extends('forms.layout')

@section('title', 'Inventory Scheduling Form')

@push('styles')
<style>
    body {
        font-size: 11px !important;
    }

    table {
        border-collapse: collapse;
        width: 100%;
        font-size: 11px !important;
    }

    .header {
        text-align: center;
        margin-top: 20px;
        margin-bottom: 20px;
    }

    .header h3 {
        font-size: 15px;
        font-weight: 700;
        text-decoration: underline;
    }

    th,
    td {
        border: 1px solid #000;
        padding: 4px 6px;
        text-align: center;
        vertical-align: middle;
    }

    th {
        background: #f3f3f3;
        font-weight: 600;
    }

    /* --- Group Styles --- */
    .group-unit td {
        font-weight: bold;
        text-align: left;
        background: #f9f9f9;
    }

    .group-building td {
        font-style: italic;
        text-align: left;
        background: #fafafa;
        padding-left: 25px;
    }

    .room-row td {
        text-align: left;
        padding-left: 40px;
    }

    /* --- Signatories --- */
    .signature-block {
        margin-top: 50px;
        width: 100%;
        text-align: center;
        page-break-inside: avoid;
    }

    .signature-block td {
        border: none !important;
        padding: 8px;
        vertical-align: top;
        text-align: center;
    }

    .signature-line {
        width: 180px;
        border-top: 1px solid #000;
        margin: 40px auto 4px;
    }
</style>
@endpush

@section('content')
@php use Carbon\Carbon; @endphp

<div class="header">
    <h3>Inventory Scheduling Form</h3>
</div>

{{-- Main Table --}}
<table>
    <thead>
        <tr>
            <th style="width:30%;">UNIT / DEPT / LABORATORIES</th>
            <th style="width:10%;">Inventory<br>Schedule</th>
            <th style="width:12%;">Actual Date<br>of Inventory</th>
            <th style="width:10%;">Checked By<br>(PMO)</th>
            <th style="width:10%;">Verified By<br>(IA)</th>
            <th style="width:10%;">Inventory Copy<br>Received By</th>
            <th style="width:8%;">Date</th>
            <th style="width:10%;">Status</th>
        </tr>
    </thead>

    <tbody>
        @foreach($rows as $unit => $buildings)
        {{-- 🧱 UNIT HEADER --}}
        <tr class="group-unit">
            <td colspan="8">{{ strtoupper($unit) }}</td>
        </tr>

        @foreach($buildings as $building => $roomRows)
        {{-- 🏢 BUILDING HEADER --}}
        <tr class="group-building">
            <td colspan="8">{{ strtoupper($building) }}</td>
        </tr>

        @foreach($roomRows as $room)
        {{-- 🏠 ROOM ROWS --}}
        <tr class="room-row">
            <td>
                {{ $room['room'] }}
                @if(!empty($room['sub_area']) && $room['sub_area'] !== '—')
                — {{ $room['sub_area'] }}
                @endif
                @if($room['asset_count'])
                ({{ $room['asset_count'] }})
                @endif
            </td>
            <td>{{ Carbon::parse($schedule->inventory_schedule . '-01')->format('F') }}</td>
            <td>
                {{ $schedule->actual_date_of_inventory
                                ? Carbon::parse($schedule->actual_date_of_inventory)->format('F d, Y')
                                : '—' }}
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>{{ ucfirst($room['status']) }}</td>
        </tr>
        @endforeach
        @endforeach
        @endforeach
    </tbody>
</table>

{{-- 🖊️ SIGNATORIES --}}
<table class="signature-block">
    <tr>
        <td>
            Prepared By:
            <div class="signature-line"></div>
            <p style="font-weight:bold;">{{ strtoupper($schedule->preparedBy->name ?? '—') }}</p>
            <p style="font-size:11px; color:#555;">{{ $schedule->preparedBy->role_name ?? 'Property Clerk' }}</p>
        </td>
        <td>
            Approved By:
            <div class="signature-line"></div>
            @php $approved = $signatories['approved_by'] ?? null; @endphp
            <p style="font-weight:bold;">{{ strtoupper($approved->name ?? '—') }}</p>
            <p style="font-size:11px; color:#555;">{{ $approved->title ?? 'Head, Property Management' }}</p>
        </td>
        <td>
            Received By:
            <div class="signature-line"></div>
            @php $received = $signatories['received_by'] ?? null; @endphp
            <p style="font-weight:bold;">{{ strtoupper($received->name ?? '—') }}</p>
            <p style="font-size:11px; color:#555;">{{ $received->title ?? 'Internal Auditor' }}</p>
        </td>
    </tr>
</table>
@endsection