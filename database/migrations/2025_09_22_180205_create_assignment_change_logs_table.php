<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assignment_change_logs', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedBigInteger('asset_assignment_id');
            $table->unsignedBigInteger('changed_by'); // user who edited
            $table->json('old_values');              // snapshot before edit
            $table->json('new_values');              // snapshot after edit
            $table->timestamp('changed_at')->useCurrent();

            $table->timestamps();

            $table->foreign('asset_assignment_id')
                ->references('id')->on('asset_assignments')
                ->cascadeOnDelete();

            $table->foreign('changed_by')
                ->references('id')->on('users')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_change_logs');
    }
};
