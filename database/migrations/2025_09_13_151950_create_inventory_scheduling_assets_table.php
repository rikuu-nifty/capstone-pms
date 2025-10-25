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
        Schema::create('inventory_scheduling_assets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('inventory_scheduling_id')->constrained('inventory_schedulings')->cascadeOnDelete();
            $table->foreignId('inventory_list_id')->constrained('inventory_lists')->cascadeOnDelete();

            $table->enum('inventory_status', [ 'scheduled', 'inventoried', 'not_inventoried', 'missing' ])->default('scheduled');

            $table->text('remarks')->nullable();
            $table->timestamp('inventoried_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_scheduling_assets');
    }
};
