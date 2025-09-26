@php
use Carbon\Carbon;
$grouped = collect($records)->groupBy('issuing_office');
@endphp

<tr>
    <td colspan="12" style="font-weight:bold; text-align:center; font-size:14px; padding:6px;">
        Office of the Administrative Services
    </td>
</tr>
<tr>
    <td colspan="12"></td>
</tr>

{{-- Header row --}}
<tr style="background:#f0f0f0; font-weight:bold;">
    <th>#</th>
    <th>Type</th>
    <th>Issuing Office</th>
    <th>Receiving Office</th>
    <th>Asset Name</th>
    <th>Category</th>
    <th>Brand/Model</th>
    <th>Serial No.</th>
    <th>Building / Room</th>
    <th>Status</th>
    <th>Remarks</th>
    <th>Document Date</th>
</tr>

@php $rowNum = 1; @endphp

@foreach ($grouped as $office => $items)
{{-- Office header --}}
<tr>
    <td colspan="12" style="font-weight:bold; background:#eaeaea;">
        Issuing Office: {{ $office ?? '—' }}
    </td>
</tr>

@php $byMonth = $items->groupBy(fn($r) => $r->document_date ? Carbon::parse($r->document_date)->format('F Y') : 'Undated'); @endphp

@foreach ($byMonth as $month => $rows)
{{-- Month header --}}
<tr>
    <td colspan="12" style="font-style:italic; background:#f5f5f5; padding-left:20px;">
        {{ $month }}
    </td>
</tr>

@foreach ($rows as $r)
<tr>
    <td>{{ $rowNum++ }}</td>
    <td>{{ ucfirst($r->type) }}</td>
    <td>{{ $r->issuing_office ?? '—' }}</td>
    <td>{{ $r->receiving_office ?? '—' }}</td>
    <td>{{ $r->asset_name ?? '—' }}</td>
    <td>{{ $r->category ?? '—' }}</td>
    <td>{{ ($r->brand ?? '—') . ' / ' . ($r->model ?? '—') }}</td>
    <td>{{ $r->serial_no ?? '—' }}</td>
    <td>{{ ($r->building ?? '—') . ' / ' . ($r->room ?? '—') }}</td>
    <td>{{ ucfirst($r->asset_status ?? $r->td_status ?? '—') }}</td>
    <td>{{ $r->remarks ?? '—' }}</td>
    <td>{{ $r->document_date ? Carbon::parse($r->document_date)->format('M d, Y') : '—' }}</td>
</tr>
@endforeach
@endforeach
@endforeach

{{-- Totals --}}
@php
$totalTurnovers = collect($records)->where('type','turnover')->count();
$totalDisposals = collect($records)->where('type','disposal')->count();
$totalCompleted = collect($records)->where('asset_status','completed')->count();
@endphp

<tr>
    <td colspan="12" style="font-weight:bold; text-align:right; border-top:2px solid #000;">
        Total Turnovers: {{ $totalTurnovers }} |
        Total Disposals: {{ $totalDisposals }} |
        Completed: {{ $totalCompleted }}
    </td>
</tr>