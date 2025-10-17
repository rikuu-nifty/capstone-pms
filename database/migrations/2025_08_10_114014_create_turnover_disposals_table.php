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
            $table->enum('turnover_category', ['sharps', 'breakages', 'chemical', 'hazardous', 'non_hazardous'])->nullable();

            $table->unsignedBigInteger('receiving_office_id')->nullable();
            $table->string('external_recipient')->nullable();

            $table->text('description')->nullable();
            $table->string('personnel_in_charge')->nullable();

            $table->unsignedBigInteger('personnel_id');

            $table->date('document_date');
            $table->enum('status', ['pending_review', 'approved', 'rejected', 'cancelled', 'completed']);
            $table->text('remarks')->nullable();
            $table->boolean('is_donation')->default(false);

            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('issuing_office_id')->references('id')->on('unit_or_departments')->onDelete('cascade');
            $table->foreign('receiving_office_id')->references('id')->on('unit_or_departments')->nullOnDelete();
            $table->foreign('personnel_id')->references('id')->on('personnels')->onDelete('cascade');
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
            $table->dropForeign(['created_by_id']);
            $table->dropSoftDeletes();
        });

        Schema::dropIfExists('turnover_disposals');
    }
};
