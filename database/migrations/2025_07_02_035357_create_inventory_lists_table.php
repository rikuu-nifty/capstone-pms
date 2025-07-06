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
            $table->id();
            $table->integer('memorandum_no');
            $table->integer('asset_model_id');// Asset Model ID   // Dapat hindi ID, cause it should come from another table which is Model
            $table->string('asset_name');
            $table->text('description')->nullable();
            $table->integer('organization_id')->nullable();
            $table->string('building')->nullable();
            $table->string('building_room')->nullable();
            $table->text('serial_no');  
            $table->string('supplier');
            $table->decimal('unit_cost', 10, 2);

            $table->string('brand')->nullable();
            $table->date('date_purchased')->nullable();
            $table->string('asset_type');
            $table->integer('quantity');
            $table->string('unit_or_department')->nullable();	
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->enum('transfer_status', ['not_transferred', 'transferred', 'pending'])->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_lists');
    }
};
