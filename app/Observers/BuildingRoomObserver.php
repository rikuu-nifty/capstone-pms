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
}
