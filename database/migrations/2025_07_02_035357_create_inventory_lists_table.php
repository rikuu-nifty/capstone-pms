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
        Schema::create('inventory_lists', function (Blueprint $table) {
            $table->id(); // Primary Key (auto-increment)
            $table->integer('memorandum_no');
           

            $table->unsignedBigInteger('asset_model_id'); // Done FK ASSET MODEL Table
            $table->foreign('asset_model_id')
                  ->references('id')
                  ->on('asset_models')
                  ->onDelete('cascade');   // ->onDelete('set null'); 

            $table->string('asset_name');
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'archived'])->default('archived');

            $table->unsignedBigInteger('unit_or_department_id')->nullable(); // Done FK UNIT_OR_DEPARTMENT Table
            $table->foreign('unit_or_department_id')
                  ->references('id')
                  ->on('unit_or_departments')
                  ->onDelete('set null'); // The onDelete('set null') ensures that if a unit is deleted, the value becomes null instead of breaking the reference.

            $table->unsignedBigInteger('building_id')->nullable();  // Done FK BUILDING Table
            $table->foreign('building_id')
                  ->references('id')
                  ->on('buildings')
                  ->onDelete('set null');

            $table->unsignedBigInteger('building_room_id')->nullable(); // Done FK BUILDING_ROOM Table
            $table->foreign('building_room_id')
                  ->references('id')
                  ->on('building_rooms')
                  ->onDelete('set null');

            $table->text('serial_no');  
            $table->string('supplier');
            $table->decimal('unit_cost', 10, 2);

            $table->date('date_purchased')->nullable();
            $table->string('asset_type');
            $table->integer('quantity');
            $table->enum('transfer_status', ['not_transferred', 'transferred', 'pending'])->nullable();
            $table->timestamps();
            // $table->string('brand')->nullable(); ASSETMODEL Table
            // $table->string('unit_or_department')->nullable(); // Delete muna to dapat kasi tawagin yun fk na yun para siya yun lumabas UNIT_OR_DEPARTMENT Table
            
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_lists', function (Blueprint $table) {
            $table->dropForeign(['asset_model_id']);           // Drop FK for asset model
            $table->dropForeign(['unit_or_department_id']);    // Drop FK for unit/department
            $table->dropForeign(['building_id']);              // Drop FK for building
            $table->dropForeign(['building_room_id']);         // Drop FK for building room
        });

        Schema::dropIfExists('inventory_lists'); // Then drop the table
    }
};
