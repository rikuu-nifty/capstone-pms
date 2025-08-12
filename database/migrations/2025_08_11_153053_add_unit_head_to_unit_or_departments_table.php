<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('unit_or_departments', function (Blueprint $table) {
            $table->string('unit_head')->after('code');
        });

        DB::table('unit_or_departments')
        ->whereNull('unit_head')
        ->update(['unit_head' => 'Unit Head']);

        DB::statement("
            ALTER TABLE unit_or_departments
            MODIFY unit_head VARCHAR(255) NOT NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('unit_or_departments', function (Blueprint $table) {
            //
        });
    }
};
