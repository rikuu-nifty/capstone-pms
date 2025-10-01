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
        Schema::create('transfer_signatories', function (Blueprint $table) {
            $table->id();
            $table->string('role_key'); // e.g. 'approved_by'
            $table->string('name');     // Full name of the signatory
            $table->string('title');    // Position/role title (e.g. 'Head, Property Management')
            $table->timestamps();

            $table->unique('role_key'); // Ensure one row per role_key
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfer_signatories');
    }
};
