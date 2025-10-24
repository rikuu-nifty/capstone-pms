@extends('forms.layout')

@section('hide-footer-text')
@endsection

@section('title', 'Verification Form #' . str_pad($verification->id, 3, '0', STR_PAD_LEFT))

@php
use Carbon\Carbon;
$ay = '2025–2026';
$formattedDate = $turnover->document_date
? Carbon::parse($turnover->document_date)->format('F d, Y')
: '—';
$vfNo = 'A-' . str_pad($verification->id, 3, '0', STR_PAD_LEFT);
@endphp

@section('header-right')
VF No. {{ $vfNo }}
@endsection

@section('content')
{{-- ===== FORM TITLE ===== --}}
<div style="text-align:center; margin-top:20px; margin-bottom:35px;">
    <h2 style="text-decoration:underline; font-size:15px; margin:0;">Verification Form</h2>
</div>

{{-- ===== INFO SECTION ===== --}}
<div style="font-size:12px; margin-bottom:-10px;">
    <div style="display:flex; justify-content:space-between;">
        <div><strong>AY {{ $ay }}</strong></div>
    </div>
    <div style="margin-top:2px; font-weight:bold;"><strong style="margin-right:10px">REQUESTER:</strong> {{ $turnover->issuingOffice->name ?? '—' }}</div>
</div>

{{-- ===== ITEMS TABLE ===== --}}
<table style="font-size:11px;">
    <thead>
        <tr class="spacer-row">
            <td colspan="6" style="height:10px; border:none;">
            </td>
        </tr>
        <tr class="text-center gray-bg">
            <th style="width:20%; text-align:center;">DATE ACQUIRED</th>
            <th style="width:35%; text-align:center;">DESCRIPTION OF ITEM/S</th>
            <th style="width:15%; text-align:center;">PRICE</th>
            <th style="width:15%; text-align:center;">SUPPLIER</th>
            <th style="width:5%; text-align:center;">QTY</th>
            <th style="width:35%; text-align:center;">REMARKS</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($turnover->turnoverDisposalAssets as $line)
        @php $asset = $line->assets; @endphp
        <tr>
            <td class="text-center">
                {{ $asset?->date_purchased ? Carbon::parse($asset->date_purchased)->format('n/j/Y') : '—' }}
            </td>
            <td>
                <div style="font-weight:bold; margin-bottom:10px; font-size:12px;">
                    {{ $asset->asset_name ?? '—' }}
                    @if ($asset?->serial_no)
                    <span style="font-size:10px;">sn: {{ $asset->serial_no }}</span>
                    @endif
                </div>
                @if ($asset?->assetModel)
                <div style="font-size:10px; margin-bottom:10px;">
                    {{ $asset->assetModel->brand ?? '' }} {{ $asset->assetModel->model ?? '' }}
                </div>
                @endif
                @if ($verification->notes)
                <div style="font-size:10px; font-style:italic; margin-top:2px;">
                    *{{ $verification->notes }}*
                </div>
                @endif
            </td>
            <td class="text-center" style="font-family: DejaVu Sans, sans-serif; font-size:9px;">
                {{ $asset?->unit_cost ? '₱ ' . number_format($asset->unit_cost, 2) : '—' }}
            </td>
            <td class="text-center">{{ $asset?->supplier ?? '—' }}</td>
            <td class="text-center">{{ $asset?->quantity ?? 1 }}</td>
            <td class="text-center" style="white-space:pre-line;">{{ $verification->remarks ?? '—' }}</td>

        </tr>
        @empty
        <tr>
            <td colspan="6" class="text-center italic" style="padding:10px;">
                No items found for this verification form.
            </td>
        </tr>
        @endforelse
    </tbody>
</table>

{{-- ===== SIGNATURE SECTION ===== --}}
<table style="width:100%; margin-top:50px; font-size:12px; border-collapse:collapse; border:none;">
    <tr>
        <td style="width:50%; vertical-align:top; text-align:left; border:none;">
            <p style="margin-bottom:40px; margin-left:50px;">Prepared by:</p>
            <div class="signature-line" style="margin-top:35px; border-top:1px solid #000; width:70%; margin:auto;"></div>
            <p style="font-weight:bold; text-align:center; margin-top:3px;">
                {{ strtoupper($pmo_head['name'] ?? '—') }}
            </p>
            <p style="text-align:center; font-style:italic; font-size:11px;">Head, PMO</p>
        </td>

        <td style="width:50%; vertical-align:top; text-align:left; border:none;">
            <p style="margin-bottom:40px; margin-left:50px;">Received copy by:</p>
            <div class="signature-line" style="margin-top:35px; border-top:1px solid #000; width:70%; margin:auto;"></div>
        </td>
    </tr>
</table>


@endsection