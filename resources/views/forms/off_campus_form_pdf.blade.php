@extends('forms.layout')

@section('title', 'Off Campus Form')

@push('styles')
<style>
    .header {
        text-align: center;
        margin-bottom: 25px;
        margin-top: 20px;
    }

    .header h3 {
        font-size: 15px;
        font-weight: 700;
        text-decoration: underline;
    }

    table.info {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 8px;
        font-size: 12px;
    }

    table.info td {
        border: none;
        padding: 4px 6px;
        vertical-align: middle;
        text-align: right;
    }

    .label-text {
        font-weight: 600;
        font-size: 12px;
    }

    .value-line {
        border-bottom: 1px solid #000;
        display: inline-block;
        min-width: 150px;
        text-align: center;
    }

    .auth {
        font-size: 12px;
        text-align: justify;
        line-height: 1.6;
        margin-top: 4px;
    }

    /* Checkbox styling (same as Turnover/Disposal Form) */
    .checkbox {
        display: inline-block;
        width: 10px;
        height: 10px;
        border: 1px solid #000;
        vertical-align: middle;
        margin-top: 5px;
        position: relative;
    }

    .checkbox.checked::after {
        content: "";
        position: absolute;
        left: 7px;
        top: -10px;
        width: 4px;
        height: 18px;
        border: solid #000;
        border-width: 0 1.2px 1.2px 0;
        transform: rotate(45deg);
    }

    table.assets {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        margin-top: -10px;
        page-break-inside: auto;
    }

    table.assets tr {
        page-break-inside: avoid;
        /* rows won't split across pages */
        page-break-after: auto;
    }

    table.assets th,
    table.assets td {
        border: 1px solid #000;
        padding: 5px 8px;
        text-align: center;
        vertical-align: top;
        word-wrap: break-word;
        white-space: normal;
    }

    table.assets th {
        background: #f3f3f3;
        font-weight: 600;
    }

    .remarks,
    .purpose {
        font-size: 12px;
        margin-top: 10px;
    }

    .signature-block {
        margin-top: 40px;
        text-align: center;
        page-break-inside: avoid;
    }

    .signature-line {
        width: 180px;
        border-top: 1px solid #000;
        margin: 40px auto 4px;
    }

    .continuation-page {
        page-break-before: always;
        /* force new page */
        page-break-inside: avoid;
        /* keep all content together */
        margin-top: 40px;
    }

    .signature-block {
        margin-top: 45px;
        text-align: center;
        page-break-inside: avoid;
    }

    /* Keep signature text compact and aligned */
    .signature-block p {
        margin: 2px 0;
    }

    .signature-block p[style*="font-weight:bold"] {
        margin-bottom: 3px;
    }

    .signature-line {
        width: 170px;
        border-top: 1px solid #000;
        margin: 40px auto 4px;
    }
</style>
@endpush

@section('content')
@php
use Carbon\Carbon;
$chunks = collect([$assets]); // render one continuous table
@endphp

<div class="header">
    <h3>Off Campus Form</h3>
</div>

<table class="info">
    <tr>
        <td>
            <span class="label-text">Date Issued:</span>
            <span class="value-line">
                {{ $offCampus->date_issued ? Carbon::parse($offCampus->date_issued)->format('F d, Y') : '—' }}
            </span>
        </td>
    </tr>
</table>

<p class="auth">
    This is to authorize Mr./Mrs.
    <strong><u>{{ strtoupper($offCampus->requester_name ?? '_________________') }}</u></strong>
    of College/Unit
    <strong><u>{{ strtoupper($offCampus->collegeOrUnit->name ?? '_________________') }}</u></strong>
    to bring in / take out from the Angeles University Foundation premises the following properties/equipment described as follows:
</p>

<table class="assets">
    <thead>
        <tr class="spacer-row">
            <td colspan="4" style="height:10px; border:none; border-bottom:1px solid #000; background:#fff;"></td>
        </tr>
        <tr>
            <th style="width:10%;">Quantity</th>
            <th style="width:15%;">Units</th>
            <th style="width:50%;">Items / Description</th>
            <th style="width:25%;">Comments</th>
        </tr>
    </thead>
    <tbody>
        @foreach($assets as $a)
        <tr>
            <td>1</td>
            <td>{{ strtoupper($offCampus->units ?? '—') }}</td>
            <td>
                {{ $a->asset_name ?? '—' }}
                @if($a->assetModel)
                <br><small>Brand: {{ $a->assetModel->brand ?? '—' }}, Model: {{ $a->assetModel->model ?? '—' }}</small>
                @endif
                @if($a->serial_no)
                <br><small>Serial: {{ $a->serial_no }}</small>
                @endif
            </td>
            <td>{{ $offCampus->comments ?? '—' }}</td>
        </tr>
        @endforeach
    </tbody>
</table>


<div class="continuation-page">
    @if($offCampus->purpose)
    <p class="purpose"><strong>Purpose:</strong> {{ $offCampus->purpose }}</p>
    @endif

    <p class="remarks">
        Approved for release for:
        <span class="checkbox {{ $offCampus->remarks === 'official_use' ? 'checked' : '' }}"></span>
        <span style="font-weight:bold; text-transform:uppercase;">Official Use</span>
        &nbsp;&nbsp;&nbsp;
        <span class="checkbox {{ $offCampus->remarks === 'repair' ? 'checked' : '' }}"></span>
        <span style="font-weight:bold; text-transform:uppercase;">Repair</span>
    </p>

    <p class="remarks">
        Above item shall be returned on or before
        <strong><u>{{ $offCampus->return_date ? Carbon::parse($offCampus->return_date)->format('F d, Y') : '—' }}</u></strong>,
        the requester will be responsible for any damages incurred while the items are in his/her possession.
    </p>

    {{-- SIGNATORIES --}}
    <div class="signature-block">
        <div style="display:inline-block; width:30%; vertical-align:top;">
            <p>Requester:</p>
            <div class="signature-line"></div>
            <p style="font-weight:bold;">{{ strtoupper($offCampus->requester_name ?? '—') }}</p>
            <p style="font-size:11px;">Personnel</p>
        </div>

        <div style="display:inline-block; width:30%; vertical-align:top;">
            <p>Approved By:</p>
            <div class="signature-line"></div>
            @if($offCampus->approved_by_name)
            <p style="font-weight:bold;">{{ strtoupper($offCampus->approved_by_name) }}</p>
            <p style="font-size:11px;">Dean / Head Concerned</p>
            @else
            <p style="color:#888;">—</p>
            <p style="font-size:11px;">Dean / Head Concerned</p>
            @endif
        </div>

        <div style="display:inline-block; width:30%; vertical-align:top;">
            <p>Issued By:</p>
            <div class="signature-line"></div>
            @php $issued = $signatories['issued_by'] ?? null; @endphp
            @if($issued && $offCampus->issued_by_signed)
            <p style="font-weight:bold;">{{ strtoupper($issued->name ?? '—') }}</p>
            <p style="font-size:11px;">{{ $issued->title ?? 'Head, PMO' }}</p>
            @else
            <p style="color:#888;">—</p>
            <p style="font-size:11px;">Head, PMO</p>
            @endif
        </div>

        <div style="display:inline-block; width:30%; vertical-align:top;">
            <p>Checked By:</p>
            <div class="signature-line"></div>
            <p style="font-weight:bold;">{{ strtoupper($offCampus->checked_by ?? '—') }}</p>
            <p style="font-size:11px;">Chief, Security Service</p>
        </div>
    </div>
</div>
@endsection