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
        Schema::create('unit_change_logs', function (Blueprint $table) {
            $table->id();

            // Polymorphic relationship: can link to Personnel or InventoryList
            $table->morphs('assignable'); // creates assignable_id + assignable_type

            $table->unsignedBigInteger('old_unit_id')->nullable();
            $table->unsignedBigInteger('new_unit_id');
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->timestamp('changed_at')->useCurrent();

            $table->timestamps();
            // no soft deletes (audit log must be immutable)

            $table->foreign('old_unit_id')->references('id')->on('unit_or_departments')->nullOnDelete();
            $table->foreign('new_unit_id')->references('id')->on('unit_or_departments')->cascadeOnDelete();
            $table->foreign('changed_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_change_logs');
    }
};
