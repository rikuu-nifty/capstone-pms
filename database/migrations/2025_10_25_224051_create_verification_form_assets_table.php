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
        Schema::create('verification_form_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('verification_form_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_list_id')->constrained('inventory_lists');
            $table->string('remarks')->nullable();

            $table->timestamps();

            $table->unique(['verification_form_id', 'inventory_list_id'], 'vf_assets_uq');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verification_form_assets');
    }
};
