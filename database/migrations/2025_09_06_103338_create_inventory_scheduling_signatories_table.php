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
        Schema::create('inventory_scheduling_signatories', function (Blueprint $table) {
            $table->id();

            // To differentiate modules (inventory_scheduling, transfer, turnover_disposal, off_campus, etc.)
            $table->string('module_type')->default('inventory_scheduling');

            // Role key identifiers (internal keys)
            $table->string('role_key'); // e.g. 'prepared_by', 'approved_by', 'received_by', 'noted_by'

            // Person assigned
            $table->string('name');   // Full name of the signatory
            $table->string('title');  // Position/role title

            $table->timestamps();
            $table->softDeletes();

            // Ensure role_key is unique only within the same module
            $table->unique(['module_type', 'role_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_scheduling_signatories');
    }
};
