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
        Schema::create('off_campus_signatories', function (Blueprint $table) {
            $table->id();
            $table->string('role_key'); // e.g. 'issued_by'
            $table->string('name');     // Full name of the signatory
            $table->string('title');    // e.g. Head, PMO
            $table->timestamps();

            $table->unique('role_key')->nulable(); // Ensure one row per role_key
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('off_campus_signatories');
    }
};
