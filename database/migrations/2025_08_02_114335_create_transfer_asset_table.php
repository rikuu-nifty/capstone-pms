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
        Schema::create('transfer_assets', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('transfer_id');
            $table->unsignedBigInteger('asset_id');

            $table->date('moved_at')->nullable();
            $table->unsignedBigInteger('from_sub_area_id')->nullable();
            $table->unsignedBigInteger('to_sub_area_id')->nullable();
            $table->enum('asset_transfer_status', ['pending', 'completed', 'cancelled'])
                ->default('pending')
            ;
            $table->text('remarks')->nullable();

            $table->foreign('transfer_id')->references('id')->on('transfers')->onDelete('cascade');
            $table->foreign('asset_id')->references('id')->on('inventory_lists')->onDelete('cascade');
            $table->foreign('from_sub_area_id')->references('id')->on('sub_areas')->nullOnDelete();
            $table->foreign('to_sub_area_id')->references('id')->on('sub_areas')->nullOnDelete();

            $table->index(['asset_id', 'moved_at']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::table('transfer_assets', function (Blueprint $table) {
            $table->dropForeign(['transfer_id']);
            $table->dropForeign(['asset_id']);
        });

        Schema::dropIfExists('transfer_assets');
    }
};
