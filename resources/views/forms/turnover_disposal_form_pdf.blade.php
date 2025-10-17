@extends('forms.layout')

@section('title', 'Turnover / Disposal Form')

@push('styles')
    <style>
        .header {
            text-align: center;
            margin-bottom: 30px;
            margin-top: 20px;
        }

        .header h3 {
            font-size: 15px;
            font-weight: 700;
            text-decoration: underline;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
            /* margin-bottom: 10px; */
        }

        .info-table td {
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
            display: inline-block;
            border-bottom: 0.8px solid #000;
            padding: 0 5px 2px;
            min-width: 120px;
            max-width: 120px;
            text-align: center;
            font-size: 12px;
        }

        .auth-paragraph {
            font-size: 12px;
            text-align: justify;
            /* margin-top: -2px; */
            line-height: 1.6;
        }

        /* Checkbox styling */
        .checkbox {
            display: inline-block;
            width: 10px;
            height: 10px;
            border: 1px solid #000;
            vertical-align: middle;
            margin-top: 5px;
            /* margin-right: 4px; */
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

        .checkbox-label {
            font-weight: bold;
            text-transform: lowercase;
        }

        table.assets-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: -12px;
        }

        table.assets-table {
            page-break-inside: auto;
        }

        table.assets-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }

        table.assets-table td {
            vertical-align: top;
            word-wrap: break-word;
            white-space: normal;
        }

        table.assets-table th,
        table.assets-table td {
            border: 1px solid #000;
            padding: 5px 8px;
            text-align: center;
            vertical-align: middle;
        }

        table.assets-table th {
            font-weight: 600;
            background: #f3f3f3;
        }

        /* optional safety against partial pagination mismatches */
        /* table.assets-table td[rowspan],
        table.assets-table th[rowspan] {
            background: #fff;
            -webkit-print-color-adjust: exact;
        } */

        thead {
            display: table-header-group;
        }

        tfoot {
            display: table-row-group;
        }

        table.assets-table tr {
            page-break-inside: avoid;
        }

        .remarks {
            margin-top: 12px;
            font-size: 12px;
        }

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
            /* padding: 10px 15px; */
            padding: 0 15px;
        }

        .signature-line {
            border-top: 1px solid #000;
            width: 65%;
            margin-top: 25px;
            /* margin-bottom: 5px; */
            margin-left: 0;
            text-align: left;
        }

        .sig-name {
            width: 65%;
            text-align: left;
        }

        .sig-date {
            width: 30%;
            text-align: left;
            padding-left: 8mm;
        }

        .sig-date .date-box {
            position: relative;
            left: -40px;
            /* nudges left */
            /* optional, adjust vertically */
        }

        .name-box .signature-line {
            width: 80%;
            margin: 15px 0 -8px 0;
        }

        .date-box .signature-line {
            width: 100%;
            /* margin: 25px 0 6px 0; */
            margin-top: 15px;
        }

        .date-text {
            margin-top: -2px;
            text-align: center;
            font-size: 11px;
        }

        .page-break {
            page-break-before: always;
            break-before: page;
        }
    </style>
@endpush

