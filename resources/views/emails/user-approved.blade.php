@extends('emails.layout')

@section('title', 'Account Approved')

@section('content')
<h2>Account Approved</h2>
<p>Hi <strong>{{ $name }}</strong>,</p>
<p>Good news! Your account has been <strong>Approved</strong>.</p>
<p>You can now log in and start using the Tap & Track Property Management System.</p>

@if(!empty($notes))
<p><strong>Notes:</strong> {{ $notes }}</p>
@endif

<div class="button-container">
    <a href="{{ $url }}" class="button">Go to Dashboard</a>
</div>
@endsection