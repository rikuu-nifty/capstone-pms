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

            $table->unsignedBigInteger('asset_id');
            $table->enum('type', ['turnover', 'disposal']);
            $table->text('description')->nullable(); // keep to describe reason
            $table->string('personnel_in_charge'); //who the asset was assigned to
            $table->date('document_date'); // date written on the signed form
            $table->enum('status', ['pending_review', 'approved', 'rejected', 'cancelled', 'completed']);
            $table->unsignedBigInteger('issued_by');
            $table->text('remarks')->nullable(); //use for ongoing notes or updates

            $table->timestamps();

            $table->foreign('asset_id')->references('id')->on('inventory_lists')->onDelete('cascade');
            $table->foreign('issued_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('turnover_disposals', function (Blueprint $table) {
            $table->dropForeign(['asset_id']);
            $table->dropForeign(['issued_by']);
        });

        Schema::dropIfExists('turnover_disposals');
    }
};
