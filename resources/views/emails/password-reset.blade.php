@extends('emails.layout')

@section('title', 'Password Reset')

@section('content')
<h2>Password Reset Notification</h2>
<p>Hi <strong>{{ $name }}</strong>,</p>

@if(!empty($newPassword))
{{-- Case: Admin or System-Initiated Reset --}}
<p>
    This is to inform you that your account password for the
    <strong>Tap & Track: Property Management System</strong> has been reset.
</p>

<p>
    This may have been done upon your request, or as part of the
    Property Management Office’s regular account security maintenance.
</p>

<p>
    New Password: <strong>{{ $newPassword }}</strong>
</p>

<p>
    For your protection, please log in to your account and change this temporary password as soon as possible.
</p>

<div class="button-container">
    <a href="{{ $url }}" class="button">Log In to System</a>
</div>

@else
{{-- Case: User-Initiated “Forgot Password” --}}
<p>
    We received a request to reset your password for the
    <strong>Tap & Track: Property Management System</strong>.
</p>

<p>
    Click the button below to set a new password. This link will expire shortly for security reasons.
</p>

<div class="button-container">
    <a href="{{ $url }}" class="button">Reset Password</a>
</div>

@endif

<p style="line-height:1.3;">
    <small><em>If you did not expect this password reset, please contact the Property Management Office (PMO) immediately.</em></small>
</p>
@endsection