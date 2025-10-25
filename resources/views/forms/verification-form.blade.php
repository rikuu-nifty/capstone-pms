@extends('forms.layout')

@section('title', 'Verification Form #' . str_pad($verification->id, 3, '0', STR_PAD_LEFT))

@php
use Carbon\Carbon;
$vfNo = 'A-' . str_pad($verification->id, 3, '0', STR_PAD_LEFT);
$ay = '2025–2026';
@endphp

@section('header-right')
VF No. {{ $vfNo }}
@endsection

@section('hide-footer-text')
@endsection

@section('content')

{{-- ===== INFO SECTION ===== --}}
<div style="font-size:12px; margin-bottom:10px; margin-top:30px">
    <div style="display:flex; justify-content:space-between;">
        <div><strong>AY: {{ $ay }}</strong></div>
    </div>
    <p style="margin-top:3px; font-weight:bold;">
        <strong style="margin-right:10px;">Requester:</strong>
        {{ $verification->unitOrDepartment->name ?? '—' }}
    </p>
</div>

{{-- ===== ITEMS TABLE ===== --}}
<table style="width:100%; border-collapse:collapse; font-size:11px;">
    <thead>
        <tr style="background:#f2f2f2; border-bottom:1px solid #000; text-align:center;">
            <th style="padding:5px; width:15%; text-align:center;">DATE ACQUIRED</th>
            <th style="padding:5px; width:30%; text-align:center;">DESCRIPTION OF ITEM/S</th>
            <th style="padding:5px; width:15%; text-align:center;">PRICE</th>
            <th style="padding:5px; width:15%; text-align:center;">SUPPLIER</th>
            <th style="padding:5px; width:6%; text-align:center;">QTY</th>
            <th style="padding:5px; width:20%; text-align:center;">REMARKS</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($verification->verificationAssets as $line)
        @php $asset = $line->inventoryList; @endphp
        <tr style="border-top:1px solid #000; vertical-align:top;">
            <td style="text-align:center; padding:4px;">
                {{ $asset?->date_purchased ? Carbon::parse($asset->date_purchased)->format('n/j/Y') : '—' }}
            </td>
            <td style="padding:4px; word-wrap:break-word; white-space:normal;">
                <div style="font-weight:bold; margin-bottom:5px; font-size:12px;">
                    {{ $asset?->asset_name ?? '—' }}
                    @if ($asset?->serial_no)
                    <span style="font-size:11px;">sn: {{ $asset->serial_no }}</span>
                    @endif
                </div>

                @if ($verification->notes)
                <div style="font-size:11px; font-style:italic;">*{{ $verification->notes }}*</div>
                @endif
                <div style="font-size:11px; font-style:italic; margin-top:4px;">{{ $todayDate }}</div>
            </td>
            <td style="text-align:center; font-family:DejaVu Sans; padding:4px; font-size:10px; ">
                {{ $asset?->unit_cost ? '₱ ' . number_format($asset->unit_cost, 2) : '—' }}
            </td>
            <td style="text-align:center; padding:4px; font-size:11px; ">
                {{ $asset?->supplier ?? '—' }}
            </td>
            <td style="text-align:center; padding:4px; font-size:11px; ">
                {{ $asset?->quantity ?? 1 }}
            </td>
            <td style="text-align:center; padding:4px; word-wrap:break-word; white-space:normal;">
                {{ $line->remarks ?? $verification->remarks ?? '—' }}
            </td>
        </tr>
        @empty
        <tr>
            <td colspan="6" style="text-align:center; font-style:italic; padding:10px;">
                No items found for this verification form.
            </td>
        </tr>
        @endforelse
    </tbody>
</table>

{{-- ===== SIGNATURE SECTION ===== --}}
<table style="width:100%; margin-top:50px; font-size:12px; border-collapse:separate; border-spacing:0; border:none;">
    <tr style="vertical-align:top;">
        <td style="width:30%; border:none; text-align:left; vertical-align:top;">
            <div style="margin-top:0;">
                <p style="margin-bottom:40px; margin-top:0; margin-left:50px;">Prepared by:</p>
                <div style="border-top:1px solid #000; width:70%; margin:auto;"></div>
                <p style="text-align:center; font-weight:bold; margin-top:3px; font-size:13px;">
                    {{ strtoupper($pmo_head['name'] ?? '—') }}
                </p>
                <p style="text-align:center; font-style:italic; font-size:11px; margin-top:-10px;">Head, PMO</p>
            </div>
        </td>

        <td style="width:30%; border:none; text-align:left; vertical-align:top;">
            <div style="margin-top:0;">
                <p style="margin-bottom:40px; margin-top:0; margin-left:50px;">Received copy by:</p>
                <div style="border-top:1px solid #000; width:70%; margin:auto;"></div>
            </div>
        </td>
    </tr>
</table>

@endsection