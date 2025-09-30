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
            $table->string('image_path')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'archived'])->default('archived');

            $table->unsignedBigInteger('unit_or_department_id')->nullable(); // Done FK UNIT_OR_DEPARTMENT Table
            $table->foreign('unit_or_department_id')
                  ->references('id')
                  ->on('unit_or_departments')
                  ->onDelete('set null'); 

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

            // ✅ NEW: Sub Area
            $table->unsignedBigInteger('sub_area_id')->nullable();
            $table->foreign('sub_area_id')
                  ->references('id')
                  ->on('sub_areas')
                  ->nullOnDelete();

            $table->foreignId('category_id')
                  ->nullable()
                  ->constrained('categories')
                  ->nullOnDelete();
    
            $table->text('serial_no');  
            $table->string('supplier');
            $table->decimal('unit_cost', 10, 2);

            // ✅ New field: Depreciation value for assets
            $table->decimal('depreciation_value', 10, 2)->nullable();

            $table->date('date_purchased')->nullable();
            $table->date('maintenance_due_date')->nullable();
            $table->string('asset_type');
            $table->integer('quantity');

            // ✅ New field: Assigned To 
            $table->unsignedBigInteger('transfer_id')->nullable();

            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->foreign('assigned_to')
                ->references('id')
                ->on('personnels')
                ->nullOnDelete();

            $table->timestamps();
            
            $table->softDeletes();
            $table->unsignedBigInteger('deleted_by_id')->nullable(); // who deleted
            $table->foreign('deleted_by_id')->references('id')->on('users')->nullOnDelete();

            //index for fast query inventory_lists table - asset_model_id and deleted_at
            $table->index(['asset_model_id', 'deleted_at'], 'inventory_lists_assetmodel_deleted_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_lists', function (Blueprint $table) {
            $table->dropForeign(['asset_model_id']);           
            $table->dropForeign(['unit_or_department_id']);    
            $table->dropForeign(['building_id']);              
            $table->dropForeign(['building_room_id']);         
            $table->dropForeign(['sub_area_id']);              // ✅ NEW
            $table->dropForeign(['assigned_to']);              // ✅ make sure to drop too
            $table->dropForeign(['deleted_by_id']);            
            $table->dropIndex('inventory_lists_assetmodel_deleted_idx');
        });

        Schema::dropIfExists('inventory_lists'); 
    }
};
    