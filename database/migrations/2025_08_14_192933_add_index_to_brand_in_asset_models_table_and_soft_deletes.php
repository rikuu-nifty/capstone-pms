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
        Schema::table('categories', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('asset_models', function (Blueprint $table) {
            $table->softDeletes();
            $table->index(['category_id', 'brand'], 'asset_models_category_id_brand_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_models', function (Blueprint $table) {
            $table->dropIndex('asset_models_category_id_brand_index');
            
            if (Schema::hasColumn('asset_models', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
