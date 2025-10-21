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
        Schema::create('verification_forms', function (Blueprint $table) {
            $table->id();

            $table->foreignId('turnover_disposal_id')->constrained('turnover_disposals')->cascadeOnDelete();
            $table->foreignId('verified_by_id')->nullable()->constrained('users')->nullOnDelete();

            $table->date('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('remarks')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'verified_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verification_forms');
    }
};
