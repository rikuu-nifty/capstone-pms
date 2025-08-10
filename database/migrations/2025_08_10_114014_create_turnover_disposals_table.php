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
        Schema::create('turnover_disposals', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('issuing_office_id');
            $table->enum('type', ['turnover', 'disposal']);
            $table->unsignedBigInteger('receiving_office_id');
            $table->text('description')->nullable(); // keep to describe reason
            $table->unsignedBigInteger('personnel_in_charge_id'); //who the asset was assigned to
            $table->date('document_date'); // date written on the signed form
            $table->enum('status', ['pending_review', 'approved', 'rejected', 'cancelled', 'completed']);
            $table->text('remarks')->nullable(); //use for ongoing notes or updates

            $table->timestamps();

            $table->foreign('issuing_office_id')->references('id')->on('unit_or_departments')->onDelete('cascade');
            $table->foreign('receiving_office_id')->references('id')->on('unit_or_departments')->onDelete('cascade');
            $table->foreign('personnel_in_charge_id')->references('id')->on('asset_assignments')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('turnover_disposals', function (Blueprint $table) {
            $table->dropForeign(['issuing_office_id']);
            $table->dropForeign(['receiving_office_id']);
            $table->dropForeign(['personnel_in_charge_id']);
        });

        Schema::dropIfExists('turnover_disposals');
    }
};
