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
        Schema::create('personnels', function (Blueprint $table) {
            $table->id();

            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');

            $table->unsignedBigInteger('user_id')->nullable(); // added just in case pmo wants personnel become users

            $table->string('position')->nullable();
            $table->unsignedBigInteger('unit_or_department_id')->nullable(); //just in case for the view own unit permission
            $table->enum('status', ['active', 'inactive', 'left_university'])->default('active'); //inactive for on leave and left_university

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('unit_or_department_id')->references('id')->on('unit_or_departments')->nullOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personnels');
    }
};
