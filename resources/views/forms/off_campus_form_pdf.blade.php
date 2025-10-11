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

    /* Checkbox styling */
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

    .continuation-page {
        page-break-before: always;
        page-break-inside: avoid;
        margin-top: 40px;
    }

    /* --- SIGNATURE BLOCK --- */
    .signature-block {
        margin-top: 35px;
        text-align: center;
        page-break-inside: avoid;
    }

    .signature-block table {
        border-collapse: collapse;
        border: none !important;
    }

    .signature-block td {
        border: none !important;
        vertical-align: top;
        padding: 10px 15px;
    }

    /* unified .signature-line rule */
    .signature-line {
        border-top: 1px solid #000;
        width: 65%;
        margin-top: 25px;
        margin-bottom: 5px;
        margin-left: 0;
        text-align: left;
    }

    /* nested alignment consistency */
    .signature-block table table {
        border: none !important;
        width: 100%;
        border-collapse: collapse;
    }

    .signature-block table table td {
        border: none !important;
        padding: 0;
        vertical-align: bottom;
    }

    /* text alignment for names and roles */
    .signature-block p {
        margin: 2px 0;
        line-height: 1.1;
        text-align: left;
    }

    .signature-block p[style*="font-weight:bold"] {
        margin-top: 2px;
        margin-bottom: 4px;
        /* adds 2px gap between name and role */
    }

    .signature-block p[style*="font-size:11px"] {
        margin-top: 0;
    }

    /* fine alignment for signatories */
    .sig-name {
        width: 65%;
        text-align: left;
        padding: 0;
    }

    .sig-date {
        width: 30%;
        text-align: left;
        padding: 0 0 0 8mm;
    }

    .name-box,
    .date-box {
        display: inline-block;
    }

    .name-box {
        width: 70%;
    }

    .date-box {
        width: 70%;
    }

    /* individual signature line spacing */
    .name-box .signature-line {
        width: 100%;
        margin: 25px 0 6px 0;
        /* adds space between line and name */
    }

    .date-box .signature-line {
        width: 100%;
        margin: 20px 0 6px 0;
        /* adds space between date line and label */
    }

    /* raise Date line & label slightly */
    .sig-date .date-box {
        position: relative;
        top: -16px;
        left: -45px;
    }

    .sig-date .date-text {
        margin-top: 2px;
        text-align: center;
        font-size: 11px;
    }

    /* consistent invisible placeholder */
    .signature-placeholder {
        visibility: hidden;
        font-size: 11px;
        display: block;
        height: 0;
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
            <td>{{ $offCampus->comments ?? '' }}</td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="4" style="text-align:center; font-size:12px; padding-top:6px; border:none;">
                Note: Valid only on the specified date.
            </td>
        </tr>
    </tfoot>
</table>

<div class="continuation-page">
    <table style="width:100%; border:none; border-collapse:collapse; margin-top:10px; font-size:12px; border-spacing:0;">
        <tr style="border: 0.8px solid #444;">
            <td style="width:40px; vertical-align:top; font-weight:bold; border:none;">Purpose:</td>
            <td style="text-align:justify; border:none;">
                {{ $offCampus->purpose ?? '—' }}
            </td>
        </tr>
    </table>

    <p class="remarks" style="margin-left:10px; text-align:justify; text-indent:40px; margin-top:10px;">
        Above item shall be returned on or before
        <strong><u>{{ $offCampus->return_date ? Carbon::parse($offCampus->return_date)->format('F d, Y') : '—' }}</u></strong>,
        the requester will be responsible for any damages incurred while the items are in his/her possession.
    </p>

    <table style="width:100%; border:none; border-collapse:collapse; margin-top:6px; font-size:12px; border-spacing:0;">
        <tr style="border:none;">
            <td style="vertical-align:top; font-weight:bold; border:none; width:50px; white-space:nowrap;">
                Remarks:
            </td>
            <td style="border:none; padding-left:2px;">
                Approved for release for:&nbsp;
                <span class="checkbox {{ $offCampus->remarks === 'official_use' ? 'checked' : '' }}"></span>
                <span style="font-weight:bold; text-transform:uppercase;">Official Use</span>
                &nbsp;&nbsp;
                <span class="checkbox {{ $offCampus->remarks === 'repair' ? 'checked' : '' }}"></span>
                <span style="font-weight:bold; text-transform:uppercase;">Repair</span>
            </td>
        </tr>
    </table>

    {{-- SIGNATORIES --}}
    <div class="signature-block">
        <table style="width:100%; border:none; border-collapse:collapse; text-align:center; font-size:12px;">
            <tr>
                {{-- Requester --}}
                <td style="width:50%; text-align:left; vertical-align:top; padding:10px;">
                    <p style="font-weight: bold;">Requester:</p>
                    <table style="width:100%; border:none;">
                        <tr>
                            <td class="sig-name">
                                <div class="name-box">
                                    <div class="signature-line"></div>
                                    <p style="font-weight:bold;">{{ strtoupper($offCampus->requester_name ?? '—') }}</p>
                                    <p style="font-size:11px;">Name of Personnel</p>
                                </div>
                                <span class="signature-placeholder">.</span>
                            </td>
                            <td class="sig-date">
                                <div class="date-box">
                                    <div class="signature-line"></div>
                                    <p class="date-text">Date</p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>

                {{-- Approved By --}}
                <td style="width:50%; text-align:left; vertical-align:top; padding:10px;">
                    <p style="font-weight: bold;">Approved By:</p>
                    <table style="width:100%; border:none;">
                        <tr>
                            <td class="sig-name">
                                <div class="name-box">
                                    <div class="signature-line"></div>
                                    @if($offCampus->approved_by_name)
                                    <p style="font-weight:bold;">{{ strtoupper($offCampus->approved_by_name) }}</p>
                                    <p style="font-size:11px;">Dean/Head Concerned</p>
                                    @else
                                    <p style="color:#888;">—</p>
                                    <p style="font-size:11px;">Dean/Head Concerned</p>
                                    @endif
                                </div>
                                <span class="signature-placeholder">.</span>
                            </td>
                            <td class="sig-date">
                                <div class="date-box">
                                    <div class="signature-line"></div>
                                    <p class="date-text">Date</p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr>
                {{-- Issued By --}}
                <td style="width:50%; text-align:left; vertical-align:top; padding:10px;">
                    <p style="font-weight: bold;">Issued By:</p>
                    <table style="width:100%; border:none;">
                        <tr>
                            <td class="sig-name">
                                <div class="name-box">
                                    <div class="signature-line"></div>
                                    @php $issued = $signatories['issued_by'] ?? null; @endphp
                                    @if($issued)
                                    <p style="font-weight:bold;">{{ strtoupper($issued->name ?? '—') }}</p>
                                    <p style="font-size:11px;">{{ $issued->title ?? 'Head, PMO' }}</p>
                                    @else
                                    <p style="color:#888;">—</p>
                                    <p style="font-size:11px;">Head, PMO</p>
                                    @endif
                                </div>
                                <span class="signature-placeholder">.</span>
                            </td>
                            <td class="sig-date">
                                <div class="date-box">
                                    <div class="signature-line"></div>
                                    <p class="date-text">Date</p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>

                {{-- Checked By --}}
                <td style="width:50%; text-align:left; vertical-align:top; padding:10px;">
                    <p style="font-weight: bold;">Checked By:</p>
                    <table style="width:100%; border:none;">
                        <tr>
                            <td class="sig-name">
                                <div class="name-box">
                                    <div class="signature-line"></div>
                                    <p style="font-weight:bold;">{{ strtoupper($offCampus->checked_by ?? '—') }}</p>
                                    <p style="font-size:11px;">Chief, Security Service</p>
                                </div>
                                <span class="signature-placeholder">.</span>
                            </td>
                            <td class="sig-date">
                                <div class="date-box">
                                    <div class="signature-line"></div>
                                    <p class="date-text">Date</p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</div>
@endsection