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
        Schema::table('inventory_schedulings', function (Blueprint $table) {
            if (!Schema::hasColumn('inventory_schedulings', 'created_by_id')) {
                $table->unsignedBigInteger('created_by_id')
                    ->nullable()
                    ->after('id')
                    ->index()
                ;

                $table->foreign('created_by_id')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_schedulings', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_schedulings', 'created_by_id')) {
                $table->dropForeign(['created_by_id']);
            }
        });
    }
};
