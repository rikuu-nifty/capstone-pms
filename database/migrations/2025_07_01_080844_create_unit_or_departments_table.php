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
        Schema::create('unit_or_departments', function (Blueprint $table) {
            $table->id();

            // $table->unsignedBigInteger('inventory_schedule_id'); // Will add FK later

            $table->string('name', 255);
            $table->string('code', 20);
            $table->text('description')->nullable();
            $table->string('unit_head', 255);

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('unit_or_department_id')
                ->nullable()
                ->after('email')   // 👈 position column right after email
                ->constrained('unit_or_departments')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //     Schema::table('unit_or_departments', function (Blueprint $table) {
        //     $table->dropForeign(['inventory_schedule_id']);
        // });
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['unit_or_department_id']);
            $table->dropColumn('unit_or_department_id');
        });

        Schema::dropIfExists('unit_or_departments');
    }


};
