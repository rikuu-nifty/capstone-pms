@extends('emails.layout')

@section('title', 'Maintenance Overdue')

@section('content')
<h2>Maintenance Overdue Notice</h2>

<p>Hi <strong>{{ $name }}</strong>,</p>

<p>
    The asset <strong>{{ $asset_name }}</strong> was scheduled for maintenance on
    <strong>{{ $due_date }}</strong> and is now <strong>{{ $days_overdue }}</strong>
    {{ Str::plural('day', $days_overdue) }} overdue.
</p>

<p>Please take the necessary action immediately to prevent further delay in maintenance.</p>

<div class="button-container">
    <a href="{{ $url }}" class="button">View Asset</a>
</div>

<p style="margin-top: 24px;">
    If the maintenance has already been performed, kindly update the record in the system.
</p>
@endsection