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
        Schema::create('asset_assignments', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('asset_id');
            $table->unsignedBigInteger('personnel_id');

            $table->unsignedBigInteger('assigned_by')->nullable(); //nullable just in case of historical imports
            $table->date('date_assigned');
            $table->text('remarks')->nullable();

            $table->timestamps();
            //no soft deletes for audit trail

            $table->foreign('asset_id')->references('id')->on('inventory_lists')->cascadeOnDelete();
            $table->foreign('personnel_id')->references('id')->on('personnels')->cascadeOnDelete();
            $table->foreign('assigned_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_assignments');
    }
};
