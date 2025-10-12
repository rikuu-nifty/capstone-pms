<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('detail');

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'userDetail' => $user->detail,
        ]);
    }

    /**
     * Update the user's profile settings.
     */
  public function update(Request $request): RedirectResponse
{
    $user = $request->user();
    $validated = $request->all();

    // ✅ Handle profile image upload to S3
    if ($request->hasFile('image')) {
        $file = $request->file('image');
        $original = $file->getClientOriginalName();
        $ext = $file->getClientOriginalExtension();
        $hash = sha1($original . microtime(true) . \Illuminate\Support\Str::random(16));
        $filename = "{$hash}.{$ext}";

        // Upload to S3 under 'user_profiles/' folder, public visibility
        $path = \Illuminate\Support\Facades\Storage::disk('s3')->putFileAs(
            'user_profiles',
            $file,
            $filename,
            'public'
        );

        // Save just the key (e.g., 'user_profiles/filename.jpg')
        $validated['image_path'] = $path;

        // 🧹 Delete old image from S3 if replaced
        if (
            !empty($user->detail?->image_path)
            && \Illuminate\Support\Facades\Storage::disk('s3')->exists($user->detail->image_path)
        ) {
            \Illuminate\Support\Facades\Storage::disk('s3')->delete($user->detail->image_path);
        }
    }

    // ✅ Always update name and email
    $user->fill([
        'name'  => $validated['name'] ?? $user->name,
        'email' => $validated['email'] ?? $user->email,
    ]);

    // Reset verification if email was changed
    if ($user->isDirty('email')) {
        $user->email_verified_at = null;
    }

    $user->save();

    // ✅ Update or create user detail record
    $user->detail()->updateOrCreate(
        ['user_id' => $user->id],
        [
            'first_name'  => $validated['first_name'] ?? $user->detail->first_name ?? null,
            'middle_name' => $validated['middle_name'] ?? $user->detail->middle_name ?? null,
            'last_name'   => $validated['last_name'] ?? $user->detail->last_name ?? null,
            'gender'      => $validated['gender'] ?? $user->detail->gender ?? null,
            'contact_no'  => $validated['contact_no'] ?? $user->detail->contact_no ?? null,
            'image_path'  => $validated['image_path'] ?? $user->detail->image_path ?? null,
        ]
    );

    // ✅ Force refresh of authenticated user instance (so Inertia gets updated avatar)
    auth()->setUser($user->load('detail')); // 👈 key line that reloads the user + relation

    // ✅ Redirect back with success message
    return to_route('profile.edit')
        ->with('success', 'Profile updated successfully.')
        ->with('force_refresh', true); // optional flag if you ever want to handle it in React
}


    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Optional: remove user's S3 profile photo
        if ($user->detail && $user->detail->image_path) {
            Storage::disk('s3')->delete($user->detail->image_path);
        }

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
