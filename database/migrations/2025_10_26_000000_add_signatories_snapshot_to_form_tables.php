<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['inventory_schedulings', 'transfers', 'turnover_disposals', 'off_campuses'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (!Schema::hasColumn($tableName, 'signatories_snapshot')) {
                    $table->json('signatories_snapshot')->nullable();
                }
            });
        }

        $this->backfill('inventory_schedulings', $this->snapshotFromTable('inventory_scheduling_signatories'));
        $this->backfill('transfers', $this->snapshotFromTable('transfer_signatories'));
        $this->backfill('turnover_disposals', $this->snapshotFromTable('turnover_disposal_signatories'));
        $this->backfill('off_campuses', $this->offCampusSnapshot());
    }

    public function down(): void
    {
        foreach (['inventory_schedulings', 'transfers', 'turnover_disposals', 'off_campuses'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (Schema::hasColumn($tableName, 'signatories_snapshot')) {
                    $table->dropColumn('signatories_snapshot');
                }
            });
        }
    }

    private function snapshotFromTable(string $tableName): array
    {
        return DB::table($tableName)
            ->whereNull('deleted_at')
            ->get(['role_key', 'name', 'title'])
            ->mapWithKeys(fn ($row) => [
                $row->role_key => [
                    'name' => $row->name,
                    'title' => $row->title,
                ],
            ])
            ->toArray();
    }

    private function offCampusSnapshot(): array
    {
        $snapshot = $this->snapshotFromTable('off_campus_signatories');

        if (!array_key_exists('issued_by', $snapshot)) {
            $pmoHeadRoleId = DB::table('roles')->where('code', 'pmo_head')->value('id');
            $pmoHeadName = $pmoHeadRoleId
                ? DB::table('users')->where('role_id', $pmoHeadRoleId)->where('status', 'approved')->value('name')
                : null;

            $snapshot['issued_by'] = [
                'name' => $pmoHeadName,
                'title' => 'Head, PMO',
            ];
        }

        return $snapshot;
    }

    private function backfill(string $tableName, array $snapshot): void
    {
        DB::table($tableName)
            ->whereNull('signatories_snapshot')
            ->update(['signatories_snapshot' => json_encode($snapshot)]);
    }
};
