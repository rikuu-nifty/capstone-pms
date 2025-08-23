<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth; 

class EnsureUserApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If not logged in, let 'auth' middleware handle it
        if (!$user) return $next($request);

        // Allow guests routes (login/register/otp/verification) to pass
        if ($request->routeIs([
            'login', 
            'register', 
            'password.*', 
            'verification.*',
            'otp.*',
            'logout',
            'approval.pending',
        ])) {
            return $next($request);
        }

        if ($user->status === 'denied') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Your account was denied. Contact the administrator.',
            ]);
        }

        // Not verified yet? (optional if you already gate elsewhere)
        if (is_null($user->email_verified_at)) {
            return redirect()->route('verification.notice')
                ->with('status', 'Please verify your email first.');
        }

        if ($user->status !== 'approved') {
            return redirect()->route('approval.pending')
                ->with('status', 'Your account is awaiting approval.');
        }

        return $next($request);
    }
}
