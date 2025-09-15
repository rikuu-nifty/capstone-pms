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
        Schema::create('inventory_scheduling_sub_areas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('inventory_scheduling_id')->constrained('inventory_schedulings')->cascadeOnDelete();
            $table->foreignId('sub_area_id')->constrained('sub_areas')->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_scheduling_sub_areas');
    }
};
