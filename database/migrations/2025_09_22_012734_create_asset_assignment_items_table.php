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
        Schema::create('asset_assignment_items', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('asset_assignment_id');
            $table->unsignedBigInteger('asset_id');

            $table->date('date_assigned');

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('asset_assignment_id')->references('id')->on('asset_assignments')->cascadeOnDelete();
            $table->foreign('asset_id')->references('id')->on('inventory_lists')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_assignment_items');
    }
};
