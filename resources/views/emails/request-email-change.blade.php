@extends('emails.layout')

@section('title', 'Request to Update Your Email Address')

@section('content')
<h2>Email Update Request</h2>
<p>Hi <strong>{{ $name }}</strong>,</p>
<p>
    The <strong>Property Management Office (PMO)</strong> is requesting you to update your registered email address
    in the <strong>Tap & Track: Property Management System</strong>.
</p>
<p>
    This update is required to ensure your user record remains accurate and that you continue receiving
    official notifications related to property accountability and system access.
</p>

<div class="button-container">
    <a href="{{ $url }}" class="button">Update Email</a>
</div>

<p style="line-height:1.3;">
    <small><em>If you have already updated your email or believe this request is not applicable to you,
    please contact the PMO for verification.</em></small>
</p>
@endsection