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
            $table->string('asset_name');
            $table->string('brand')->nullable();
            $table->date('date_purchased')->nullable();
            $table->string('asset_type');
            $table->integer('quantity');
            $table->string('building')->nullable();
            $table->string('unit_or_department')->nullable();	
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->string('room')->nullable();
            $table->string('memorandum_no');
            $table->text('description')->nullable();
            $table->string('supplier');
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->text('serial_numbers');
            $table->string('model')->nullable();
            $table->enum('transfer_status', ['not_transferred', 'transferred', 'pending'])->default('not_transferred');
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
