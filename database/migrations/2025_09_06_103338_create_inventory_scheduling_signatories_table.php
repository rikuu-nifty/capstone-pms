<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void {
        Schema::create('inventory_scheduling_signatories', function (Blueprint $table) {
            $table->id();
            $table->string('role_key')->unique(); // e.g. 'prepared_by', 'approved_by', 'received_by', 'noted_by'
            $table->string('name');               // Full name of the signatory
            $table->string('title');              // Position/role title
            $table->timestamps();
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
