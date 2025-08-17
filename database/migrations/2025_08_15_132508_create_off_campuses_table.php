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

            $table->unsignedBigInteger('college_or_unit_id')->nullable(); // Done FK UNIT_OR_DEPARTMENT Table
            $table->foreign('college_or_unit_id')
                  ->references('id')
                  ->on('unit_or_departments')
                  ->onDelete('set null'); // The onDelete('set null') ensures that if a unit is deleted, the value becomes null instead of breaking the reference.
            $table->index('college_or_unit_id'); // add index for faster joins

            $table->text('purpose');
            $table->date('date_issued'); // MM-DD-YYYY
            $table->date('return_date')->nullable(); // MM-DD-YYYY  // often not known at creation

            $table->unsignedInteger('quantity'); // use unsigned to prevent negatives
            $table->string('units'); // PCS, SETS, UNIT, PAIR, DOZEN etc.

            // Asset Name, Description, Serial Number
            // Pwede to kahit walang column na asset sa inventory_list table
            // $table->unsignedBigInteger('asset_id')->nullable(); // Done FK Inventory List Table
            // $table->foreign('asset_id')
            //       ->references('id')
            //       ->on('inventory_lists')
            //       ->onDelete('set null');
            // $table->index('asset_id'); // add index

            // // Brand and Model
            // $table->unsignedBigInteger('asset_model_id')->nullable(); // Done FK ASSET MODEL Table  // must be nullable if set null
            // $table->foreign('asset_model_id')
            //       ->references('id')
            //       ->on('asset_models')
            //       ->onDelete('set null');   // ->onDelete('set null'); 
            // $table->index('asset_model_id'); // add index

            $table->text('comments')->nullable();
            $table->enum('remarks', ['official_use', 'repair'])->default('official_use');
           
            $table->string('approved_by')->nullable(); // Dean/Head Concerned  // can be filled later

            // Pwede to kahit walang column na issued_by sa users table
            // Always PMO Head
            $table->unsignedBigInteger('issued_by_id')->nullable(); // FK Users_Table // Dito mo kukunin yun ISSUED_BY (pmo employees)
            $table->foreign('issued_by_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
            $table->index('issued_by_id'); // add index

            // Chief,Security Serivce
            $table->string('checked_by')->nullable(); // can be filled later

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('off_campuses', function (Blueprint $table) {
            // drop FKs first (your approach is correct)
            $table->dropForeign(['college_or_unit_id']);    // Drop FK for unit/department
            // $table->dropForeign(['asset_id']);              // Drop FK for inventory_list
            // $table->dropForeign(['asset_model_id']);        // Drop FK for asset model
            $table->dropForeign(['issued_by_id']);          // Drop FK for user model

            // optional: drop indexes explicitly (MySQL usually handles with table drop)
            $table->dropIndex(['college_or_unit_id']);
            // $table->dropIndex(['asset_id']);
            // $table->dropIndex(['asset_model_id']);
            $table->dropIndex(['issued_by_id']);
        });

        Schema::dropIfExists('off_campuses'); // Then drop the table
    }
};
