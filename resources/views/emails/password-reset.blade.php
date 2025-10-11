@extends('emails.layout')

@section('title', 'Password Reset')

@section('content')
<h2>Password Reset Notification</h2>
<p>Hi <strong>{{ $name }}</strong>,</p>
<p>
    This is to inform you that your account password for the
    <strong>Tap & Track Property Management System</strong> has been reset.
</p>

<p>
    This may have been done upon your request, or as part of the
    <strong>Property Management Office’s</strong> regular account security maintenance.
</p>

<p>
    <strong>New Password:</strong> {{ $newPassword }}
</p>

<p>
    For your protection, please log in to your account and change this temporary password as soon as possible.
</p>

<div class="button-container">
    <a href="{{ $url }}" class="button">Log In to System</a>
</div>

<p>If you did not expect this password reset, please contact the Property Management Office immediately.</p>
@endsection