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
        $table->id();

        $table->string('brand', 255)->nullable();
        $table->string('model')->nullable();

        $table->unsignedBigInteger('category_id')->nullable();
        $table->unsignedBigInteger('equipment_code_id')->nullable();

        $table->enum('status', ['active', 'is_archived'])->default('active');

        $table->timestamps();
        $table->softDeletes();
        
        $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null'); // Don't delete asset_models — just nullify the FK
        $table->foreign('equipment_code_id')->references('id')->on('equipment_codes')->nullOnDelete();

        $table->index(['category_id', 'deleted_at'], 'asset_models_category_deleted_idx');  //models_count per category + soft deletes
        $table->index(['category_id', 'brand', 'model'], 'asset_models_cat_brand_model_idx'); //eager-loading + ORDER BY brand, model within a category
        $table->index(['equipment_code_id'], 'asset_models_equipment_code_idx');
    });
}

    public function down(): void
    {
        Schema::table('asset_models', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropForeign(['equipment_code_id']);
            $table->dropIndex('asset_models_cat_brand_model_idx');
            $table->dropIndex('asset_models_category_deleted_idx');
        });
        
        Schema::dropIfExists('asset_models');
    }

};
