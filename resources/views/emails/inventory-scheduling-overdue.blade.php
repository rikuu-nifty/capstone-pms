@extends('emails.layout')

@section('title', 'Inventory Scheduling Overdue')

@section('content')
<h2>Inventory Scheduling Overdue</h2>

<p>Dear <strong>{{ $name }}</strong>,</p>

<p>
    This is to notify you that <strong>Inventory Scheduling #{{ $schedule_id }}</strong>
    has been marked as <strong style="color:#D32F2F;">OVERDUE</strong>.
</p>

<p>
    <strong>Scheduled For:</strong> {{ $scheduled_for }}<br>
    <strong>Days Overdue:</strong> {{ $days_overdue }} day{{ $days_overdue != 1 ? 's' : '' }}<br>
    <strong>Current Status:</strong> {{ $status }}
</p>

<p>
    Please take the necessary action to update or complete this inventory schedule
    as soon as possible to maintain accurate asset tracking and reporting.
</p>

<div class="button-container">
    <a href="{{ $url }}" class="button">View Inventory Schedule</a>
</div>

<p>
    Thank you for your attention to this matter.
</p>
@endsection