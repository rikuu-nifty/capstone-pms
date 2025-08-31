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
        Schema::create('off_campuses', function (Blueprint $table) {
            $table->id();
            $table->string('requester_name');

            $table->unsignedBigInteger('college_or_unit_id')->nullable(); 
            $table->foreign('college_or_unit_id')
                  ->references('id')
                  ->on('unit_or_departments')
                  ->onDelete('set null');
            $table->index('college_or_unit_id');

            $table->text('purpose');
            $table->date('date_issued');
            $table->date('return_date')->nullable();

            $table->unsignedInteger('quantity'); // use unsigned to prevent negatives
            $table->string('units'); // PCS, SETS, UNIT, PAIR, DOZEN etc.

            $table->text('comments')->nullable();
            $table->enum('remarks', ['official_use', 'repair'])->default('official_use');
           
            $table->string('approved_by')->nullable();

            // Always PMO Head
            $table->unsignedBigInteger('issued_by_id')->nullable(); // FK Users_Table // Dito mo kukunin yun ISSUED_BY (pmo employees)
            $table->foreign('issued_by_id')->references('id')->on('users')->onDelete('set null');
            $table->index('issued_by_id'); // add index

            $table->string('checked_by')->nullable(); // Chief,Security Serivce
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();

            $table->softDeletes();
            $table->index('deleted_at');
            $table->unsignedBigInteger('deleted_by_id')->nullable();
            $table->foreign('deleted_by_id')->references('id')->on('users')->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('off_campuses', function (Blueprint $table) {
            $table->dropForeign(['college_or_unit_id']);    // Drop FK for unit/department
            // $table->dropForeign(['asset_id']);              // Drop FK for inventory_list
            // $table->dropForeign(['asset_model_id']);        // Drop FK for asset model
            $table->dropForeign(['issued_by_id']);          // Drop FK for user model

            // optional: drop indexes explicitly (MySQL usually handles with table drop)
            $table->dropIndex(['college_or_unit_id']);
            // $table->dropIndex(['asset_id']);
            // $table->dropIndex(['asset_model_id']);
            $table->dropIndex(['issued_by_id']);

            $table->dropForeign(['deleted_by_id']);
            $table->dropIndex(['deleted_at']);

            $table->dropForeign(['created_by_id']);
        });

        Schema::dropIfExists('off_campuses');
    }
};
