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
            $table->unsignedBigInteger('unit_or_department_id');
            $table->string('assigned_to'); //AKA personnel in charge
            $table->unsignedBigInteger('assigned_by'); //the current system user na nag input
            $table->date('date_assigned');
            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->foreign('asset_id')->references('id')->on('inventory_lists')->onDelete('cascade');
            $table->foreign('unit_or_department_id')->references('id')->on('unit_or_departments')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_assignments', function (Blueprint $table) {
            $table->dropForeign(['asset_id']);
            $table->dropForeign(['unit_or_department_id']);
            $table->dropForeign(['assigned_by']);
        });

        Schema::dropIfExists('asset_assignments');
    }
};
