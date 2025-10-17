@php
use Carbon\Carbon;

$from = $filters['from'] ?? null;
$to = $filters['to'] ?? null;
$fromDate = $from ? Carbon::parse($from) : null;
$toDate = $to ? Carbon::parse($to) : null;

$reportPeriod = '—';
if ($fromDate && $toDate) $reportPeriod = $fromDate->format('F d, Y') . ' – ' . $toDate->format('F d, Y');
elseif ($fromDate) $reportPeriod = $fromDate->format('F d, Y') . ' – Present';
elseif ($toDate) $reportPeriod = 'Until ' . $toDate->format('F d, Y');

$totalItems = collect($donationSummary)->sum('quantity');
$totalCost = collect($donationSummary)->sum('total_cost');
@endphp

{{-- ================= HEADER ================= --}}
<tr>
    <td colspan="7" style="font-weight:bold; text-align:center; font-size:14px; padding:6px;">
        Office of the Administrative Services
    </td>
</tr>

<tr>
    <td colspan="7"></td>
</tr> {{-- spacer --}}

{{-- Report Details --}}
<tr>
    <td style="font-weight:bold;">Report Title:</td>
    <td colspan="2">Donation Summary Report</td>
    <td style="font-weight:bold;">Date Range:</td>
    <td colspan="3">{{ $reportPeriod }}</td>
</tr>
<tr>
    <td style="font-weight:bold;">Generated:</td>
    <td colspan="6">{{ now()->format('F d, Y') }}</td>
</tr>

<tr>
    <td colspan="7"></td>
</tr>

{{-- ================= MAIN TABLE ================= --}}
<table>
    <thead>
        <tr>
            <th>RECORD #</th>
            <th>DATE OF DONATION</th>
            <th>ISSUING OFFICE (SOURCE)</th>
            <th>DESCRIPTION OF ITEMS</th>
            <th>QUANTITY</th>
            <th>TOTAL COST</th>
            <th>REMARKS</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($donationSummary as $r)
        <tr>
            <td>{{ $r->record_id }}</td>
            <td>{{ $r->document_date ? Carbon::parse($r->document_date)->format('M d, Y') : '—' }}</td>
            <td>{{ $r->issuing_office ?? '—' }}</td>
            <td>
                @if($r->turnover_category)
                <strong>{{ ucfirst(str_replace('_',' ',$r->turnover_category)) }}</strong><br>
                @endif
                {{ $r->description ?? '—' }}
            </td>
            <td>{{ $r->quantity }}</td>
            <td>₱ {{ number_format((float)$r->total_cost, 2) }}</td>
            <td>{{ $r->remarks ?? '—' }}</td>
        </tr>
        @empty
        <tr>
            <td colspan="7" style="text-align:center; padding:10px;">No donation records found.</td>
        </tr>
        @endforelse
    </tbody>
</table>

{{-- ================= SUMMARY ================= --}}
<tr>
    <td colspan="7"></td>
</tr>
<tr style="background:#e2e8f0; font-weight:bold;">
    <td colspan="7" style="text-align:center; padding:8px; font-size:13px;">SUMMARY</td>
</tr>
<tr>
    <td colspan="7" style="text-align:right; font-weight:bold;">
        Total Items Donated: {{ number_format($totalItems) }}
    </td>
</tr>
<tr>
    <td colspan="7" style="text-align:right; font-weight:bold;">
        Grand Total Cost: ₱ {{ number_format($totalCost, 2) }}
    </td>
</tr>