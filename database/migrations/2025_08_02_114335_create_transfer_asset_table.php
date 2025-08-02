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
        Schema::create('transfer_asset', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('transfer_id');
            $table->unsignedBigInteger('asset_id');

            $table->timestamps();

            $table->foreign('transfer_id')->references('id')->on('transfers')->onDelete('cascade');
            $table->foreign('asset_id')->references('id')->on('inventory_lists')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::table('transfer_asset', function (Blueprint $table) {
            $table->dropForeign(['transfer_id']);
            $table->dropForeign(['asset_id']);
        });

        Schema::dropIfExists('transfer_asset');
    }
};
