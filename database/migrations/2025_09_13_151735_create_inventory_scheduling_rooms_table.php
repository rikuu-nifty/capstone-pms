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
        Schema::create('inventory_scheduling_rooms', function (Blueprint $table) {
            $table->id();

            $table->foreignId('inventory_scheduling_id')->constrained('inventory_schedulings')->cascadeOnDelete();
            $table->foreignId('building_room_id')->constrained('building_rooms')->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_scheduling_rooms');
    }
};
