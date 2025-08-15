<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('inventory_lists', function (Blueprint $table) {
           
            $table->foreignId('category_id')
                  ->nullable()
                  ->after('asset_model_id')
                  ->constrained('categories')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('inventory_lists', function (Blueprint $table) {
            
            $table->dropConstrainedForeignId('category_id');
        });
    }
};

