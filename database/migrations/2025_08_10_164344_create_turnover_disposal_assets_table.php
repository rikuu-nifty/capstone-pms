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

            $table->timestamps();

            $table->foreign('turnover_disposal_id')->references('id')->on('turnover_disposals')->onDelete('cascade');
            $table->foreign('asset_id')->references('id')->on('inventory_lists')->onDelete('cascade');
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
        });

        Schema::dropIfExists('turnover_disposal_assets');
    }
};
