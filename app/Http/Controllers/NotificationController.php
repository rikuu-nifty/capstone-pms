<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * List notifications with filters (all, unread, archived)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $filter = $request->query('filter', 'all');

        if ($filter === 'unread') {
            $query = $user->notifications()->where('status', 'unread');
        } elseif ($filter === 'archived') {
            $query = $user->notifications()->where('status', 'archived');
        } else {
            $query = $user->notifications();
        }

        return Inertia::render('notifications/index', [
            'notifications' => $query->latest()->paginate(10),
            'filter' => $filter,
            'counts' => [
                'all' => $user->notifications()->count(),
                'unread' => $user->notifications()->where('status', 'unread')->count(),
                'archived' => $user->notifications()->where('status', 'archived')->count(),
            ],
        ]);
    }

    /**
     * Mark all unread as read
     */
    public function markAllRead(Request $request)
    {
        $user = $request->user();

        $user->notifications()->where('status', 'unread')->get()->each(function ($notification) {
            $notification->update([
                'status' => 'read',
                'read_at' => now(),
            ]);
        });

        return redirect()->route('notifications.index', [
            'filter' => $request->query('filter', 'all'),
        ]);
    }

    /**
     * Mark as unread
     */
    public function markUnread(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);

        $notification->update([
            'status' => 'unread',
            'read_at' => null,
        ]);

        return redirect()->route('notifications.index', [
            'filter' => $request->query('filter', 'all'),
        ]);
    }

    /**
     * Mark as read
     */
    public function markRead(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);

        $notification->update([
            'status' => 'read',
            'read_at' => now(),
        ]);

        return redirect()->route('notifications.index', [
            'filter' => $request->query('filter', 'all'),
        ]);
    }

    /**
     * Archive a notification
     */
    public function archive(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);

        $notification->update(['status' => 'archived']);

        return redirect()->route('notifications.index', [
            'filter' => $request->query('filter', 'all'),
        ]);
    }

    /**
     * Delete a notification permanently
     */
    public function destroy(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->delete();

        return redirect()->route('notifications.index', [
            'filter' => $request->query('filter', 'all'),
        ]);
    }

    /**
     * Dismiss from dropdown (same as archive)
     */
    public function dismiss(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);

        $notification->update(['status' => 'archived']);

        return redirect()->route('notifications.index', [
            'filter' => $request->query('filter', 'all'),
        ]);
    }
}
