@php
use Carbon\Carbon;

/* ===== Filter Setup ===== */
$from = $filters['from'] ?? null;
$to = $filters['to'] ?? null;
$departmentName = $filters['department_name'] ?? '—';
$statusLabel = $filters['status_label'] ?? '—';

$fromDate = $from ? Carbon::parse($from) : null;
$toDate = $to ? Carbon::parse($to) : null;

$reportPeriod = '—';
if ($fromDate && $toDate) $reportPeriod = $fromDate->format('F d, Y') . ' – ' . $toDate->format('F d, Y');
elseif ($fromDate) $reportPeriod = $fromDate->format('F d, Y') . ' – Present';
elseif ($toDate) $reportPeriod = 'Until ' . $toDate->format('F d, Y');

/* ===== Group by Department ===== */
$grouped = collect($records)->groupBy(fn($r) => $r['department'] ?? 'Unassigned');
@endphp

{{-- ================= HEADER ================= --}}
<tr>
    <td colspan="6" style="font-weight:bold; text-align:center; font-size:14px; padding:6px;">
        Office of the Administrative Services
    </td>
</tr>

<tr>
    <td colspan="6"></td>
</tr>

{{-- ===== Report Details ===== --}}
<tr>
    <td style="font-weight:bold; width:22%;">Date Assigned:</td>
    <td style="width:28%;">{{ $reportPeriod }}</td>
    <td style="font-weight:bold; width:22%;">Date Generated:</td>
    <td colspan="3" style="width:28%;">{{ now()->format('F d, Y') }}</td>
</tr>
<tr>
    <td style="font-weight:bold;">Unit / Department:</td>
    <td>{{ $departmentName }}</td>
    <td style="font-weight:bold;">Personnel Status:</td>
    <td colspan="3">{{ $statusLabel }}</td>
</tr>
<tr>
    <td style="font-weight:bold;">Asset Category:</td>
    <td>{{ $filters['category_name'] ?? '—' }}</td>
    <td style="font-weight:bold;">Asset Status:</td>
    <td colspan="3">{{ ucfirst($filters['asset_status'] ?? '—') }}</td>
</tr>
<tr>
    <td colspan="6"></td>
</tr>

{{-- ================= MAIN TABLE ================= --}}
<table>
    <thead>
        <tr>
            <th>ASSIGNMENT ID</th>
            <th>PERSONNEL-IN-CHARGE</th>
            <th>STATUS</th>
            <th>PAST ASSETS</th>
            <th>CURRENT ASSETS</th>
            <th>Missing Assets</th>
        </tr>
    </thead>

    <tbody>
        @php
        $grandPast = 0;
        $grandCurrent = 0;
        $grandMissing = 0;
        @endphp

        @foreach ($grouped as $dept => $rows)
        {{-- Department Header --}}
        <tr>
            <td colspan="6">Unit / Department: {{ $dept }}</td>
        </tr>

        @php
        $deptPast = 0;
        $deptCurrent = 0;
        @endphp

        @foreach ($rows as $r)
        @php
        $deptPast += $r['past_assets_count'];
        $deptCurrent += $r['current_assets_count'];
        $grandPast += $r['past_assets_count'];
        $grandCurrent += $r['current_assets_count'];
        $grandMissing += $r['missing_assets_count'];
        @endphp
        <tr>
            <td>{{ $r['id'] }}</td>
            <td>{{ $r['full_name'] }}</td>
            <td>{{ ucwords(str_replace('_', ' ', strtolower($r['status']))) }}</td>
            <td>{{ $r['past_assets_count'] }}</td>
            <td>{{ $r['current_assets_count'] }}</td>
            <td>{{ $r['missing_assets_count'] }}</td>
        </tr>
        @endforeach

        {{-- Subtotal per Department --}}
        <tr>
            <td colspan="3" style="text-align:right; font-weight:bold;">
                Total for {{ $dept }}:
            </td>
            <td style="text-align:center;">{{ $deptPast }}</td>
            <td style="text-align:center;">{{ $deptCurrent }}</td>
            <td style="text-align:center;">{{ $grandMissing }}</td>
        </tr>
        @endforeach
    </tbody>
</table>