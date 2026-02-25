@extends('forms.layout')

@section('title', 'Memorandum Receipt')

@section('office-name', 'PROPERTY MANAGEMENT OFFICE')

@section('hide-footer-text')
@endsection

@section('header-right')
    <div style="margin-top:63px; margin-right:35px; text-align:right;">
        <span style="
            display:inline-block;
            border-bottom:1px solid #000;
            padding: 0 6px 2px 6px;
            font-weight: bold;
            letter-spacing: 0.5px;
        ">
            M.R. No. {{ trim((string)($memo_no ?? '')) ?: '—' }}
        </span>
    </div>
@endsection


@push('styles')
<style>
    body { font-size: 11px !important; }

    .form-title { text-align: center; margin: 10px 0 8px; }
    .form-title h2 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        text-decoration: underline;
        letter-spacing: .3px;
    }

    .requester { font-size: 11px; margin: 6px 0 8px; }

    /* Main Table */
    table.main thead tr:first-child th {
    padding-top: 2px;
    padding-bottom: 2px;
    vertical-align: middle;
}
    table.main {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 11px;
    }
    table.main th, table.main td {
        border: 1px solid #000;
        padding: 6px 8px;
        vertical-align: top;
    }
    table.main th {
        background: #f3f3f3;
        text-align: center;
        font-weight: 700;
    }

    /* Columns */
    .col-desc { width: 44%; text-align: left; }
    .col-qty  { width: 7%;  text-align: center; }
    .col-cost { width: 15%; text-align: right; }

    /* remarks columns (no nested table) */
    .col-rem1, .col-rem2, .col-rem3 { width: 11.333%; } /* total ~34% */
    .remarks-head { background: #f3f3f3; font-weight: 700; text-align: center; }
    .remarks-cell { padding: 6px 6px; font-size: 10.5px; }

    .desc-title { font-weight: 700; }
    .desc-sub { font-size: 10px; margin-top: 2px; }

    .totals-row td {
        font-size: 11px;
        font-weight: 700;
        vertical-align: middle;
    }
    .date-label { font-style: italic; font-weight: 700; }

    .received-line { margin-top: 6px; font-size: 11px; }

    table.signatures {
        width: 100%;
        margin-top: 18px;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 11px;
    }
    table.signatures td {
        border: none !important;
        vertical-align: top;
        padding: 6px 6px;
    }

    .sig-line {
        display: inline-block;
        border-bottom: 1px solid #000;
        min-width: 220px;
        height: 16px;
    }
    .sig-line-date {
        display: inline-block;
        border-bottom: 1px solid #000;
        min-width: 110px;
        height: 16px;
        margin-left: 6px;
    }
    .sig-label { font-size: 10px; }
    .sig-name { font-weight: 700; margin-top: 2px; }
</style>
@endpush

@section('content')
@php
    $first = $assets->first();

    $totalQty  = $assets->sum(fn($a) => (float)($a->quantity ?? 0));
    $totalCost = $assets->sum(fn($a) => (float)($a->quantity ?? 0) * (float)($a->unit_cost ?? 0));

    $reqName = $first?->unitOrDepartment
        ? ($first->unitOrDepartment->name . (!empty($first->unitOrDepartment->code) ? ' (' . $first->unitOrDepartment->code . ')' : ''))
        : '—';

    $reqRoom = $first?->buildingRoom?->room ? ('Room ' . $first->buildingRoom->room) : null;
    $reqBldg = $first?->building?->name ?? null;
    $reqLocation = trim(implode(' – ', array_filter([$reqRoom, $reqBldg]))) ?: '—';

    $formattedDate = $first?->date_purchased
        ? \Carbon\Carbon::parse($first->date_purchased)->format('m/d/y')
        : '—';

    // Peso sign fix for DomPDF
    $peso = fn($n) =>
        '<span style="font-family: DejaVu Sans, sans-serif;">&#8369;</span> ' .
        number_format((float)$n, 2);
@endphp

<div class="form-title">
    <h2>MEMORANDUM RECEIPT</h2>
</div>

<div class="requester">
    <span style="font-weight:700;">Requester:</span>
    {{ $reqName }} – {{ $reqLocation }}
</div>

<table class="main">
    <thead>
    <tr>
        <th class="col-desc" rowspan="2">Description of item/s, Brand</th>
        <th class="col-qty" rowspan="2">QTY</th>
        <th class="col-cost" rowspan="2">Total cost</th>
        <th colspan="3">REMARKS</th>
    </tr>
    <tr>
        <th class="remarks-head col-rem1">Supplier</th>
        <th class="remarks-head col-rem2">Serial no./s</th>
        <th class="remarks-head col-rem3">Model</th>
    </tr>
</thead>


    <tbody>
        @foreach($assets as $a)
            @php $itemTotal = (float)($a->quantity ?? 0) * (float)($a->unit_cost ?? 0); @endphp

            <tr>
                <td class="col-desc">
                    <div class="desc-title">{{ $a->asset_name ?? '—' }}</div>
                    <div class="desc-sub">
                        {{ $a->assetModel->brand ?? '—' }}
                        @if(!empty($a->assetModel->model))
                            • {{ $a->assetModel->model }}
                        @endif
                    </div>
                </td>

                <td class="col-qty">
                    {{ $a->quantity ?? '—' }}
                </td>

                <td class="col-cost" style="font-weight:700;">
                    {!! $peso($itemTotal) !!}
                </td>

                {{-- ✅ Clean remarks cells (no nested table = no double lines) --}}
                <td class="remarks-cell col-rem1">{{ $a->supplier ?? '—' }}</td>
                <td class="remarks-cell col-rem2">{{ $a->serial_no ?? '—' }}</td>
                <td class="remarks-cell col-rem3">{{ $a->assetModel->model ?? '—' }}</td>
            </tr>
        @endforeach

        <tr class="totals-row">
            <td colspan="3">
                <span class="date-label">Date purchased:</span>
                <span style="font-weight:700;">{{ $formattedDate }}</span>
            </td>
            <td colspan="3" style="text-align:right;">
                Total Qty: {{ (int)$totalQty }}
                &nbsp;&nbsp;|&nbsp;&nbsp;
                Grand Total: {!! $peso($totalCost) !!}
            </td>
        </tr>
    </tbody>
</table>

<div class="received-line">
    ({{ (int)$totalQty }}) Received above items from Property Management Office in good order.
</div>

<table class="signatures">
    <tr>
        <td style="width:55%;">
            <div class="sig-label">(1) Prepared by:</div>
            <div class="sig-line"></div>
            <div class="sig-name">{{ $preparedByName }}</div>
            <div class="sig-label">Property Clerk</div>
            <div class="mt-1">
                <span class="sig-label">Date</span>
                <span class="sig-line-date"></span>
            </div>

            <div style="height:14px;"></div>

            <div class="sig-label">(2) Noted by:</div>
            <div class="sig-line"></div>
            <div class="sig-name">{{ $notedByName }}</div>
            <div class="sig-label">PMO Head</div>
            <div class="mt-1">
                <span class="sig-label">Date</span>
                <span class="sig-line-date"></span>
            </div>

            <div style="margin-top:18px; font-size:10px; line-height:1.2;">
                <div>AUF-FORM-AS/PMO-41</div>
                <div>Oct.01, 2014 • Rev.0</div>
            </div>
        </td>

        <td style="width:45%; text-align:center;">
            <div style="height:28px;"></div>
            <div class="sig-line" style="min-width:260px;"></div>
            <div class="sig-label">Signature over Printed name</div>
            <div class="mt-1">
                <span class="sig-label">Date</span>
                <span class="sig-line-date"></span>
            </div>
        </td>
    </tr>
</table>

@endsection
