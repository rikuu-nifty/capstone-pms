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
    Schema::create('asset_models', function (Blueprint $table) {
        $table->id(); // Primary Key (auto-increment)

        $table->string('brand', 255)->nullable();
        $table->text('model')->nullable();

        $table->unsignedBigInteger('category_id')->nullable(); // Define the column first 
        $table->foreign('category_id')
              ->references('id')
              ->on('categories')
              ->onDelete('set null'); // Don't delete asset_models — just nullify the FK

        $table->enum('status', ['active', 'is_archived'])->default('active');

        $table->timestamps();
    });
}

    public function down(): void
{
        Schema::table('asset_models', function (Blueprint $table) {
            $table->dropForeign(['category_id']); // Drop the FK first
        });
        
        Schema::dropIfExists('asset_models'); // Then drop the table
}

};