@section('content')
    @php
        use Carbon\Carbon;
        // $perPage = 20;
        // $chunks = $assets->chunk($perPage);
        $chunks = collect([$assets]);
    @endphp



    <div class="header">
        <h3>Turnover / Disposal Form</h3>
    </div>

    {{-- DOCUMENT DATE ONLY --}}
    <table class="info-table">
        <tr>
            <td>
                <span class="label-text">Date:&nbsp;</span>
                <span class="value-line">
                    {{ $turnoverDisposal->document_date ? Carbon::parse($turnoverDisposal->document_date)->format('F d, Y') : '—' }}
                </span>
            </td>
        </tr>
    </table>

    {{-- AUTHORIZATION --}}
    <p class="auth-paragraph">
        This is to authorize Mr./Mrs.
        <strong><u>{{ strtoupper($turnoverDisposal->personnel->full_name ?? '_________________') }}</u></strong>
        of College/Unit
        <strong><u>{{ strtoupper($turnoverDisposal->issuingOffice->name ?? '_________________') }}</u></strong>
        to
        <span class="checkbox {{ $turnoverDisposal->type === 'turnover' ? 'checked' : '' }}"></span>
        <span class="checkbox-label">turnover</span>
        &nbsp;/&nbsp;
        <span class="checkbox {{ $turnoverDisposal->type === 'disposal' ? 'checked' : '' }}"></span>
        <span class="checkbox-label">dispose</span>
        the following properties/equipment as follows.
    </p>

    {{-- ASSETS TABLE --}}
    @foreach ($chunks as $chunk)
        <table class="assets-table">
            <thead>
                <tr class="spacer-row">
                    <td colspan="5" style="height:10px; border:none; border-bottom:1px solid #000; background:#fff;">
                    </td>
                </tr>
                <tr>
                    <th style="width:6%;">Quantity</th>
                    <th style="width:30%;">Items / Description</th>
                    <th style="width:20%;">Issuing Office</th>
                    <th style="width:20%;">Receiving Office</th>
                    <th style="width:24%;">Remarks</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($chunk as $index => $a)
                    <tr>
                        <td>1</td>
                        <td style="text-align:center; font-size:12px;">
                            {{ $a->asset_name ?? '—' }}
                            @if ($a->assetModel)
                                <br><small><strong>Brand: </strong>{{ $a->assetModel->brand ?? '—' }}, <strong>Model:
                                    </strong>{{ $a->assetModel->model ?? '—' }}</small>
                            @endif
                            @if ($a->serial_no)
                                <br><small><strong>Serial: </strong>{{ $a->serial_no }}</small>
                            @endif
                        </td>
                        <td class="office-cell">{{ $turnoverDisposal->issuingOffice->name ?? '—' }}</td>
                        <td class="office-cell">{{ $turnoverDisposal->receivingOffice->name ?? '—' }}</td>
                        <td style="text-align:left; line-height:1.4;">
                            @if (!empty($a->record_remarks))
                                <div style="margin-bottom:4px;">{{ $a->record_remarks }}</div>
                            @endif

                            @if (!empty($a->pivot_remarks))
                                <div style="margin-top:6px;">{{ $a->pivot_remarks }}</div>
                            @endif

                            @if (empty($a->pivot_remarks) && empty($a->record_remarks))
                                —
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endforeach

    <div class="page-break">
        {{-- SIGNATORIES --}}
        <div class="signature-block">
            <table style="width:100%; border:none; border-collapse:collapse; font-size:12px;">
                <tr>
                    <td style="width:50%; vertical-align:top; padding:10px;">
                        <table style="width:100%; border:none;">
                            <tr>
                                <td colspan="2" style="padding-bottom:6px;">
                                    <p style="font-size:12px;">Personnel In Charge:</p>
                                </td>
                            </tr>
                            <tr>
                                <td class="sig-name">
                                    <div class="name-box">
                                        <div class="signature-line"></div>
                                        <p style="font-weight:bold;">
                                            {{ strtoupper($turnoverDisposal->personnel->full_name ?? '—') }}</p>
                                        <p style="font-size:11px; margin-top:-8px">
                                            {{ $turnoverDisposal->personnel->position ?? 'PMO Staff' }}</p>
                                    </div>
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

                    <td style="width:50%; vertical-align:top; padding:10px;">
                        <table style="width:100%; border:none;">
                            <tr>
                                <td colspan="2" style="padding-bottom:6px;">
                                    <p style="font-size:12px;">Head / Unit:</p>
                                </td>
                            </tr>
                            <tr>
                                <td class="sig-name">
                                    <div class="name-box">
                                        <div class="signature-line"></div>
                                        @php $headUnit = $signatories['head_unit'] ?? null; @endphp
                                        @if ($headUnit && (!empty($headUnit['name']) || !empty($headUnit['title'])))
                                            <p style="font-weight:bold;">{{ strtoupper($headUnit['name'] ?? '—') }}</p>
                                            <p style="font-size:11px; margin-top:-8px;">
                                                {{ $headUnit['title'] ?? 'Head / Unit' }}</p>
                                        @else
                                            <p style="color:#888;">—</p>
                                            <p style="font-size:11px; margin-top:-8px;">Head / Unit</p>
                                        @endif
                                    </div>
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

                {{-- Second Row: Noted By + Approved By --}}
                <tr>
                    <td style="width:50%; vertical-align:top; padding:10px;">
                        <table style="width:100%; border:none;">
                            <tr>
                                <td colspan="2" style="padding-bottom:6px;">
                                    <p style="font-size:12px;">Noted By:</p>
                                </td>
                            </tr>
                            <tr>
                                <td class="sig-name">
                                    <div class="name-box">
                                        <div class="signature-line"></div>
                                        @if ($turnoverDisposal->noted_by_name)
                                            <p style="font-weight:bold;">{{ strtoupper($turnoverDisposal->noted_by_name) }}
                                            </p>
                                            <p style="font-size:11px; margin-top:-8px">
                                                {{ $turnoverDisposal->noted_by_title ?? 'Dean / Head' }}</p>
                                        @else
                                            <p style="color:#888;">—</p>
                                            <p style="font-size:11px; margin-top:-8px">Dean / Head</p>
                                        @endif
                                    </div>
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

                    <td style="width:50%; vertical-align:top; padding:10px;">
                        <table style="width:100%; border:none;">
                            <tr>
                                <td colspan="2" style="padding-bottom:6px;">
                                    <p style="font-size:12px;">Approved By:</p>
                                </td>
                            </tr>
                            <tr>
                                <td class="sig-name">
                                    <div class="name-box">
                                        <div class="signature-line"></div>
                                        @php $approved = $signatories['approved_by'] ?? null; @endphp
                                        @if ($approved)
                                            <p style="font-weight:bold;">{{ strtoupper($approved->name ?? '—') }}</p>
                                            <p style="font-size:11px; margin-top:-8px">Head, PMO</p>
                                        @else
                                            <p style="color:#888;">—</p>
                                            <p style="font-size:11px;">Head, PMO</p>
                                        @endif
                                    </div>
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
