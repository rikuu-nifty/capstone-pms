@extends('emails.layout')

@section('title', 'Role Reassigned')

@section('content')
<h2>Account Role Updated</h2>
<p>Hi <strong>{{ $name }}</strong>,</p>
<p>Your system role has been updated. Please review your new permissions and access rights below:</p>

<p>
    Previous Role: <strong>{{ $oldRoleName }}</strong> <br>
    New Role: <strong>{{ $newRoleName }}</strong>
</p>

<p>If you believe this change was made in error, please contact the administrator immediately.</p>

<div class="button-container">
    <a href="{{ $url }}" class="button">Go to Dashboard</a>
</div>
@endsection