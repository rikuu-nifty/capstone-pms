<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('off_campus_assets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('off_campus_id')
                  ->constrained('off_campuses')
                  ->cascadeOnDelete();

            $table->foreignId('asset_id')
                  ->nullable()
                  ->constrained('inventory_lists')
                  ->nullOnDelete();

            $table->foreignId('asset_model_id')
                  ->nullable()
                  ->constrained('asset_models')
                  ->nullOnDelete();

            $table->unsignedInteger('quantity')->default(1);
            $table->string('units', 50)->default('pcs');
            $table->text('comments')->nullable();

            $table->softDeletes();
            $table->index('deleted_at');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('off_campus_assets', function (Blueprint $table) {
            $table->dropForeign('off_campus_id');
            $table->dropForeign('asset_id');
            $table->dropForeign('asset_model_id');
            $table->dropIndex('deleted_at');
        });

        Schema::dropIfExists('off_campus_assets');
    }
};

// You create an off-campus request (off_campuses.id = 5).
// You add 3 assets into off_campus_items with off_campus_id = 5.
//If later you delete the record with id = 5 in off_campuses, Laravel/MySQL will automatically delete those 3 rows in off_campus_items (because of cascadeOnDelete()).