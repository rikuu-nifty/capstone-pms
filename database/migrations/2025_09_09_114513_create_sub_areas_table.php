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
        Schema::create('sub_areas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('building_room_id');
            $table->string('name');
            $table->string('description')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['building_room_id', 'name']);
            $table->foreign('building_room_id')->references('id')->on('building_rooms')->onDelete('cascade');
        });

        Schema::table('inventory_lists', function (Blueprint $table) {
            $table->unsignedBigInteger('sub_area_id')->nullable()->after('building_room_id');
            $table->index('sub_area_id');

            $table->foreign('sub_area_id')->references('id')->on('sub_areas')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_lists', function (Blueprint $table) {
            $table->dropIndex(['sub_area_id']);
            $table->dropForeign(['sub_area_id']);
            $table->dropColumn('sub_area_id');
        });

        Schema::dropIfExists('sub_areas');
    }
};
