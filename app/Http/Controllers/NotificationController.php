<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markAllRead(Request $request)
    {
        $user = $request->user();

        if ($user) {
            $user->unreadNotifications->markAsRead();
        }

        return back(); // redirect back to the same page
    }

    public function markRead(Request $request, $id)
{
    $user = $request->user();
    $notification = $user->notifications()->findOrFail($id);
    $notification->markAsRead();

    return back();
}

public function dismiss(Request $request, $id)
{
    $user = $request->user();
    $notification = $user->notifications()->findOrFail($id);
    $notification->delete(); // remove only this notification

    return back();
}
}
