<?php

namespace App\Observers;

use App\Models\BuildingRoom;
use App\Traits\LogsAuditTrail;

class BuildingRoomObserver
{
    use LogsAuditTrail;

    public function created(BuildingRoom $room)
    {
        $this->logAction('create', $room, [], $room->toArray());
    }

    public function updated(BuildingRoom $room)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $room->getChanges()) && $room->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $room,
            $room->getOriginal(),
            $room->getChanges()
        );
    }

    public function deleted(BuildingRoom $room)
    {
        $this->logAction('delete', $room, $room->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(BuildingRoom $room)
    {
        $this->logAction(
            'restore',
            $room,
            [],
            $room->toArray()
        );
    }
}
