@extends('emails.layout')

@section('title', $is_overdue ? 'Maintenance Overdue' : 'Maintenance Due Reminder')

@section('content')
<h2>{{ $is_overdue ? 'Maintenance Overdue Notice' : 'Maintenance Due Reminder' }}</h2>

<p>Hi <strong>{{ $name }}</strong>,</p>

@if ($is_overdue)
<p>
    The asset <strong>{{ $asset_name }}</strong> was scheduled for maintenance on
    <strong>{{ $due_date }}</strong> and is now <strong>{{ $days_overdue }}</strong>
    {{ Str::plural('day', $days_overdue) }} overdue.
</p>
<p>Please take immediate action to ensure this asset is serviced as soon as possible.</p>
@else
<p>
    The asset <strong>{{ $asset_name }}</strong> is due for maintenance on
    <strong>{{ $due_date }}</strong>.
</p>
<p>Please schedule the maintenance accordingly to prevent delays.</p>
@endif

<div class="button-container">
    <a href="{{ $url }}" class="button">View Asset</a>
</div>
@endsection