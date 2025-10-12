<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('detail');

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
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

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('user_profiles', 'public');
            $validated['image_path'] = $path;
        } 
        elseif ($request->boolean('remove_image')) {
            if ($user->detail && $user->detail->image_path) {
                Storage::disk('public')->delete($user->detail->image_path);
            }
            $validated['image_path'] = null;
        }

        // Save basic user info
        $user->fill([
            'name'  => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // dd($validated, $user->getDirty());

        $user->save();

        $user->detail()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'first_name'  => $validated['first_name'] ?? $user->detail->first_name ?? null,
                'middle_name' => $validated['middle_name'] ?? $user->detail->middle_name ?? null,
                'last_name'   => $validated['last_name'] ?? $user->detail->last_name ?? null,
                'gender'      => $validated['gender'] ?? $user->detail->gender ?? null,
                'contact_no'  => $validated['contact_no'] ?? $user->detail->contact_no ?? null,

                'image_path'  => $request->boolean('remove_image')
                    ? null
                    : ($validated['image_path'] ?? $user->detail->image_path ?? null),
            ]
        );

        return to_route('profile.edit')->with('success', 'Profile updated successfully.');
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

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function removeImage(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->detail && $user->detail->image_path) {
            // Delete from storage
            Storage::disk('public')->delete($user->detail->image_path);

            // Set image_path to null
            $user->detail->update(['image_path' => null]);
        }

        return back()->with('success', 'Profile image removed successfully.');
    }
}
