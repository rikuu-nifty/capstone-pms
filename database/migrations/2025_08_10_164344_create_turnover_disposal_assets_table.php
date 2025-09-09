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
        Schema::create('turnover_disposal_assets', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedBigInteger('turnover_disposal_id');
            $table->unsignedBigInteger('asset_id');

            $table->enum('asset_status', [
                'pending',
                'completed',
                'cancelled',
            ])
            ->default('pending');

            $table->date('date_finalized')->nullable();
            $table->text('remarks')->nullable();

            $table->timestamps();
            // $table->softDeletes();

            $table->foreign('turnover_disposal_id')->references('id')->on('turnover_disposals')->onDelete('cascade');
            $table->foreign('asset_id')->references('id')->on('inventory_lists')->onDelete('cascade');
            $table->index(['asset_id', 'asset_status']);
            $table->unique(['turnover_disposal_id', 'asset_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('turnover_disposal_assets', function (Blueprint $table) {
            $table->dropForeign(['turnover_disposal_id']);
            $table->dropForeign(['asset_id']);
            $table->dropSoftDeletes();
        });

        Schema::dropIfExists('turnover_disposal_assets');
    }
};
